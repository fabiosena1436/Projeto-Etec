-- =============================================================================
-- SEED - Dados iniciais para desenvolvimento e produção
-- =============================================================================

-- Skills base da cidade (para normalização)
INSERT INTO public.skills (name, slug, category) VALUES
  ('React', 'react', 'Tecnologia'),
  ('TypeScript', 'typescript', 'Tecnologia'),
  ('HTML/CSS', 'html-css', 'Tecnologia'),
  ('Git', 'git', 'Tecnologia'),
  ('Atendimento ao Cliente', 'atendimento-cliente', 'Vendas'),
  ('Pacote Office', 'pacote-office', 'Administrativo'),
  ('Vendas', 'vendas', 'Vendas'),
  ('Gestão de Estoque', 'gestao-estoque', 'Logística'),
  ('Informática Básica', 'informatica-basica', 'Tecnologia'),
  ('Comunicação', 'comunicacao', 'Soft Skill'),
  ('Trabalho em Equipe', 'trabalho-equipe', 'Soft Skill'),
  ('JavaScript', 'javascript', 'Tecnologia'),
  ('Node.js', 'nodejs', 'Tecnologia'),
  ('Logística', 'logistica', 'Logística'),
  ('Marketing Digital', 'marketing-digital', 'Marketing')
ON CONFLICT (name) DO NOTHING;

-- Função helper para criar usuário de teste (apenas em ambiente DEV)
-- NOTA: Em produção, usuários são criados via Supabase Auth. Este seed é ilustrativo
-- para criar companies e jobs de exemplo sem depender de auth.users.

-- Cria perfis de teste se não existirem (usando IDs fixos para seed)
-- Em produção real, você usaria o dashboard ou API para criar usuários

-- Para demonstração, vamos criar companies mock com owner fictício que será substituído
-- O ideal é rodar isso após ter usuários reais. Deixamos como exemplo de INSERT que funciona
-- quando há profiles existentes.

-- Exemplo de como ficará o INSERT quando houver profiles:
-- INSERT INTO public.companies (owner_profile_id, name, slug, industry, description, location, contact_email, slogan, is_sponsor) VALUES ...

-- Como não podemos inserir em auth.users via SQL seed direto, deixamos aqui um script
-- de exemplo que o dev pode rodar após criar usuários manualmente no Supabase Auth.

-- Seed de empresas exemplo (requer owner_profile_id existente - substituir UUIDs)
-- Descomente e ajuste após criar usuários via Supabase Auth:

/*
-- Supondo que você criou 2 usuários empresa no Auth:
-- Empresa 1 - Supermercado Central (patrocinador)
INSERT INTO public.companies (id, owner_profile_id, name, slug, industry, description, location, contact_email, slogan, is_sponsor, is_verified, logo_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM public.profiles WHERE email = 'rh@supermercadocentral.com.br' LIMIT 1),
  'Supermercado Central',
  'supermercado-central',
  'Varejo',
  'Um dos supermercados mais tradicionais de Teodoro Sampaio.',
  'Centro, Teodoro Sampaio',
  'rh@supermercadocentral.com.br',
  'Qualidade e preço baixo para a sua família.',
  true,
  true,
  'https://ui-avatars.com/api/?name=SC&background=2563eb&color=fff'
) ON CONFLICT (id) DO NOTHING;
*/

-- Seed público de demonstração para testes locais sem RLS (desabilite RLS temporariamente se precisar testar)
-- Para ambiente de desenvolvimento, você pode usar o supabase CLI: supabase db reset

-- Criação de view materializada para métricas da cidade (performance para alto fluxo)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_city_metrics AS
SELECT
  (SELECT COUNT(*) FROM public.jobs WHERE status = 'Ativa') as active_jobs,
  (SELECT COUNT(*) FROM public.companies WHERE is_verified = true) as verified_companies,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'candidato' AND is_active = true) as active_candidates,
  (SELECT COUNT(*) FROM public.applications WHERE created_at >= NOW() - INTERVAL '30 days') as applications_last_30d,
  (SELECT COUNT(*) FROM public.companies WHERE is_sponsor = true) as sponsors_count,
  NOW() as refreshed_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_city_metrics_refreshed ON public.mv_city_metrics(refreshed_at);

-- Função para refresh da materialized view (pode ser chamada via cron)
CREATE OR REPLACE FUNCTION public.refresh_city_metrics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_city_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular completion_percent do candidato
CREATE OR REPLACE FUNCTION public.calculate_candidate_completion(candidate_uuid UUID)
RETURNS INT AS $$
DECLARE
  total_fields INT := 7;
  filled_fields INT := 0;
  cand RECORD;
BEGIN
  SELECT * INTO cand FROM public.candidates WHERE profile_id = candidate_uuid;
  IF NOT FOUND THEN RETURN 0; END IF;

  IF cand.about IS NOT NULL AND char_length(cand.about) > 20 THEN filled_fields := filled_fields + 1; END IF;
  IF cand.profession IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF cand.education IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF cand.resume_url IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF EXISTS (SELECT 1 FROM public.candidate_skills WHERE candidate_id = candidate_uuid) THEN filled_fields := filled_fields + 1; END IF;
  IF EXISTS (SELECT 1 FROM public.candidate_experiences WHERE candidate_id = candidate_uuid) THEN filled_fields := filled_fields + 1; END IF;
  IF cand.city IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;

  RETURN (filled_fields * 100 / total_fields);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar completion automaticamente
CREATE OR REPLACE FUNCTION public.update_candidate_completion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.candidates 
  SET completion_percent = public.calculate_candidate_completion(COALESCE(NEW.profile_id, NEW.candidate_id))
  WHERE profile_id = COALESCE(NEW.profile_id, NEW.candidate_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_candidate_completion_on_candidate ON public.candidates;
CREATE TRIGGER trg_candidate_completion_on_candidate AFTER UPDATE OF about, profession, education, resume_url, city ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_candidate_completion();

DROP TRIGGER IF EXISTS trg_candidate_completion_on_skills ON public.candidate_skills;
CREATE TRIGGER trg_candidate_completion_on_skills AFTER INSERT OR DELETE ON public.candidate_skills FOR EACH ROW EXECUTE FUNCTION public.update_candidate_completion();

DROP TRIGGER IF EXISTS trg_candidate_completion_on_exp ON public.candidate_experiences;
CREATE TRIGGER trg_candidate_completion_on_exp AFTER INSERT OR DELETE ON public.candidate_experiences FOR EACH ROW EXECUTE FUNCTION public.update_candidate_completion();
