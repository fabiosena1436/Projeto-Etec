-- =============================================================================
-- 005 - Produção: cadastro completo de empresa, métricas públicas,
--        busca full-text completa e helpers usados pelo frontend real.
-- Rode no SQL Editor do Supabase (idempotente).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Trigger de novo usuário: agora também cria a EMPRESA quando role = empresa
--    e grava telefone. Tudo vem do metadata enviado no signUp.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.slugify(input TEXT)
RETURNS TEXT AS $$
  SELECT trim(both '-' from regexp_replace(lower(translate(coalesce(input,''),
    'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
    'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC')), '[^a-z0-9]+', '-', 'g'));
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'candidato');
  v_name TEXT := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), split_part(NEW.email, '@', 1));
  v_city TEXT := COALESCE(NULLIF(NEW.raw_user_meta_data->>'city',''), 'Teodoro Sampaio, SP');
  v_phone TEXT := NULLIF(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'phone',''), '\D', '', 'g'), '');
  v_company_name TEXT := NULLIF(NEW.raw_user_meta_data->>'company_name', '');
  v_cnpj TEXT := NULLIF(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'company_cnpj',''), '\D', '', 'g'), '');
  v_slug TEXT;
BEGIN
  -- garante tamanho mínimo do nome (constraint char_length >= 3)
  IF char_length(v_name) < 3 THEN v_name := v_name || ' Usuário'; END IF;
  IF v_phone IS NOT NULL AND char_length(v_phone) < 10 THEN v_phone := NULL; END IF;
  IF v_cnpj IS NOT NULL AND char_length(v_cnpj) <> 14 THEN v_cnpj := NULL; END IF;

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
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca bloqueia o signup por erro de perfil; loga para diagnóstico.
  RAISE WARNING 'handle_new_user falhou para %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2) ensure_my_company(): usuários "empresa" criados ANTES desta migração
--    (sem linha em companies) ganham a empresa automaticamente no 1º acesso.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_my_company()
RETURNS public.companies AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_profile public.profiles;
  v_company public.companies;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;

  SELECT * INTO v_company FROM public.companies WHERE owner_profile_id = v_uid ORDER BY created_at LIMIT 1;
  IF FOUND THEN RETURN v_company; END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
  IF v_profile.role <> 'empresa' THEN RAISE EXCEPTION 'Apenas perfis de empresa'; END IF;

  INSERT INTO public.companies (owner_profile_id, name, slug, industry, location, city, contact_email, phone)
  VALUES (
    v_uid,
    v_profile.full_name,
    public.slugify(v_profile.full_name) || '-' || substr(replace(v_uid::text,'-',''),1,6),
    'Geral',
    v_profile.city,
    'Teodoro Sampaio',
    v_profile.email,
    v_profile.phone
  )
  RETURNING * INTO v_company;

  RETURN v_company;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- -----------------------------------------------------------------------------
-- 3) Métricas públicas para a landing page (números reais, sem RLS)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_metrics()
RETURNS JSON AS $$
  SELECT json_build_object(
    'active_jobs', (SELECT COUNT(*) FROM public.jobs WHERE status = 'Ativa'),
    'companies', (SELECT COUNT(*) FROM public.companies),
    'candidates', (SELECT COUNT(*) FROM public.profiles WHERE role = 'candidato' AND is_active = true),
    'applications', (SELECT COUNT(*) FROM public.applications)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_public_metrics() TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4) Busca full-text devolvendo a linha completa da view (o front usa tudo)
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.search_jobs(TEXT, job_type, TEXT, INT, INT);

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
  WHERE v.status = 'Ativa'
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

GRANT EXECUTE ON FUNCTION public.search_jobs(TEXT, job_type, TEXT, INT, INT) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5) Salvar/Remover vaga em uma chamada (toggle)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.toggle_saved_job(job_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF EXISTS (SELECT 1 FROM public.saved_jobs WHERE candidate_id = v_uid AND job_id = job_uuid) THEN
    DELETE FROM public.saved_jobs WHERE candidate_id = v_uid AND job_id = job_uuid;
    RETURN false;
  ELSE
    INSERT INTO public.saved_jobs (candidate_id, job_id) VALUES (v_uid, job_uuid);
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- -----------------------------------------------------------------------------
-- 6) Empresa marca candidatura como "visualizada" ao abrir o perfil
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_application_viewed(application_uuid UUID)
RETURNS VOID AS $$
  UPDATE public.applications
  SET status = 'visualizada', reviewed_at = COALESCE(reviewed_at, NOW())
  WHERE id = application_uuid
    AND status = 'enviada'
    AND company_id IN (SELECT id FROM public.companies WHERE owner_profile_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- -----------------------------------------------------------------------------
-- 7) Skills: candidato pode criar skill nova ao editar perfil (upsert por nome)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_my_skills(skill_names TEXT[])
RETURNS VOID AS $$
DECLARE
  v_uid UUID := auth.uid();
  s TEXT;
  v_skill_id UUID;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;

  DELETE FROM public.candidate_skills WHERE candidate_id = v_uid;

  FOREACH s IN ARRAY COALESCE(skill_names, '{}') LOOP
    s := trim(s);
    CONTINUE WHEN s = '';
    INSERT INTO public.skills (name, slug, category)
    VALUES (s, public.slugify(s), 'Geral')
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_skill_id;

    IF v_skill_id IS NULL THEN
      SELECT id INTO v_skill_id FROM public.skills WHERE name = s OR slug = public.slugify(s) LIMIT 1;
    END IF;

    INSERT INTO public.candidate_skills (candidate_id, skill_id)
    VALUES (v_uid, v_skill_id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- -----------------------------------------------------------------------------
-- 8) Visualização de perfil de candidato (incremento seguro, sem UPDATE via RLS)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_candidate_view(candidate_uuid UUID)
RETURNS VOID AS $$
  UPDATE public.candidates SET profile_views = profile_views + 1
  WHERE profile_id = candidate_uuid AND candidate_uuid <> auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- -----------------------------------------------------------------------------
-- 9) Backfill: empresas para usuários "empresa" já existentes sem company
-- -----------------------------------------------------------------------------
INSERT INTO public.companies (owner_profile_id, name, slug, industry, location, city, contact_email, phone)
SELECT
  p.id,
  p.full_name,
  public.slugify(p.full_name) || '-' || substr(replace(p.id::text,'-',''),1,6),
  'Geral',
  p.city,
  'Teodoro Sampaio',
  p.email,
  p.phone
FROM public.profiles p
WHERE p.role = 'empresa'
  AND NOT EXISTS (SELECT 1 FROM public.companies c WHERE c.owner_profile_id = p.id)
ON CONFLICT DO NOTHING;

-- Backfill: candidatos sem linha em candidates
INSERT INTO public.candidates (profile_id, city)
SELECT p.id, p.city FROM public.profiles p
WHERE p.role = 'candidato'
  AND NOT EXISTS (SELECT 1 FROM public.candidates c WHERE c.profile_id = p.id)
ON CONFLICT DO NOTHING;
