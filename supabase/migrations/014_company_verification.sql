-- CNPJ validado e análise administrativa do representante antes de operar.
BEGIN;
CREATE OR REPLACE FUNCTION public.normalize_cnpj(value text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT CASE WHEN upper(btrim(value)) ~ '^[A-Z0-9]{12}[0-9]{2}$' THEN upper(btrim(value))
 WHEN upper(btrim(value)) ~ '^[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}/[A-Z0-9]{4}-[0-9]{2}$'
 THEN translate(upper(btrim(value)), './-', '') ELSE NULL END
$$;
CREATE OR REPLACE FUNCTION public.is_valid_cnpj(value text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE c text:=public.normalize_cnpj(value); base text; total integer; weight integer; remainder integer; dv text:=''; i integer; step integer;
BEGIN
 IF c IS NULL OR c ~ '^([0-9])\1{13}$' THEN RETURN false; END IF;
 base:=left(c,12);
 FOR step IN 1..2 LOOP
  total:=0; weight:=2;
  FOR i IN REVERSE length(base)..1 LOOP
   total:=total+(ascii(substr(base,i,1))-48)*weight;
   weight:=CASE WHEN weight=9 THEN 2 ELSE weight+1 END;
  END LOOP;
  remainder:=total%11;
  dv:=dv||CASE WHEN remainder<2 THEN '0' ELSE (11-remainder)::text END;
  base:=left(c,12)||left(dv,1);
 END LOOP;
 RETURN right(c,2)=dv;
END $$;
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_cnpj_check;

CREATE TABLE IF NOT EXISTS public.company_verifications (
 company_id uuid PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
 cnpj text NOT NULL CHECK(public.is_valid_cnpj(cnpj)),
 legal_name text NOT NULL CHECK(length(btrim(legal_name)) BETWEEN 3 AND 200),
 review_notes text NOT NULL CHECK(length(btrim(review_notes)) BETWEEN 20 AND 2000),
 reviewed_by uuid NOT NULL REFERENCES public.profiles(id),
 reviewed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.company_verifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.company_verifications FROM PUBLIC,anon,authenticated;
-- Aprovações antigas sem registro de análise devem ser revisadas. Idempotente.
UPDATE public.companies c SET is_verified=false WHERE c.is_verified AND NOT EXISTS
 (SELECT 1 FROM public.company_verifications v WHERE v.company_id=c.id AND v.cnpj=c.cnpj);
ALTER TABLE public.companies ADD CONSTRAINT companies_cnpj_check
 CHECK(cnpj IS NULL OR (cnpj=public.normalize_cnpj(cnpj) AND public.is_valid_cnpj(cnpj))) NOT VALID;


CREATE OR REPLACE FUNCTION public.company_is_approved(company_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM companies c JOIN profiles p ON p.id=c.owner_profile_id
 JOIN company_verifications v ON v.company_id=c.id AND v.cnpj=c.cnpj
 WHERE c.id=company_uuid AND c.is_verified AND p.is_active AND public.is_valid_cnpj(c.cnpj))
$$;
CREATE OR REPLACE FUNCTION public.can_manage_company(company_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT public.company_is_approved(company_uuid) AND EXISTS
 (SELECT 1 FROM companies WHERE id=company_uuid AND owner_profile_id=auth.uid())
$$;
CREATE OR REPLACE FUNCTION public.can_view_candidate(candidate_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT auth.uid() IS NOT NULL AND (candidate_uuid=auth.uid() OR EXISTS
 (SELECT 1 FROM applications a WHERE a.candidate_id=candidate_uuid AND a.status<>'desistiu'
 AND public.can_manage_company(a.company_id)))
$$;
CREATE OR REPLACE FUNCTION public.validate_company_identity()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.cnpj IS NOT NULL THEN
  NEW.cnpj:=public.normalize_cnpj(NEW.cnpj);
  IF NEW.cnpj IS NULL OR NOT public.is_valid_cnpj(NEW.cnpj) THEN RAISE EXCEPTION 'CNPJ inválido'; END IF;
 END IF;
 IF TG_OP='UPDATE' AND NEW.cnpj IS DISTINCT FROM OLD.cnpj THEN NEW.is_verified:=false; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS validate_company_identity ON public.companies;
CREATE TRIGGER validate_company_identity BEFORE INSERT OR UPDATE OF cnpj ON public.companies
 FOR EACH ROW EXECUTE FUNCTION public.validate_company_identity();

CREATE OR REPLACE FUNCTION public.admin_review_company(company_uuid uuid, expected_cnpj text, legal_name text, review_notes text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c companies;
BEGIN
 IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Acesso exclusivo do superadministrador'; END IF;
 SELECT * INTO c FROM companies WHERE id=company_uuid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Empresa não encontrada'; END IF;
 IF NOT public.is_valid_cnpj(c.cnpj) OR c.cnpj IS DISTINCT FROM public.normalize_cnpj(expected_cnpj)
 THEN RAISE EXCEPTION 'Confira o CNPJ atual antes de aprovar'; END IF;
 INSERT INTO company_verifications(company_id,cnpj,legal_name,review_notes,reviewed_by)
 VALUES(c.id,c.cnpj,btrim(legal_name),btrim(review_notes),auth.uid())
 ON CONFLICT(company_id) DO UPDATE SET cnpj=excluded.cnpj,legal_name=excluded.legal_name,
 review_notes=excluded.review_notes,reviewed_by=excluded.reviewed_by,reviewed_at=now();
 UPDATE companies SET is_verified=true WHERE id=c.id;
 INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,metadata)
 VALUES(auth.uid(),'admin_company_approved','company',c.id,jsonb_build_object('cnpj',c.cnpj,'legal_name',legal_name,'review_notes',review_notes));
END $$;
CREATE OR REPLACE FUNCTION public.admin_verify_entity(entity_kind text, entity_uuid uuid, verified boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Acesso exclusivo do superadministrador'; END IF;
 IF entity_kind='company' THEN
  IF verified THEN RAISE EXCEPTION 'Use a análise de CNPJ e representante para aprovar a empresa'; END IF;
  UPDATE companies SET is_verified=false WHERE id=entity_uuid;
 ELSIF entity_kind='user' THEN UPDATE profiles SET is_verified=verified WHERE id=entity_uuid;
 ELSE RAISE EXCEPTION 'Tipo inválido'; END IF;
 IF NOT FOUND THEN RAISE EXCEPTION 'Cadastro não encontrado'; END IF;
 INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,metadata)
 VALUES(auth.uid(),'admin_verification_changed',entity_kind,entity_uuid,jsonb_build_object('verified',verified));
END $$;

DROP POLICY IF EXISTS companies_approval_read ON companies;
CREATE POLICY companies_approval_read ON companies AS RESTRICTIVE FOR SELECT
 USING(public.company_is_approved(id) OR owner_profile_id=auth.uid()
 OR EXISTS(SELECT 1 FROM applications a WHERE a.company_id=companies.id AND a.candidate_id=auth.uid()));
DROP POLICY IF EXISTS jobs_approval_read ON jobs;
CREATE POLICY jobs_approval_read ON jobs AS RESTRICTIVE FOR SELECT
 USING(public.company_is_approved(company_id) OR public.has_applied_to_job(id)
 OR EXISTS(SELECT 1 FROM companies WHERE id=company_id AND owner_profile_id=auth.uid()));
DROP POLICY IF EXISTS jobs_approval_insert ON jobs;
CREATE POLICY jobs_approval_insert ON jobs AS RESTRICTIVE FOR INSERT TO authenticated
 WITH CHECK(public.can_manage_company(company_id));
DROP POLICY IF EXISTS jobs_approval_update ON jobs;
CREATE POLICY jobs_approval_update ON jobs AS RESTRICTIVE FOR UPDATE TO authenticated
 USING(public.can_manage_company(company_id)) WITH CHECK(public.can_manage_company(company_id));
DROP POLICY IF EXISTS applications_approval ON applications;
CREATE POLICY applications_approval ON applications AS RESTRICTIVE FOR ALL TO authenticated
 USING(candidate_id=auth.uid() OR public.can_manage_company(company_id))
 WITH CHECK(candidate_id=auth.uid() OR public.can_manage_company(company_id));

REVOKE ALL ON FUNCTION public.company_is_approved(uuid),public.admin_review_company(uuid,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.company_is_approved(uuid) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_company(uuid,text,text,text) TO authenticated;
-- Demais funções abaixo preservam os limites existentes e adicionam a aprovação.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role := CASE WHEN NEW.raw_user_meta_data->>'role' = 'empresa' THEN 'empresa'::user_role ELSE 'candidato'::user_role END;
  v_name TEXT := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), split_part(NEW.email, '@', 1));
  v_city TEXT := COALESCE(NULLIF(NEW.raw_user_meta_data->>'city',''), 'Teodoro Sampaio, SP');
  v_phone TEXT := NULLIF(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'phone',''), '\D', '', 'g'), '');
  v_company_name TEXT := NULLIF(NEW.raw_user_meta_data->>'company_name', '');
  v_cnpj TEXT := public.normalize_cnpj(NEW.raw_user_meta_data->>'company_cnpj');
  v_slug TEXT;
BEGIN
  -- garante tamanho mínimo do nome (constraint char_length >= 3)
  IF char_length(v_name) < 3 THEN v_name := v_name || ' Usuário'; END IF;
  IF v_phone IS NOT NULL AND char_length(v_phone) < 10 THEN v_phone := NULL; END IF;
  IF v_role='empresa' AND NOT public.is_valid_cnpj(v_cnpj) THEN RAISE EXCEPTION 'CNPJ válido obrigatório para empresas'; END IF;

  INSERT INTO public.profiles (id, email, full_name, role, city, phone)
  VALUES (NEW.id, NEW.email, v_name, v_role, v_city, v_phone)
  ON CONFLICT (id) DO NOTHING;

  IF v_role = 'candidato' THEN
    INSERT INTO public.candidates (profile_id, city)
    VALUES (NEW.id, v_city)
    ON CONFLICT (profile_id) DO NOTHING;
  ELSIF v_role = 'empresa' THEN
    v_slug := public.slugify(COALESCE(v_company_name, v_name));
    IF v_slug = '' THEN v_slug := 'empresa'; END IF;
    v_slug := v_slug || '-' || substr(replace(NEW.id::text, '-', ''), 1, 6);

    INSERT INTO public.companies (owner_profile_id, name, slug, industry, description, location, city, contact_email, phone, cnpj)
    VALUES (
      NEW.id,
      COALESCE(v_company_name, v_name),
      v_slug,
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_industry',''), 'Geral'),
      NULL,
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_location',''), 'Teodoro Sampaio, SP'),
      'Teodoro Sampaio',
      NEW.email,
      v_phone,
      v_cnpj
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE OR REPLACE FUNCTION public.search_jobs(
  search_query TEXT,
  filter_type job_type DEFAULT NULL,
  filter_city TEXT DEFAULT NULL,
  limit_count INT DEFAULT 20,
  offset_count INT DEFAULT 0
)
RETURNS SETOF public.v_jobs_with_company AS $$
  SELECT v.*
  FROM public.v_jobs_with_company v
  WHERE v.status = 'Ativa' AND public.company_is_approved(v.company_id)
    AND (
      search_query IS NULL OR search_query = ''
      OR v.search_vector @@ plainto_tsquery('portuguese', search_query)
      OR v.title ILIKE '%' || search_query || '%'
      OR v.company_name ILIKE '%' || search_query || '%'
    )
    AND (filter_type IS NULL OR v.type = filter_type)
    AND (filter_city IS NULL OR v.city ILIKE '%' || filter_city || '%')
  ORDER BY
    v.company_is_sponsor DESC,
    CASE WHEN search_query IS NOT NULL AND search_query <> ''
         THEN ts_rank(v.search_vector, plainto_tsquery('portuguese', search_query)) ELSE 0 END DESC,
    v.posted_at DESC
  LIMIT limit_count OFFSET offset_count;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
CREATE OR REPLACE FUNCTION public.mark_application_viewed(application_uuid UUID)
RETURNS VOID AS $$
  UPDATE public.applications
  SET status = 'visualizada', reviewed_at = COALESCE(reviewed_at, NOW())
  WHERE id = application_uuid
    AND status = 'enviada'
    AND public.can_manage_company(company_id);
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
CREATE OR REPLACE FUNCTION public.apply_to_job(job_uuid uuid, cover_letter_text text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_company uuid; v_id uuid;
BEGIN
  IF v_uid IS NULL OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid AND role = 'candidato') THEN RAISE EXCEPTION 'Faça login como candidato'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));
  SELECT company_id INTO v_company FROM public.jobs WHERE id = job_uuid AND status = 'Ativa' AND public.company_is_approved(company_id) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Vaga não encontrada ou não está ativa'; END IF;
  IF length(coalesce(cover_letter_text,'')) > 2000 THEN RAISE EXCEPTION 'Carta de apresentação muito longa'; END IF;
  IF (SELECT count(*) FROM public.applications WHERE candidate_id = v_uid AND created_at >= now() - interval '1 hour') >= 10 THEN RAISE EXCEPTION 'Muitas candidaturas. Aguarde uma hora'; END IF;
  IF EXISTS (SELECT 1 FROM public.applications WHERE candidate_id = v_uid AND job_id = job_uuid) THEN RAISE EXCEPTION 'Você já se candidatou a esta vaga'; END IF;
  INSERT INTO public.applications (job_id, candidate_id, company_id, cover_letter) VALUES (job_uuid, v_uid, v_company, cover_letter_text) RETURNING id INTO v_id;
  INSERT INTO public.notifications (profile_id,title,message,type,link)
    SELECT owner_profile_id, 'Nova candidatura recebida', 'Você recebeu uma candidatura para sua vaga.', 'application', '/empresa/painel' FROM public.companies WHERE id = v_company;
  RETURN v_id;
END $$;
CREATE OR REPLACE FUNCTION public.is_current_sponsor(company_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.companies c WHERE c.id=company_uuid AND public.company_is_approved(c.id) AND c.is_sponsor
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
 'companies',(SELECT coalesce(jsonb_agg(to_jsonb(c)),'[]'::jsonb) FROM (SELECT id,name,cnpj,industry,city,contact_email,phone,is_verified,is_sponsor,sponsor_expires_at,owner_profile_id FROM companies ORDER BY created_at DESC LIMIT 500) c),
 'users',(SELECT coalesce(jsonb_agg(to_jsonb(p)),'[]'::jsonb) FROM (SELECT id,full_name,email,role,is_verified,is_active,created_at FROM profiles ORDER BY created_at DESC LIMIT 500) p),
 'sponsorships',(SELECT coalesce(jsonb_agg(to_jsonb(s)),'[]'::jsonb) FROM (SELECT * FROM sponsorships ORDER BY updated_at DESC LIMIT 500) s),
 'audit',(SELECT coalesce(jsonb_agg(to_jsonb(a)),'[]'::jsonb) FROM (SELECT action,entity_type,entity_id,created_at FROM audit_logs WHERE action LIKE 'admin_%' ORDER BY created_at DESC LIMIT 30) a));
END $$;
CREATE OR REPLACE FUNCTION public.community_feed(company_uuid uuid DEFAULT NULL, following_only boolean DEFAULT false, before_time timestamptz DEFAULT NULL, before_uuid uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce(jsonb_agg(item ORDER BY created_at DESC,id DESC),'[]'::jsonb) FROM (
 SELECT p.created_at,p.id,jsonb_build_object(
 'id',p.id,'company_id',c.id,'author_id',author.id,'author_kind',CASE WHEN c.id IS NULL THEN 'person' ELSE 'company' END,
 'company_name',coalesce(c.name,author.full_name),'logo_url',CASE WHEN c.id IS NULL THEN author.avatar_url ELSE c.logo_url END,
 'verified',coalesce(c.is_verified,false),'sponsor',CASE WHEN c.id IS NULL THEN false ELSE public.is_current_sponsor(c.id) END,
 'body',p.body,'image_url',p.image_url,'created_at',p.created_at,'updated_at',p.updated_at,
 'can_edit',CASE WHEN c.id IS NULL THEN coalesce(author.id=auth.uid(),false) ELSE public.can_manage_company(c.id) END,'likes',(SELECT count(*) FROM post_likes l WHERE l.post_id=p.id),
 'liked',EXISTS(SELECT 1 FROM post_likes l WHERE l.post_id=p.id AND l.profile_id=auth.uid()),
 'following',CASE WHEN c.id IS NULL THEN EXISTS(SELECT 1 FROM person_followers f WHERE f.followed_id=author.id AND f.profile_id=auth.uid()) ELSE EXISTS(SELECT 1 FROM company_followers f WHERE f.company_id=c.id AND f.profile_id=auth.uid()) END,
 'comment_count',(SELECT count(*) FROM post_comments m JOIN profiles a ON a.id=m.author_id WHERE m.post_id=p.id AND NOT m.hidden AND NOT m.withdrawn AND a.is_active),
 'comments',coalesce((SELECT jsonb_agg(x.item ORDER BY x.created_at,x.id) FROM (
 SELECT m.created_at,m.id,jsonb_build_object('id',m.id,'body',m.body,'name',a.full_name,'created_at',m.created_at,'own',m.author_id=auth.uid()) item
 FROM post_comments m JOIN profiles a ON a.id=m.author_id WHERE m.post_id=p.id AND NOT m.hidden AND NOT m.withdrawn AND a.is_active
 ORDER BY m.created_at DESC,m.id DESC LIMIT 20) x),'[]'::jsonb)) item
 FROM company_posts p LEFT JOIN companies c ON c.id=p.company_id LEFT JOIN profiles owner ON owner.id=c.owner_profile_id JOIN profiles author ON author.id=p.author_id
 WHERE NOT p.hidden AND NOT p.withdrawn AND (p.company_id IS NULL OR (owner.is_active AND public.company_is_approved(p.company_id))) AND author.is_active
 AND (company_uuid IS NULL OR c.id=company_uuid)
 AND (NOT following_only OR (c.id IS NOT NULL AND EXISTS(SELECT 1 FROM company_followers f WHERE f.company_id=c.id AND f.profile_id=auth.uid())) OR (c.id IS NULL AND EXISTS(SELECT 1 FROM person_followers f WHERE f.followed_id=author.id AND f.profile_id=auth.uid())))
 AND (before_time IS NULL OR (p.created_at,p.id)<(before_time,coalesce(before_uuid,'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)))
 ORDER BY p.created_at DESC,p.id DESC LIMIT 20) feed
$$;
CREATE OR REPLACE FUNCTION public.community_company(company_uuid uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT jsonb_build_object('followers',(SELECT count(*) FROM company_followers WHERE company_id=c.id),
 'following',EXISTS(SELECT 1 FROM company_followers WHERE company_id=c.id AND profile_id=auth.uid()))
 FROM companies c JOIN profiles p ON p.id=c.owner_profile_id WHERE c.id=company_uuid AND p.is_active AND public.company_is_approved(c.id)
$$;
CREATE OR REPLACE FUNCTION public.community_action(action_name text, target_uuid uuid, content text DEFAULT NULL, picture text DEFAULT NULL, desired boolean DEFAULT true)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE actor uuid:=auth.uid(); p company_posts; m post_comments; result uuid; company_name text; owner_id uuid;
BEGIN
 IF actor IS NULL OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=actor AND is_active) THEN RAISE EXCEPTION 'Entre em uma conta ativa para participar.'; END IF;
 IF EXISTS(SELECT 1 FROM profiles WHERE id=actor AND role='empresa') AND NOT EXISTS
 (SELECT 1 FROM companies WHERE owner_profile_id=actor AND public.company_is_approved(id))
 THEN RAISE EXCEPTION 'Empresa pendente de verificação. Aguarde a aprovação administrativa.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(actor::text,0));
 IF desired IS NULL THEN RAISE EXCEPTION 'Informe o estado desejado.'; END IF;
 IF action_name='follow_person' THEN
  IF target_uuid=actor THEN RAISE EXCEPTION 'Você não pode seguir sua própria conta.'; END IF;
  IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=target_uuid AND is_active) THEN RAISE EXCEPTION 'Pessoa indisponível.'; END IF;
  IF desired THEN INSERT INTO person_followers(followed_id,profile_id) VALUES(target_uuid,actor) ON CONFLICT DO NOTHING;
  ELSE DELETE FROM person_followers WHERE followed_id=target_uuid AND profile_id=actor; END IF;
  RETURN target_uuid;
 END IF;
 IF action_name='publish_person' THEN
  IF target_uuid IS DISTINCT FROM actor THEN RAISE EXCEPTION 'Publicação restrita à sua conta.'; END IF;
  IF (SELECT count(*) FROM company_posts WHERE author_id=actor AND created_at>now()-interval '1 hour')>=10 THEN RAISE EXCEPTION 'Limite de dez publicações por hora. Tente mais tarde.'; END IF;
  INSERT INTO company_posts(company_id,author_id,body,image_url) VALUES(NULL,actor,btrim(content),nullif(btrim(picture),'')) RETURNING id INTO result;
  INSERT INTO notifications(profile_id,title,message,type,link)
  SELECT f.profile_id,'Nova publicação na sua rede',a.full_name||' publicou na comunidade.','info','/comunidade'
  FROM person_followers f JOIN profiles a ON a.id=actor JOIN profiles follower ON follower.id=f.profile_id
  WHERE f.followed_id=actor AND follower.is_active;
  RETURN result;
 END IF;
 IF action_name IN ('follow','publish') THEN
  SELECT c.name,c.owner_profile_id INTO company_name,owner_id FROM companies c JOIN profiles a ON a.id=c.owner_profile_id WHERE c.id=target_uuid AND a.is_active;
  IF owner_id IS NULL THEN RAISE EXCEPTION 'Empresa indisponível.'; END IF;
  IF action_name='follow' THEN
   IF desired THEN INSERT INTO company_followers VALUES(target_uuid,actor) ON CONFLICT DO NOTHING;
   ELSE DELETE FROM company_followers WHERE company_id=target_uuid AND profile_id=actor; END IF;
   RETURN target_uuid;
  END IF;
  IF NOT can_manage_company(target_uuid) THEN RAISE EXCEPTION 'Publicação restrita à sua empresa.'; END IF;
  IF (SELECT count(*) FROM company_posts WHERE author_id=actor AND created_at>now()-interval '1 hour')>=10 THEN RAISE EXCEPTION 'Limite de dez publicações por hora. Tente mais tarde.'; END IF;
  INSERT INTO company_posts(company_id,author_id,body,image_url) VALUES(target_uuid,actor,btrim(content),nullif(btrim(picture),'')) RETURNING id INTO result;
  INSERT INTO notifications(profile_id,title,message,type,link)
  SELECT f.profile_id,'Nova publicação de empresa',company_name||' publicou na comunidade.','info','/comunidade?empresa='||target_uuid
  FROM company_followers f JOIN profiles a ON a.id=f.profile_id WHERE f.company_id=target_uuid AND f.profile_id<>actor AND a.is_active;
  RETURN result;
 END IF;
 IF action_name IN ('remove_comment','report_comment') THEN
  SELECT * INTO m FROM post_comments WHERE id=target_uuid;
  IF m.id IS NULL THEN RAISE EXCEPTION 'Comentário indisponível.'; END IF;
  IF action_name='remove_comment' THEN
   IF m.author_id<>actor THEN RAISE EXCEPTION 'Você só pode retirar seu comentário.'; END IF;
   UPDATE post_comments SET withdrawn=true WHERE id=m.id; RETURN m.id;
  END IF;
  SELECT * INTO p FROM company_posts WHERE id=m.post_id;
  IF m.hidden OR m.withdrawn THEN RAISE EXCEPTION 'Comentário indisponível.'; END IF;
 ELSE SELECT * INTO p FROM company_posts WHERE id=target_uuid; END IF;
 IF p.id IS NULL THEN RAISE EXCEPTION 'Publicação indisponível.'; END IF;
 IF action_name IN ('edit','withdraw') THEN
  IF (p.company_id IS NULL AND p.author_id<>actor) OR (p.company_id IS NOT NULL AND NOT can_manage_company(p.company_id)) THEN RAISE EXCEPTION 'Publicação restrita ao autor ou à sua empresa.'; END IF;
  IF action_name='withdraw' THEN UPDATE company_posts SET withdrawn=true,updated_at=now() WHERE id=p.id;
  ELSE
   IF p.hidden OR p.withdrawn THEN RAISE EXCEPTION 'Publicação indisponível para edição.'; END IF;
   UPDATE company_posts SET body=btrim(content),image_url=nullif(btrim(picture),''),updated_at=now() WHERE id=p.id;
  END IF;
  RETURN p.id;
 END IF;
 IF p.hidden OR p.withdrawn OR NOT EXISTS(SELECT 1 FROM profiles b LEFT JOIN companies c ON c.id=p.company_id LEFT JOIN profiles a ON a.id=c.owner_profile_id WHERE b.id=p.author_id AND b.is_active AND (p.company_id IS NULL OR a.is_active)) THEN RAISE EXCEPTION 'Publicação indisponível.'; END IF;
 IF action_name='like' THEN
  IF desired THEN INSERT INTO post_likes VALUES(p.id,actor) ON CONFLICT DO NOTHING;
  ELSE DELETE FROM post_likes WHERE post_id=p.id AND profile_id=actor; END IF; RETURN p.id;
 ELSIF action_name='comment' THEN
  IF (SELECT count(*) FROM post_comments WHERE author_id=actor AND created_at>now()-interval '1 hour')>=30 THEN RAISE EXCEPTION 'Limite de trinta comentários por hora.'; END IF;
  INSERT INTO post_comments(post_id,author_id,body) VALUES(p.id,actor,btrim(content)) RETURNING id INTO result;
  IF p.company_id IS NULL THEN SELECT id,full_name INTO owner_id,company_name FROM profiles WHERE id=p.author_id;
  ELSE SELECT owner_profile_id,name INTO owner_id,company_name FROM companies WHERE id=p.company_id; END IF;
  IF owner_id<>actor THEN INSERT INTO notifications(profile_id,title,message,type,link) VALUES(owner_id,'Novo comentário',company_name||' recebeu um comentário na comunidade.','info',CASE WHEN p.company_id IS NULL THEN '/comunidade' ELSE '/comunidade?empresa='||p.company_id END); END IF;
  RETURN result;
 ELSIF action_name IN ('report','report_comment') THEN
  IF (SELECT count(*) FROM community_reports WHERE reporter_id=actor AND created_at>now()-interval '1 hour')>=20 THEN RAISE EXCEPTION 'Limite de denúncias por hora.'; END IF;
  INSERT INTO community_reports(reporter_id,post_id,comment_id,reason) VALUES(actor,CASE WHEN action_name='report' THEN p.id END,CASE WHEN action_name='report_comment' THEN m.id END,btrim(content)) ON CONFLICT DO NOTHING RETURNING id INTO result;
  RETURN coalesce(result,target_uuid);
 END IF;
 RAISE EXCEPTION 'Ação desconhecida.';
END $$;

CREATE OR REPLACE FUNCTION public.get_public_metrics()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT json_build_object('active_jobs',(SELECT count(*) FROM jobs WHERE status='Ativa' AND public.company_is_approved(company_id)),
 'companies',(SELECT count(*) FROM companies WHERE public.company_is_approved(id)),
 'candidates',(SELECT count(*) FROM profiles WHERE role='candidato' AND is_active),
 'applications',(SELECT count(*) FROM applications))
$$;
COMMIT;
