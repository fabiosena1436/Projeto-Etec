-- Manual sponsorship management. No administrator is granted by this migration.
BEGIN;
CREATE TABLE IF NOT EXISTS public.platform_admins (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.sponsorships (
  company_id uuid PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','ativo','pausado','cancelado')),
  payment_status text NOT NULL DEFAULT 'pendente' CHECK(payment_status IN ('pendente','recebido','atrasado')),
  monthly_amount numeric(10,2) NOT NULL DEFAULT 0 CHECK(monthly_amount BETWEEN 0 AND 100000),
  starts_at date NOT NULL DEFAULT current_date,
  expires_at date,
  internal_notes text NOT NULL DEFAULT '' CHECK(length(internal_notes)<=2000),
  updated_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(expires_at IS NULL OR expires_at>=starts_at)
);
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.platform_admins a JOIN public.profiles p ON p.id=a.profile_id
 WHERE a.profile_id=auth.uid() AND a.is_active AND p.is_active);
$$;
CREATE OR REPLACE FUNCTION public.is_current_sponsor(company_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.companies c WHERE c.id=company_uuid AND c.is_sponsor
 AND (c.sponsor_expires_at IS NULL OR c.sponsor_expires_at>now())
 AND NOT EXISTS(SELECT 1 FROM public.sponsorships s WHERE s.company_id=c.id
 AND (s.status<>'ativo' OR s.payment_status<>'recebido' OR s.starts_at>current_date)));
$$;
CREATE OR REPLACE FUNCTION public.admin_dashboard()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Acesso exclusivo do superadministrador'; END IF;
 RETURN jsonb_build_object(
 'totals',jsonb_build_object('users',(SELECT count(*) FROM profiles),'companies',(SELECT count(*) FROM companies),
 'sponsors',(SELECT count(*) FROM companies WHERE public.is_current_sponsor(id)),
 'monthly_revenue',(SELECT coalesce(sum(monthly_amount),0) FROM sponsorships WHERE public.is_current_sponsor(company_id))),
 'companies',(SELECT coalesce(jsonb_agg(to_jsonb(c)),'[]'::jsonb) FROM (SELECT id,name,industry,city,contact_email,phone,is_verified,is_sponsor,sponsor_expires_at,owner_profile_id FROM companies ORDER BY created_at DESC LIMIT 500) c),
 'users',(SELECT coalesce(jsonb_agg(to_jsonb(p)),'[]'::jsonb) FROM (SELECT id,full_name,email,role,is_verified,is_active,created_at FROM profiles ORDER BY created_at DESC LIMIT 500) p),
 'sponsorships',(SELECT coalesce(jsonb_agg(to_jsonb(s)),'[]'::jsonb) FROM (SELECT * FROM sponsorships ORDER BY updated_at DESC LIMIT 500) s),
 'audit',(SELECT coalesce(jsonb_agg(to_jsonb(a)),'[]'::jsonb) FROM (SELECT action,entity_type,entity_id,created_at FROM audit_logs WHERE action LIKE 'admin_%' ORDER BY created_at DESC LIMIT 30) a));
END $$;
CREATE OR REPLACE FUNCTION public.admin_save_sponsorship(company_uuid uuid, sponsorship_status text, payment_state text,
 amount numeric, start_date date, end_date date, notes text DEFAULT '')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old_record jsonb; new_record jsonb;
BEGIN
 IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Acesso exclusivo do superadministrador'; END IF;
 PERFORM 1 FROM companies WHERE id=company_uuid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Empresa não encontrada'; END IF;
 IF sponsorship_status='ativo' AND (end_date IS NULL OR end_date<current_date OR start_date>current_date OR payment_state<>'recebido') THEN
   RAISE EXCEPTION 'Para ativar, registre o recebimento e um período vigente com data de término'; END IF;
 SELECT to_jsonb(s) INTO old_record FROM sponsorships s WHERE company_id=company_uuid;
 INSERT INTO sponsorships(company_id,status,payment_status,monthly_amount,starts_at,expires_at,internal_notes,updated_by)
 VALUES(company_uuid,sponsorship_status,payment_state,amount,start_date,end_date,coalesce(notes,''),auth.uid())
 ON CONFLICT(company_id) DO UPDATE SET status=excluded.status,payment_status=excluded.payment_status,monthly_amount=excluded.monthly_amount,
 starts_at=excluded.starts_at,expires_at=excluded.expires_at,internal_notes=excluded.internal_notes,updated_by=auth.uid(),updated_at=now();
 UPDATE companies SET is_sponsor=(sponsorship_status='ativo' AND payment_state='recebido'),
 sponsor_expires_at=CASE WHEN end_date IS NULL THEN NULL ELSE (end_date+1)::timestamp AT TIME ZONE 'America/Sao_Paulo' END WHERE id=company_uuid;
 SELECT to_jsonb(s) INTO new_record FROM sponsorships s WHERE company_id=company_uuid;
 INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,metadata)
 VALUES(auth.uid(),'admin_sponsorship_saved','company',company_uuid,jsonb_build_object('before',old_record,'after',new_record));
END $$;
CREATE OR REPLACE FUNCTION public.admin_verify_entity(entity_kind text, entity_uuid uuid, verified boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Acesso exclusivo do superadministrador'; END IF;
 IF entity_kind='company' THEN UPDATE companies SET is_verified=verified WHERE id=entity_uuid;
 ELSIF entity_kind='user' THEN UPDATE profiles SET is_verified=verified WHERE id=entity_uuid;
 ELSE RAISE EXCEPTION 'Tipo inválido'; END IF;
 IF NOT FOUND THEN RAISE EXCEPTION 'Cadastro não encontrado'; END IF;
 INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,metadata)
 VALUES(auth.uid(),'admin_verification_changed',entity_kind,entity_uuid,jsonb_build_object('verified',verified));
END $$;
CREATE OR REPLACE FUNCTION public.protect_company_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL OR public.is_super_admin() THEN RETURN NEW; END IF;
 IF TG_OP='INSERT' THEN
   IF NEW.is_sponsor OR NEW.is_verified OR NEW.sponsor_expires_at IS NOT NULL THEN RAISE EXCEPTION 'Campos administrativos não podem ser alterados'; END IF;
 ELSIF NEW.owner_profile_id IS DISTINCT FROM OLD.owner_profile_id OR NEW.is_sponsor IS DISTINCT FROM OLD.is_sponsor
 OR NEW.is_verified IS DISTINCT FROM OLD.is_verified OR NEW.sponsor_expires_at IS DISTINCT FROM OLD.sponsor_expires_at THEN
   RAISE EXCEPTION 'Campos administrativos não podem ser alterados';
 END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NOT NULL AND (NEW.id IS DISTINCT FROM OLD.id OR NEW.role IS DISTINCT FROM OLD.role
 OR NEW.email IS DISTINCT FROM OLD.email OR NEW.is_active IS DISTINCT FROM OLD.is_active
 OR (NEW.is_verified IS DISTINCT FROM OLD.is_verified AND NOT public.is_super_admin())) THEN
   RAISE EXCEPTION 'Campos administrativos não podem ser alterados'; END IF;
 RETURN NEW;
END $$;
-- Additional restrictive policies compose with the existing ownership policies.
DROP POLICY IF EXISTS promotions_subscription ON public.promotions;
CREATE POLICY promotions_subscription ON public.promotions AS RESTRICTIVE FOR ALL TO authenticated
 USING(public.is_current_sponsor(company_id)) WITH CHECK(public.is_current_sponsor(company_id));
DROP POLICY IF EXISTS promotions_public_validity ON public.promotions;
CREATE POLICY promotions_public_validity ON public.promotions AS RESTRICTIVE FOR SELECT TO anon,authenticated
 USING(public.can_manage_company(company_id) OR (is_active AND (valid_until IS NULL OR valid_until>=current_date) AND public.is_current_sponsor(company_id)));
-- Enforce the six-item limit inside the database, including concurrent submissions.
CREATE OR REPLACE FUNCTION public.check_promotion_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='UPDATE' AND NEW.company_id IS DISTINCT FROM OLD.company_id THEN RAISE EXCEPTION 'Empresa da oferta não pode ser alterada'; END IF;
 PERFORM 1 FROM companies WHERE id=NEW.company_id FOR UPDATE;
 IF TG_OP='INSERT' AND (SELECT count(*) FROM promotions WHERE company_id=NEW.company_id)>=6 THEN RAISE EXCEPTION 'Limite de seis ofertas por empresa'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS check_promotion_limit ON public.promotions;
CREATE TRIGGER check_promotion_limit BEFORE INSERT OR UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.check_promotion_limit();
CREATE OR REPLACE VIEW public.v_jobs_with_company WITH(security_invoker=true) AS
 SELECT j.*,c.name AS company_name,c.logo_url AS company_logo_url,public.is_current_sponsor(c.id) AS company_is_sponsor,
 c.is_verified AS company_is_verified,c.industry AS company_industry,c.slogan AS company_slogan
 FROM public.jobs j JOIN public.companies c ON c.id=j.company_id;
REVOKE ALL ON public.platform_admins,public.sponsorships FROM anon,authenticated;
REVOKE ALL ON FUNCTION public.is_super_admin(),public.is_current_sponsor(uuid),public.admin_dashboard(),public.admin_save_sponsorship(uuid,text,text,numeric,date,date,text),public.admin_verify_entity(text,uuid,boolean),public.check_promotion_limit() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(),public.admin_dashboard(),public.admin_save_sponsorship(uuid,text,text,numeric,date,date,text),public.admin_verify_entity(text,uuid,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_sponsor(uuid) TO anon,authenticated;
COMMIT;
