// Tipos gerados manualmente baseados no schema SQL
// Em produção, gere automaticamente com: supabase gen types typescript --project-id <id> > src/types/database.ts

export type UserRole = 'candidato' | 'empresa' | 'admin';
export type JobType = 'Presencial' | 'Remoto' | 'Híbrido' | 'Estágio' | 'Jovem Aprendiz' | 'Freelancer' | 'Temporário';
export type JobStatus = 'Ativa' | 'Encerrada' | 'Rascunho' | 'Em Analise' | 'Expirada';
export type ApplicationStatus = 'enviada' | 'visualizada' | 'em_analise' | 'pre_selecionado' | 'aprovada' | 'rejeitada' | 'desistiu';
export type CompanyMemberRole = 'owner' | 'admin' | 'recruiter';

export interface Profile {
  id: string;
  role: UserRole;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  city: string;
  state: string;
  is_verified: boolean;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  profile_id: string;
  about: string | null;
  profession: string | null;
  age: number | null;
  education: string | null;
  resume_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  city: string;
  experience_years: number;
  availability: string | null;
  profile_views: number;
  completion_percent: number;
  is_open_to_work: boolean;
  created_at: string;
  updated_at: string;
  // joins
  profile?: Profile;
  skills?: CandidateSkill[];
  experiences?: CandidateExperience[];
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  created_at: string;
}

export interface CandidateSkill {
  id: string;
  candidate_id: string;
  skill_id: string;
  level: number | null;
  created_at: string;
  skill?: Skill;
}

export interface CandidateExperience {
  id: string;
  candidate_id: string;
  company_name: string;
  role: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
}

export interface Company {
  id: string;
  owner_profile_id: string;
  name: string;
  slug: string;
  industry: string;
  description: string | null;
  location: string;
  city: string;
  state: string;
  contact_email: string;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  banner_url: string | null;
  slogan: string | null;
  cnpj: string | null;
  is_sponsor: boolean;
  is_verified: boolean;
  sponsor_expires_at: string | null;
  views_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
  // joins
  owner?: Profile;
  promotions?: Promotion[];
  jobs_count?: number;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  city: string;
  type: JobType;
  salary_min: number | null;
  salary_max: number | null;
  salary_text: string;
  requirements: string[];
  benefits: string[];
  responsibilities: string[];
  status: JobStatus;
  experience_level: string | null;
  education_required: string | null;
  vacancies: number;
  views_count: number;
  applications_count: number;
  expires_at: string | null;
  posted_at: string;
  created_at: string;
  updated_at: string;
  // joins
  company?: Company;
}

export interface JobWithCompany extends Job {
  company_name: string;
  company_logo_url: string | null;
  company_is_sponsor: boolean;
  company_is_verified: boolean;
  company_industry: string;
  company_slogan: string | null;
}

export interface Promotion {
  id: string;
  company_id: string;
  title: string;
  description: string;
  image_url: string | null;
  price: number | null;
  discount_price: number | null;
  valid_until: string | null;
  is_active: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  company_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  expected_salary: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // joins
  job?: Job;
  candidate?: Profile;
  company?: Company;
}

export interface SavedJob {
  id: string;
  candidate_id: string;
  job_id: string;
  created_at: string;
  job?: JobWithCompany;
}

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

// Supabase Database type para client tipado
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string; full_name: string };
        Update: Partial<Profile>;
      };
      candidates: {
        Row: Candidate;
        Insert: Partial<Candidate> & { profile_id: string };
        Update: Partial<Candidate>;
      };
      skills: {
        Row: Skill;
        Insert: Partial<Skill> & { name: string; slug: string };
        Update: Partial<Skill>;
      };
      candidate_skills: {
        Row: CandidateSkill;
        Insert: Partial<CandidateSkill> & { candidate_id: string; skill_id: string };
        Update: Partial<CandidateSkill>;
      };
      candidate_experiences: {
        Row: CandidateExperience;
        Insert: Partial<CandidateExperience> & { candidate_id: string; company_name: string; role: string; start_date: string };
        Update: Partial<CandidateExperience>;
      };
      companies: {
        Row: Company;
        Insert: Partial<Company> & { owner_profile_id: string; name: string; slug: string; industry: string; location: string; contact_email: string };
        Update: Partial<Company>;
      };
      jobs: {
        Row: Job;
        Insert: Partial<Job> & { company_id: string; title: string; slug: string; description: string; location: string; salary_text: string };
        Update: Partial<Job>;
      };
      promotions: {
        Row: Promotion;
        Insert: Partial<Promotion> & { company_id: string; title: string; description: string };
        Update: Partial<Promotion>;
      };
      applications: {
        Row: Application;
        Insert: Partial<Application> & { job_id: string; candidate_id: string; company_id: string };
        Update: Partial<Application>;
      };
      saved_jobs: {
        Row: SavedJob;
        Insert: Partial<SavedJob> & { candidate_id: string; job_id: string };
        Update: Partial<SavedJob>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> & { profile_id: string; title: string; message: string };
        Update: Partial<Notification>;
      };
    };
    Views: {
      v_jobs_with_company: {
        Row: JobWithCompany;
      };
    };
    Functions: {
      search_jobs: {
        Args: {
          search_query: string;
          filter_type?: JobType;
          filter_city?: string;
          limit_count?: number;
          offset_count?: number;
        };
        Returns: JobWithCompany[];
      };
      increment_job_view: {
        Args: { job_uuid: string };
        Returns: void;
      };
      apply_to_job: {
        Args: { job_uuid: string; cover_letter_text?: string };
        Returns: string;
      };
    };
  };
}
