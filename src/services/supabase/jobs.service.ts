import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { jobsMock } from '../../data/jobs';
import { companiesMock } from '../../data/companies';
import type { JobWithCompany, JobType, Job } from '../../types/database';

const USE_MOCK_FALLBACK = true;

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
      if (params?.search) {
        const { data, error } = await (supabase as any).rpc('search_jobs', {
          search_query: params.search,
          filter_type: params.type || null,
          filter_city: params.city || null,
          limit_count: params.limit || 20,
          offset_count: params.offset || 0,
        });
        if (error) throw error;
        return data as JobWithCompany[];
      }

      let query = (supabase as any)
        .from('v_jobs_with_company')
        .select('*')
        .eq('status', (params?.status as any) || 'Ativa')
        .order('posted_at', { ascending: false });

      if (params?.type) query = query.eq('type', params.type);
      if (params?.city) query = query.ilike('city', `%${params.city}%`);
      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) query = query.range(params.offset, (params.offset + (params.limit || 20)) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data as JobWithCompany[];
    } catch (err) {
      console.error('Erro ao buscar vagas:', err);
      if (USE_MOCK_FALLBACK) return mapMockToJobWithCompany();
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
      if (USE_MOCK_FALLBACK) return mapMockToJobWithCompany().find(j => j.id === id) || null;
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

  async create(job: any): Promise<Job> {
    if (!supabase) throw new Error('Supabase não configurado');
    const slug = `${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
    const { data, error } = await (supabase as any)
      .from('jobs')
      .insert({ ...job, slug, status: 'Ativa' })
      .select()
      .single();
    if (error) throw error;
    return data as Job;
  },

  async update(id: string, updates: Partial<Job>): Promise<Job> {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await (supabase as any)
      .from('jobs')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Job;
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
