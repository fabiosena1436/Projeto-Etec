-- =============================================================================
-- Storage Buckets e Funções de Negócio
-- =============================================================================

-- Criação de buckets (via SQL, equivalente ao dashboard)
-- Obs: No Supabase, buckets são criados via storage.buckets table
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('company-logos', 'company-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('resumes', 'resumes', false, 5242880, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('promotions', 'promotions', true, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
-- Avatares: público leitura, dono escrita
CREATE POLICY "Avatares leitura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuário pode upload próprio avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuário pode atualizar próprio avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuário pode deletar próprio avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Company Logos: público leitura, empresa dona escrita
CREATE POLICY "Logos leitura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

CREATE POLICY "Empresa pode upload logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Empresa pode atualizar logo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Empresa pode deletar logo"
ON storage.objects FOR DELETE
USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

-- Resumes: privado, apenas dono e empresas que receberam candidatura
CREATE POLICY "Resumes privado - dono leitura"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.applications app
      JOIN public.companies comp ON comp.id = app.company_id
      WHERE app.candidate_id::text = (storage.foldername(name))[1]
      AND comp.owner_profile_id = auth.uid()
    )
  )
);

CREATE POLICY "Candidato upload próprio currículo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Candidato pode atualizar próprio currículo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Candidato pode deletar próprio currículo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Promoções: público leitura, empresa patrocinadora escrita
CREATE POLICY "Promoções leitura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'promotions');

CREATE POLICY "Empresa patrocinadora upload promoção"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'promotions'
  AND auth.role() = 'authenticated'
  AND EXISTS (SELECT 1 FROM public.companies WHERE owner_profile_id = auth.uid() AND is_sponsor = true)
);

CREATE POLICY "Empresa patrocinadora gerencia promoção"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'promotions'
  AND EXISTS (SELECT 1 FROM public.companies WHERE owner_profile_id = auth.uid() AND is_sponsor = true)
);

CREATE POLICY "Empresa patrocinadora deleta promoção"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'promotions'
  AND EXISTS (SELECT 1 FROM public.companies WHERE owner_profile_id = auth.uid() AND is_sponsor = true)
);

-- =============================================================================
-- FUNÇÕES DE NEGÓCIO - Performance para alto fluxo
-- =============================================================================

-- Função para busca full-text de vagas (muito mais rápida que ILIKE)
CREATE OR REPLACE FUNCTION public.search_jobs(
  search_query TEXT,
  filter_type job_type DEFAULT NULL,
  filter_city TEXT DEFAULT NULL,
  limit_count INT DEFAULT 20,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  company_id UUID,
  company_name TEXT,
  company_logo_url TEXT,
  location TEXT,
  type job_type,
  salary_text TEXT,
  posted_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    j.company_id,
    c.name as company_name,
    c.logo_url as company_logo_url,
    j.location,
    j.type,
    j.salary_text,
    j.posted_at,
    ts_rank(j.search_vector, plainto_tsquery('portuguese', search_query)) as rank
  FROM public.jobs j
  JOIN public.companies c ON c.id = j.company_id
  WHERE
    j.status = 'Ativa'
    AND (search_query IS NULL OR j.search_vector @@ plainto_tsquery('portuguese', search_query))
    AND (filter_type IS NULL OR j.type = filter_type)
    AND (filter_city IS NULL OR j.city ILIKE '%' || filter_city || '%')
  ORDER BY
    CASE WHEN search_query IS NOT NULL THEN ts_rank(j.search_vector, plainto_tsquery('portuguese', search_query)) ELSE 0 END DESC,
    j.posted_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar views de forma segura (evita race condition)
CREATE OR REPLACE FUNCTION public.increment_job_view(job_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.jobs SET views_count = views_count + 1 WHERE id = job_uuid;
  INSERT INTO public.job_views (job_id, viewer_profile_id) VALUES (job_uuid, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_company_view(company_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.companies SET views_count = views_count + 1 WHERE id = company_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para dashboard da empresa - métricas agregadas
CREATE OR REPLACE FUNCTION public.get_company_dashboard_metrics(company_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'active_jobs', (SELECT COUNT(*) FROM public.jobs WHERE company_id = company_uuid AND status = 'Ativa'),
    'total_jobs', (SELECT COUNT(*) FROM public.jobs WHERE company_id = company_uuid),
    'total_applications', (SELECT COUNT(*) FROM public.applications WHERE company_id = company_uuid),
    'applications_last_7d', (SELECT COUNT(*) FROM public.applications WHERE company_id = company_uuid AND created_at >= NOW() - INTERVAL '7 days'),
    'total_views', (SELECT COALESCE(SUM(views_count),0) FROM public.jobs WHERE company_id = company_uuid),
    'sponsor_active', (SELECT is_sponsor FROM public.companies WHERE id = company_uuid),
    'promotions_count', (SELECT COUNT(*) FROM public.promotions WHERE company_id = company_uuid AND is_active = true)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para candidatar-se com validações de segurança
CREATE OR REPLACE FUNCTION public.apply_to_job(job_uuid UUID, cover_letter_text TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  new_application_id UUID;
  job_company_id UUID;
  candidate_profile_id UUID := auth.uid();
BEGIN
  IF candidate_profile_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT company_id INTO job_company_id FROM public.jobs WHERE id = job_uuid AND status = 'Ativa';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vaga não encontrada ou não está ativa';
  END IF;

  -- Verifica se já se candidatou
  IF EXISTS (SELECT 1 FROM public.applications WHERE job_id = job_uuid AND candidate_id = candidate_profile_id) THEN
    RAISE EXCEPTION 'Você já se candidatou a esta vaga';
  END IF;

  -- Verifica se é dono da empresa (não pode se candidatar à própria vaga)
  IF EXISTS (SELECT 1 FROM public.companies WHERE id = job_company_id AND owner_profile_id = candidate_profile_id) THEN
    RAISE EXCEPTION 'Você não pode se candidatar a vagas da sua própria empresa';
  END IF;

  INSERT INTO public.applications (job_id, candidate_id, company_id, cover_letter)
  VALUES (job_uuid, candidate_profile_id, job_company_id, cover_letter_text)
  RETURNING id INTO new_application_id;

  -- Cria notificação para empresa
  INSERT INTO public.notifications (profile_id, title, message, type, link)
  SELECT 
    comp.owner_profile_id,
    'Nova candidatura recebida',
    (SELECT full_name FROM public.profiles WHERE id = candidate_profile_id) || ' se candidatou para ' || (SELECT title FROM public.jobs WHERE id = job_uuid),
    'application',
    '/empresa/painel'
  FROM public.companies comp WHERE comp.id = job_company_id;

  RETURN new_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rate limiting simples para candidaturas (evita spam em cidade grande)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_profile_action ON public.rate_limits(profile_id, action, created_at);

CREATE OR REPLACE FUNCTION public.check_rate_limit(action_name TEXT, max_per_hour INT DEFAULT 10)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INT;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.rate_limits
  WHERE profile_id = auth.uid()
  AND action = action_name
  AND created_at >= NOW() - INTERVAL '1 hour';

  IF recent_count >= max_per_hour THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limits (profile_id, action) VALUES (auth.uid(), action_name);
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limpeza automática de rate_limits antigos (manter performance)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
