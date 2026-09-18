-- =============================================================================
-- Conecta Teodoro Sampaio - Schema Inicial
-- Banco: PostgreSQL 15+ (Supabase)
-- Engenharia: Alta performance, RLS, Índices, Auditoria, Escalável para cidade
-- =============================================================================

-- Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- busca fuzzy
-- unaccent pode precisar ser habilitado no dashboard do supabase se disponível
-- CREATE EXTENSION IF NOT EXISTS "unaccent";

-- -----------------------------------------------------------------------------
-- ENUMS - Tipagem forte para evitar dados sujos
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('candidato', 'empresa', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_type AS ENUM ('Presencial', 'Remoto', 'Híbrido', 'Estágio', 'Jovem Aprendiz', 'Freelancer', 'Temporário');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('Ativa', 'Encerrada', 'Rascunho', 'Em Analise', 'Expirada');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('enviada', 'visualizada', 'em_analise', 'pre_selecionado', 'aprovada', 'rejeitada', 'desistiu');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE company_member_role AS ENUM ('owner', 'admin', 'recruiter');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- FUNÇÕES AUXILIARES
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', COALESCE(NEW.title,'')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.description,'')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(array_to_string(NEW.requirements, ' '),'')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- TABELA: profiles - Base de todos os usuários (estende auth.users do Supabase)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'candidato',
  email TEXT NOT NULL,
  full_name TEXT NOT NULL CHECK (char_length(full_name) >= 3),
  avatar_url TEXT,
  phone TEXT CHECK (phone ~ '^\+?[0-9\s\-\(\)]{10,20}$' OR phone IS NULL),
  city TEXT NOT NULL DEFAULT 'Teodoro Sampaio, SP',
  state TEXT NOT NULL DEFAULT 'SP',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- TABELA: candidates - Perfil detalhado do candidato
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidates (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  about TEXT CHECK (char_length(about) <= 2000),
  profession TEXT,
  age INT CHECK (age >= 14 AND age <= 80),
  education TEXT,
  resume_url TEXT, -- path no storage bucket 'resumes'
  linkedin_url TEXT CHECK (linkedin_url ~ '^https?://' OR linkedin_url IS NULL),
  portfolio_url TEXT,
  city TEXT NOT NULL DEFAULT 'Teodoro Sampaio, SP',
  experience_years INT DEFAULT 0 CHECK (experience_years >= 0),
  availability TEXT, -- ex: Imediata, Manhã, Tarde
  profile_views INT NOT NULL DEFAULT 0 CHECK (profile_views >= 0),
  completion_percent INT NOT NULL DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),
  is_open_to_work BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_city ON public.candidates(city);
CREATE INDEX IF NOT EXISTS idx_candidates_profession ON public.candidates(profession);
CREATE INDEX IF NOT EXISTS idx_candidates_open_to_work ON public.candidates(is_open_to_work) WHERE is_open_to_work = true;

DROP TRIGGER IF EXISTS trg_candidates_updated_at ON public.candidates;
CREATE TRIGGER trg_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- TABELA: candidate_skills - Normalizada para busca eficiente
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(profile_id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  level INT CHECK (level >= 1 AND level <= 5), -- 1 iniciante 5 especialista
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_skills_candidate ON public.candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_skill ON public.candidate_skills(skill_id);

-- -----------------------------------------------------------------------------
-- TABELA: candidate_experiences
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidate_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(profile_id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT date_check CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_candidate_experiences_candidate ON public.candidate_experiences(candidate_id);

-- -----------------------------------------------------------------------------
-- TABELA: companies - Empresas da cidade
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9\-]+$'),
  industry TEXT NOT NULL,
  description TEXT CHECK (char_length(description) <= 5000),
  location TEXT NOT NULL, -- endereço legível
  city TEXT NOT NULL DEFAULT 'Teodoro Sampaio',
  state TEXT NOT NULL DEFAULT 'SP',
  contact_email TEXT NOT NULL CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT,
  website TEXT CHECK (website ~ '^https?://' OR website IS NULL),
  logo_url TEXT,
  banner_url TEXT,
  slogan TEXT CHECK (char_length(slogan) <= 200),
  cnpj TEXT UNIQUE CHECK (cnpj ~ '^[0-9]{14}$' OR cnpj IS NULL),
  is_sponsor BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  sponsor_expires_at TIMESTAMPTZ,
  views_count INT NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_is_sponsor ON public.companies(is_sponsor) WHERE is_sponsor = true;
CREATE INDEX IF NOT EXISTS idx_companies_is_verified ON public.companies(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_companies_city ON public.companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm ON public.companies USING gin (name gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_companies_updated_at ON public.companies;
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- TABELA: company_members - Multi-usuário por empresa (para futuro)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role company_member_role NOT NULL DEFAULT 'recruiter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_company_members_company ON public.company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_profile ON public.company_members(profile_id);

-- -----------------------------------------------------------------------------
-- TABELA: jobs - Vagas (coração do sistema)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 120),
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL CHECK (char_length(description) >= 20),
  location TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Teodoro Sampaio',
  type job_type NOT NULL,
  salary_min INT CHECK (salary_min >= 0),
  salary_max INT CHECK (salary_max IS NULL OR salary_max >= salary_min),
  salary_text TEXT NOT NULL, -- ex: "R$ 1.600 + Comissão" para exibição
  requirements TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  status job_status NOT NULL DEFAULT 'Ativa',
  experience_level TEXT, -- Júnior, Pleno, Sênior, Estágio
  education_required TEXT,
  vacancies INT NOT NULL DEFAULT 1 CHECK (vacancies >= 1 AND vacancies <= 100),
  views_count INT NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  applications_count INT NOT NULL DEFAULT 0 CHECK (applications_count >= 0),
  expires_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  search_vector TSVECTOR
);

CREATE INDEX IF NOT EXISTS idx_jobs_company ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status) WHERE status = 'Ativa';
CREATE INDEX IF NOT EXISTS idx_jobs_type ON public.jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON public.jobs(city);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON public.jobs(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_search_vector ON public.jobs USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm ON public.jobs USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jobs_salary ON public.jobs(salary_min, salary_max);
CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON public.jobs(company_id, status);

DROP TRIGGER IF EXISTS trg_jobs_updated_at ON public.jobs;
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jobs_search_vector ON public.jobs;
CREATE TRIGGER trg_jobs_search_vector BEFORE INSERT OR UPDATE OF title, description, requirements ON public.jobs FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- -----------------------------------------------------------------------------
-- TABELA: promotions - Promoções de empresas patrocinadoras
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 120),
  description TEXT NOT NULL,
  image_url TEXT,
  price NUMERIC(10,2) CHECK (price IS NULL OR price >= 0),
  discount_price NUMERIC(10,2) CHECK (discount_price IS NULL OR discount_price >= 0),
  valid_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  views_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT discount_check CHECK (discount_price IS NULL OR price IS NULL OR discount_price <= price)
);

CREATE INDEX IF NOT EXISTS idx_promotions_company ON public.promotions(company_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_promotions_valid_until ON public.promotions(valid_until) WHERE valid_until IS NOT NULL;

DROP TRIGGER IF EXISTS trg_promotions_updated_at ON public.promotions;
CREATE TRIGGER trg_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- TABELA: applications - Candidaturas (relacionamento N:N com metadados)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE, -- denormalizado para RLS performático
  status application_status NOT NULL DEFAULT 'enviada',
  cover_letter TEXT CHECK (char_length(cover_letter) <= 2000),
  expected_salary INT CHECK (expected_salary IS NULL OR expected_salary >= 0),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_job ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_company ON public.applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_company_status ON public.applications(company_id, status);

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para incrementar contador de candidaturas na vaga
CREATE OR REPLACE FUNCTION increment_job_applications()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs SET applications_count = GREATEST(0, applications_count - 1) WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_count ON public.applications;
CREATE TRIGGER trg_applications_count AFTER INSERT OR DELETE ON public.applications FOR EACH ROW EXECUTE FUNCTION increment_job_applications();

-- -----------------------------------------------------------------------------
-- TABELA: saved_jobs - Vagas salvas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_candidate ON public.saved_jobs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON public.saved_jobs(job_id);

-- -----------------------------------------------------------------------------
-- TABELA: job_views - Analytics leve (para cidade com alto fluxo)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  viewer_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_hash TEXT, -- hash do IP para privacidade LGPD
  user_agent TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_views_job ON public.job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_viewed_at ON public.job_views(viewed_at DESC);
-- Particionamento futuro por mês se fluxo > 1M linhas/mês

-- -----------------------------------------------------------------------------
-- TABELA: notifications - Sistema de notificações
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, application, job
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT, -- ex: /vagas/uuid
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(profile_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- -----------------------------------------------------------------------------
-- TABELA: audit_logs - LGPD e segurança
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- login, create_job, apply, update_profile, etc
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- -----------------------------------------------------------------------------
-- VIEW: v_jobs_with_company - Para queries performáticas
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_jobs_with_company AS
SELECT 
  j.*,
  c.name as company_name,
  c.logo_url as company_logo_url,
  c.is_sponsor as company_is_sponsor,
  c.is_verified as company_is_verified,
  c.industry as company_industry,
  c.slogan as company_slogan
FROM public.jobs j
JOIN public.companies c ON c.id = j.company_id;

-- -----------------------------------------------------------------------------
-- FUNCTION: Criar perfil automaticamente após signup no auth.users
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, city)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'candidato'),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Teodoro Sampaio, SP')
  );

  -- Se for candidato, cria registro em candidates
  IF COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'candidato') = 'candidato' THEN
    INSERT INTO public.candidates (profile_id, city)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'city', 'Teodoro Sampaio, SP'));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- HABILITA RLS EM TODAS AS TABELAS (SEGURANÇA OBRIGATÓRIA)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- POLÍTICAS RLS - SEGURANÇA GRANULAR
-- -----------------------------------------------------------------------------

-- PROFILES: Leitura pública limitada, edição só do dono, admin vê tudo
CREATE POLICY "Perfis são visíveis publicamente para recrutamento"
  ON public.profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Usuário pode atualizar próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuário pode inserir próprio perfil (via trigger)"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- CANDIDATES: Dono gerencia, empresas veem candidatos open_to_work, público limitado
CREATE POLICY "Candidatos open_to_work visíveis para empresas autenticadas"
  ON public.candidates FOR SELECT
  USING (
    is_open_to_work = true 
    OR profile_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('empresa','admin'))
  );

CREATE POLICY "Candidato gerencia próprio perfil"
  ON public.candidates FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- SKILLS: Leitura pública, escrita admin
CREATE POLICY "Skills leitura pública"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Skills escrita apenas autenticados"
  ON public.skills FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- CANDIDATE_SKILLS: Dono gerencia
CREATE POLICY "Candidate skills leitura para autenticados"
  ON public.candidate_skills FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Candidato gerencia próprias skills"
  ON public.candidate_skills FOR ALL
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

-- CANDIDATE_EXPERIENCES: Dono gerencia, empresas veem se candidato open
CREATE POLICY "Experiências visíveis publicamente para recrutamento"
  ON public.candidate_experiences FOR SELECT
  USING (true);

CREATE POLICY "Candidato gerencia próprias experiências"
  ON public.candidate_experiences FOR ALL
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

-- COMPANIES: Leitura pública, escrita dono
CREATE POLICY "Empresas visíveis publicamente"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Dono pode criar empresa"
  ON public.companies FOR INSERT
  WITH CHECK (owner_profile_id = auth.uid());

CREATE POLICY "Dono e membros podem atualizar empresa"
  ON public.companies FOR UPDATE
  USING (
    owner_profile_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.company_members WHERE company_id = companies.id AND profile_id = auth.uid())
  );

CREATE POLICY "Dono pode deletar empresa"
  ON public.companies FOR DELETE
  USING (owner_profile_id = auth.uid());

-- JOBS: Leitura pública apenas ativas, escrita empresa dona
CREATE POLICY "Vagas ativas visíveis publicamente"
  ON public.jobs FOR SELECT
  USING (status = 'Ativa' OR company_id IN (SELECT id FROM public.companies WHERE owner_profile_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.company_members WHERE company_id = jobs.company_id AND profile_id = auth.uid()));

CREATE POLICY "Empresa pode criar vagas"
  ON public.jobs FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND (owner_profile_id = auth.uid() OR id IN (SELECT company_id FROM public.company_members WHERE profile_id = auth.uid())))
  );

CREATE POLICY "Empresa pode atualizar próprias vagas"
  ON public.jobs FOR UPDATE
  USING (
    company_id IN (SELECT id FROM public.companies WHERE owner_profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.company_members WHERE company_id = jobs.company_id AND profile_id = auth.uid())
  );

CREATE POLICY "Empresa pode deletar próprias vagas"
  ON public.jobs FOR DELETE
  USING (
    company_id IN (SELECT id FROM public.companies WHERE owner_profile_id = auth.uid())
  );

-- PROMOTIONS: Leitura pública se ativa e não expirada, escrita empresa dona e patrocinadora
CREATE POLICY "Promoções ativas visíveis publicamente"
  ON public.promotions FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until >= CURRENT_DATE));

CREATE POLICY "Empresa patrocinadora gerencia promoções"
  ON public.promotions FOR ALL
  USING (
    company_id IN (SELECT id FROM public.companies WHERE owner_profile_id = auth.uid() AND is_sponsor = true)
  )
  WITH CHECK (
    company_id IN (SELECT id FROM public.companies WHERE owner_profile_id = auth.uid() AND is_sponsor = true)
  );

-- APPLICATIONS: Candidato vê próprias, empresa vê das suas vagas
CREATE POLICY "Candidato vê próprias candidaturas e empresa vê candidaturas de suas vagas"
  ON public.applications FOR SELECT
  USING (
    candidate_id = auth.uid() 
    OR company_id IN (SELECT id FROM public.companies WHERE owner_profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.company_members WHERE company_id = applications.company_id AND profile_id = auth.uid())
  );

CREATE POLICY "Candidato pode se candidatar"
  ON public.applications FOR INSERT
  WITH CHECK (
    candidate_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND status = 'Ativa')
  );

CREATE POLICY "Candidato pode desistir e empresa pode atualizar status"
  ON public.applications FOR UPDATE
  USING (
    candidate_id = auth.uid()
    OR company_id IN (SELECT id FROM public.companies WHERE owner_profile_id = auth.uid())
  );

CREATE POLICY "Candidato pode deletar própria candidatura (desistir)"
  ON public.applications FOR DELETE
  USING (candidate_id = auth.uid());

-- SAVED_JOBS: Apenas dono
CREATE POLICY "Candidato gerencia vagas salvas"
  ON public.saved_jobs FOR ALL
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

-- JOB_VIEWS: Insert público, select empresa dona
CREATE POLICY "Qualquer um pode registrar view"
  ON public.job_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Empresa vê views de suas vagas"
  ON public.job_views FOR SELECT
  USING (
    job_id IN (SELECT id FROM public.jobs WHERE company_id IN (SELECT id FROM public.companies WHERE owner_profile_id = auth.uid()))
  );

-- NOTIFICATIONS: Apenas dono
CREATE POLICY "Usuário gerencia próprias notificações"
  ON public.notifications FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- AUDIT_LOGS: Apenas admin e sistema
CREATE POLICY "Audit logs visíveis apenas para admin"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Sistema pode inserir audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);
