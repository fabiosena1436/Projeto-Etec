import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { jobsMock } from '../../data/jobs';
import { companiesMock } from '../../data/companies';
import type { JobWithCompany, JobType, Job } from '../../types/database';

const USE_MOCK_FALLBACK = true;

export type JobInput = {
  company_id: string;
  title: string;
  description: string;
  location: string;
  type: JobType;
  salary_text: string;
  requirements: string[];
  benefits: string[];
  status?: string;
  vacancies?: number;
  experience_level?: string | null;
  education_required?: string | null;
  expires_at?: string | null;
};

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Extrai salary_min/max de textos como "R$ 1.600,00 + Comissão" ou "R$ 2.000 a R$ 3.000" */
export function parseSalary(text: string): { salary_min: number | null; salary_max: number | null } {
  const nums = (text.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?/g) || [])
    .map(n => Math.round(parseFloat(n.replace(/\./g, '').replace(',', '.'))))
    .filter(n => Number.isFinite(n) && n >= 100 && n <= 1_000_000);
  if (nums.length === 0) return { salary_min: null, salary_max: null };
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return { salary_min: min, salary_max: max > min ? max : null };
}

export function translateDbError(error: any): string {
  const msg: string = error?.message || String(error);
  if (msg.includes('jobs_title_check')) return 'O título deve ter entre 5 e 120 caracteres.';
  if (msg.includes('jobs_description_check')) return 'A descrição deve ter pelo menos 20 caracteres.';
  if (msg.includes('row-level security')) return 'Você não tem permissão para esta ação. Verifique se sua empresa está cadastrada.';
  if (msg.includes('companies_website_check')) return 'O site deve começar com http:// ou https://';
  if (msg.includes('companies_cnpj_check') || msg.includes('companies_cnpj_key')) return 'CNPJ inválido ou já cadastrado.';
  if (msg.includes('profiles_phone_check')) return 'Telefone inválido. Use apenas números com DDD.';
  if (msg.includes('candidates_age_check')) return 'Idade deve estar entre 14 e 80 anos.';
  if (msg.includes('duplicate key')) return 'Registro duplicado.';
  return msg;
}

function mapMockToJobWithCompany(): JobWithCompany[] {
  return jobsMock.map(job => {
    const company = companiesMock.find(c => c.id === job.companyId);
    return {
      id: job.id,
      company_id: job.companyId,
      title: job.title,
      slug: job.id,
      description: job.description,
      location: job.location,
      city: 'Teodoro Sampaio',
      type: job.type as JobType,
      salary_min: null,
      salary_max: null,
      salary_text: job.salary,
      requirements: job.requirements,
      benefits: job.benefits,
      responsibilities: [],
      status: job.status as any,
      experience_level: null,
      education_required: null,
      vacancies: 1,
      views_count: Math.floor(Math.random() * 100),
      applications_count: Math.floor(Math.random() * 20),
      expires_at: null,
      posted_at: job.postedAt,
      created_at: job.postedAt,
      updated_at: job.postedAt,
      company_name: company?.name || 'Empresa',
      company_logo_url: company?.logoUrl || null,
      company_is_sponsor: company?.isSponsor || false,
      company_is_verified: true,
      company_industry: company?.industry || 'Geral',
      company_slogan: company?.slogan || null,
    };
  });
}

export const jobsService = {
  async getAll(params?: {
    search?: string;
    type?: JobType;
    city?: string;
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<JobWithCompany[]> {
    if (!isSupabaseConfigured || !supabase) {
      if (USE_MOCK_FALLBACK) {
        await new Promise(r => setTimeout(r, 400));
        let filtered = mapMockToJobWithCompany();
        if (params?.search) {
          const s = params.search.toLowerCase();
          filtered = filtered.filter(j => 
            j.title.toLowerCase().includes(s) || 
            j.description.toLowerCase().includes(s)
          );
        }
        if (params?.type) {
          filtered = filtered.filter(j => j.type === params.type);
        }
        return filtered.slice(params?.offset || 0, (params?.offset || 0) + (params?.limit || 20));
      }
      return [];
    }

    try {
      const status = (params?.status as any) || 'Ativa';

      if (params?.search && status === 'Ativa') {
        // Full-text (migration 005 devolve a linha completa da view)
        const { data, error } = await (supabase as any).rpc('search_jobs', {
          search_query: params.search,
          filter_type: params.type || null,
          filter_city: params.city || null,
          limit_count: params.limit || 20,
          offset_count: params.offset || 0,
        });
        if (!error && Array.isArray(data) && (data.length === 0 || 'description' in data[0])) {
          return data as JobWithCompany[];
        }
        // RPC antiga/ausente: cai para ILIKE abaixo
      }

      let query = (supabase as any)
        .from('v_jobs_with_company')
        .select('*')
        .eq('status', status)
        .order('company_is_sponsor', { ascending: false })
        .order('posted_at', { ascending: false });

      if (params?.search) {
        const s = params.search.replace(/[%,()]/g, ' ').trim();
        if (s) query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,company_name.ilike.%${s}%`);
      }
      if (params?.type) query = query.eq('type', params.type);
      if (params?.city) query = query.ilike('city', `%${params.city}%`);
      if (params?.offset) query = query.range(params.offset, (params.offset + (params.limit || 20)) - 1);
      else if (params?.limit) query = query.limit(params.limit);

      const { data, error } = await query;
      if (error) throw error;
      return data as JobWithCompany[];
    } catch (err) {
      console.error('Erro ao buscar vagas:', err);
      throw err;
    }
  },

  async getById(id: string): Promise<JobWithCompany | null> {
    if (!isSupabaseConfigured || !supabase) {
      await new Promise(r => setTimeout(r, 200));
      return mapMockToJobWithCompany().find(j => j.id === id) || null;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('v_jobs_with_company')
        .select('*')
        .or(`id.eq.${id},slug.eq.${id}`)
        .single();

      if (error) throw error;

      (supabase as any).rpc('increment_job_view', { job_uuid: (data as any).id }).then(() => {}, () => {});

      return data as JobWithCompany;
    } catch (err) {
      console.error('Erro ao buscar vaga:', err);
      return null;
    }
  },

  async getByCompany(companyId: string): Promise<Job[]> {
    if (!isSupabaseConfigured || !supabase) {
      await new Promise(r => setTimeout(r, 200));
      return jobsMock
        .filter(j => j.companyId === companyId)
        .map(j => ({
          id: j.id,
          company_id: j.companyId,
          title: j.title,
          slug: j.id,
          description: j.description,
          location: j.location,
          city: 'Teodoro Sampaio',
          type: j.type as JobType,
          salary_min: null,
          salary_max: null,
          salary_text: j.salary,
          requirements: j.requirements,
          benefits: j.benefits,
          responsibilities: [],
          status: j.status as any,
          experience_level: null,
          education_required: null,
          vacancies: 1,
          views_count: 0,
          applications_count: 0,
          expires_at: null,
          posted_at: j.postedAt,
          created_at: j.postedAt,
          updated_at: j.postedAt,
        }));
    }

    const { data, error } = await (supabase as any)
      .from('jobs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Job[];
  },

  async create(job: JobInput): Promise<Job> {
    if (!supabase) throw new Error('Supabase não configurado');
    const slug = `${slugify(job.title)}-${Date.now().toString(36)}`;
    const { data, error } = await (supabase as any)
      .from('jobs')
      .insert({ ...job, ...parseSalary(job.salary_text), slug, status: job.status || 'Ativa' })
      .select()
      .single();
    if (error) throw new Error(translateDbError(error));
    return data as Job;
  },

  async update(id: string, updates: Partial<Job>): Promise<Job> {
    if (!supabase) throw new Error('Supabase não configurado');
    const payload: any = { ...updates };
    if (updates.salary_text) Object.assign(payload, parseSalary(updates.salary_text));
    const { data, error } = await (supabase as any)
      .from('jobs')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(translateDbError(error));
    return data as Job;
  },

  /** Vaga individual da própria empresa (inclui encerradas/rascunho, via RLS) */
  async getOwnById(id: string): Promise<Job | null> {
    if (!isSupabaseConfigured || !supabase) {
      const all = await this.getByCompany('comp-3');
      return all.find(j => j.id === id) || null;
    }
    const { data, error } = await (supabase as any).from('jobs').select('*').eq('id', id).maybeSingle();
    if (error) return null;
    return data as Job | null;
  },

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await (supabase as any).from('jobs').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleStatus(id: string, currentStatus: string): Promise<Job> {
    const newStatus = currentStatus === 'Ativa' ? 'Encerrada' : 'Ativa';
    return this.update(id, { status: newStatus as any });
  },
};
