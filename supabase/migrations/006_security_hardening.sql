-- Security corrections for the Supabase application. Apply after 005.
BEGIN;

CREATE OR REPLACE FUNCTION public.can_manage_company(company_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.companies WHERE id = company_uuid AND owner_profile_id = auth.uid()
  );
$$;
CREATE OR REPLACE FUNCTION public.can_view_candidate(candidate_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND (
    candidate_uuid = auth.uid() OR EXISTS (
      SELECT 1 FROM public.applications a JOIN public.companies c ON c.id = a.company_id
      WHERE a.candidate_id = candidate_uuid AND a.status <> 'desistiu' AND c.owner_profile_id = auth.uid()
    )
  );
$$;

-- Replace permissive policies: private contact data requires an authenticated,
-- authorized candidate or the company that received their application.
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('profiles', 'candidates', 'candidate_skills', 'candidate_experiences', 'applications', 'audit_logs')
  LOOP EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename); END LOOP;
END $$;
CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated USING (public.can_view_candidate(id));
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY candidates_read ON public.candidates FOR SELECT TO authenticated USING (public.can_view_candidate(profile_id));
CREATE POLICY candidates_write ON public.candidates FOR ALL TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'candidato'));
CREATE POLICY candidate_skills_read ON public.candidate_skills FOR SELECT TO authenticated USING (public.can_view_candidate(candidate_id));
CREATE POLICY candidate_skills_write ON public.candidate_skills FOR ALL TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());
CREATE POLICY candidate_experiences_read ON public.candidate_experiences FOR SELECT TO authenticated USING (public.can_view_candidate(candidate_id));
CREATE POLICY candidate_experiences_write ON public.candidate_experiences FOR ALL TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());
CREATE POLICY applications_read ON public.applications FOR SELECT TO authenticated USING (candidate_id = auth.uid() OR public.can_manage_company(company_id));
CREATE POLICY applications_insert ON public.applications FOR INSERT TO authenticated WITH CHECK (
  candidate_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'candidato')
  AND EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.company_id = applications.company_id AND j.status = 'Ativa')
);
CREATE POLICY applications_update ON public.applications FOR UPDATE TO authenticated
  USING (candidate_id = auth.uid() OR public.can_manage_company(company_id))
  WITH CHECK (candidate_id = auth.uid() OR public.can_manage_company(company_id));

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND (
    NEW.id IS DISTINCT FROM OLD.id OR NEW.role IS DISTINCT FROM OLD.role OR NEW.email IS DISTINCT FROM OLD.email
    OR NEW.is_verified IS DISTINCT FROM OLD.is_verified OR NEW.is_active IS DISTINCT FROM OLD.is_active
  ) THEN RAISE EXCEPTION 'Campos administrativos não podem ser alterados'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_profile_fields ON public.profiles;
CREATE TRIGGER protect_profile_fields BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();
CREATE OR REPLACE FUNCTION public.protect_company_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND (
    NEW.owner_profile_id IS DISTINCT FROM OLD.owner_profile_id OR NEW.is_sponsor IS DISTINCT FROM OLD.is_sponsor
    OR NEW.is_verified IS DISTINCT FROM OLD.is_verified OR NEW.sponsor_expires_at IS DISTINCT FROM OLD.sponsor_expires_at
  ) THEN RAISE EXCEPTION 'Campos administrativos não podem ser alterados'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_company_fields ON public.companies;
CREATE TRIGGER protect_company_fields BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.protect_company_fields();
CREATE OR REPLACE FUNCTION public.protect_application_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.job_id IS DISTINCT FROM OLD.job_id OR NEW.candidate_id IS DISTINCT FROM OLD.candidate_id OR NEW.company_id IS DISTINCT FROM OLD.company_id
  THEN RAISE EXCEPTION 'Identidade da candidatura não pode ser alterada'; END IF;
  IF auth.uid() = OLD.candidate_id AND NEW.status <> 'desistiu' THEN RAISE EXCEPTION 'Candidato só pode desistir da candidatura'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_application_fields ON public.applications;
CREATE TRIGGER protect_application_fields BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.protect_application_fields();

-- Preserve application history after the vacancy is closed; the public view
-- evaluates the caller's RLS instead of bypassing it as the view owner.
ALTER VIEW public.v_jobs_with_company SET (security_invoker = true);
CREATE OR REPLACE FUNCTION public.has_applied_to_job(job_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.applications WHERE job_id = job_uuid AND candidate_id = auth.uid());
$$;
DROP POLICY IF EXISTS "Vagas ativas visíveis publicamente" ON public.jobs;
CREATE POLICY jobs_read ON public.jobs FOR SELECT USING (status = 'Ativa' OR public.can_manage_company(company_id) OR public.has_applied_to_job(id));

-- File writes are scoped to the owner of the folder, not every signed-in user.
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname IN ('Empresa pode upload logo', 'Empresa pode atualizar logo', 'Empresa pode deletar logo', 'Empresa patrocinadora upload promoção', 'Empresa patrocinadora gerencia promoção', 'Empresa patrocinadora deleta promoção', 'Resumes privado - dono leitura')
  LOOP EXECUTE format('DROP POLICY %I ON storage.objects', p.policyname); END LOOP;
END $$;
CREATE POLICY company_logo_owner ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'company-logos' AND EXISTS (SELECT 1 FROM public.companies WHERE id::text = (storage.foldername(name))[1] AND owner_profile_id = auth.uid()))
  WITH CHECK (bucket_id = 'company-logos' AND EXISTS (SELECT 1 FROM public.companies WHERE id::text = (storage.foldername(name))[1] AND owner_profile_id = auth.uid()));
CREATE POLICY promotion_file_owner ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'promotions' AND EXISTS (SELECT 1 FROM public.companies WHERE id::text = (storage.foldername(name))[1] AND owner_profile_id = auth.uid() AND is_sponsor))
  WITH CHECK (bucket_id = 'promotions' AND EXISTS (SELECT 1 FROM public.companies WHERE id::text = (storage.foldername(name))[1] AND owner_profile_id = auth.uid() AND is_sponsor));
CREATE POLICY resumes_read ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'resumes' AND EXISTS (SELECT 1 FROM public.candidates WHERE profile_id::text = (storage.foldername(name))[1] AND public.can_view_candidate(profile_id))
);
UPDATE storage.buckets SET public = false WHERE id = 'resumes';

-- Enforce company authorization inside the SECURITY DEFINER metrics function.
CREATE OR REPLACE FUNCTION public.get_company_dashboard_metrics(company_uuid uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.can_manage_company(company_uuid) THEN RAISE EXCEPTION 'Acesso restrito'; END IF;
  RETURN json_build_object(
    'active_jobs', (SELECT count(*) FROM public.jobs WHERE company_id = company_uuid AND status = 'Ativa'),
    'total_jobs', (SELECT count(*) FROM public.jobs WHERE company_id = company_uuid),
    'total_applications', (SELECT count(*) FROM public.applications WHERE company_id = company_uuid AND status <> 'desistiu'),
    'applications_last_7d', (SELECT count(*) FROM public.applications WHERE company_id = company_uuid AND status <> 'desistiu' AND created_at >= now() - interval '7 days'),
    'total_views', (SELECT coalesce(sum(views_count),0) FROM public.jobs WHERE company_id = company_uuid),
    'sponsor_active', (SELECT is_sponsor FROM public.companies WHERE id = company_uuid),
    'promotions_count', (SELECT count(*) FROM public.promotions WHERE company_id = company_uuid AND is_active)
  );
END $$;

-- Rate limiting is enforced by the database operation, rather than relying on
-- the browser to call a separate validation endpoint.
CREATE OR REPLACE FUNCTION public.apply_to_job(job_uuid uuid, cover_letter_text text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_company uuid; v_id uuid;
BEGIN
  IF v_uid IS NULL OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid AND role = 'candidato') THEN RAISE EXCEPTION 'Faça login como candidato'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));
  SELECT company_id INTO v_company FROM public.jobs WHERE id = job_uuid AND status = 'Ativa' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Vaga não encontrada ou não está ativa'; END IF;
  IF length(coalesce(cover_letter_text,'')) > 2000 THEN RAISE EXCEPTION 'Carta de apresentação muito longa'; END IF;
  IF (SELECT count(*) FROM public.applications WHERE candidate_id = v_uid AND created_at >= now() - interval '1 hour') >= 10 THEN RAISE EXCEPTION 'Muitas candidaturas. Aguarde uma hora'; END IF;
  IF EXISTS (SELECT 1 FROM public.applications WHERE candidate_id = v_uid AND job_id = job_uuid) THEN RAISE EXCEPTION 'Você já se candidatou a esta vaga'; END IF;
  INSERT INTO public.applications (job_id, candidate_id, company_id, cover_letter) VALUES (job_uuid, v_uid, v_company, cover_letter_text) RETURNING id INTO v_id;
  INSERT INTO public.notifications (profile_id,title,message,type,link)
    SELECT owner_profile_id, 'Nova candidatura recebida', 'Você recebeu uma candidatura para sua vaga.', 'application', '/empresa/painel' FROM public.companies WHERE id = v_company;
  RETURN v_id;
END $$;
-- The RPC is the sole insert path, so limits cannot be bypassed via REST.
DROP POLICY applications_insert ON public.applications;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

-- SECURITY DEFINER functions are never executable by PUBLIC by default here.
DO $$ DECLARE f record; BEGIN
  FOR f IN SELECT p.oid::regprocedure AS signature, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', f.signature);
  END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION public.can_manage_company(uuid), public.can_view_candidate(uuid), public.has_applied_to_job(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_to_job(uuid,text), public.get_company_dashboard_metrics(uuid), public.ensure_my_company(), public.toggle_saved_job(uuid), public.set_my_skills(text[]), public.mark_application_viewed(uuid), public.increment_candidate_view(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_metrics(), public.search_jobs(text,job_type,text,integer,integer), public.increment_job_view(uuid), public.increment_company_view(uuid) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits(), public.check_rate_limit(text,integer) FROM authenticated;

COMMIT;
