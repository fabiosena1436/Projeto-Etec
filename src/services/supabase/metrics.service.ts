import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface PublicMetrics {
  active_jobs: number;
  companies: number;
  candidates: number;
  applications: number;
}

export interface CompanyMetrics {
  active_jobs: number;
  total_jobs: number;
  total_applications: number;
  applications_last_7d: number;
  total_views: number;
  sponsor_active: boolean;
  promotions_count: number;
}

export const metricsService = {
  async getPublic(): Promise<PublicMetrics> {
    if (!isSupabaseConfigured || !supabase) {
      return { active_jobs: 5, companies: 4, candidates: 3, applications: 12 };
    }
    const { data, error } = await (supabase as any).rpc('get_public_metrics');
    if (error || !data) {
      // fallback: contagens diretas (funciona mesmo sem a migration 005)
      const [jobs, companies] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'Ativa'),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
      ]);
      return { active_jobs: jobs.count || 0, companies: companies.count || 0, candidates: 0, applications: 0 };
    }
    return data as PublicMetrics;
  },

  async getCompany(companyId: string): Promise<CompanyMetrics | null> {
    if (!isSupabaseConfigured || !supabase) {
      return { active_jobs: 1, total_jobs: 1, total_applications: 3, applications_last_7d: 2, total_views: 128, sponsor_active: false, promotions_count: 0 };
    }
    const { data, error } = await (supabase as any).rpc('get_company_dashboard_metrics', { company_uuid: companyId });
    if (error) {
      console.error('Erro métricas empresa:', error.message);
      return null;
    }
    return data as CompanyMetrics;
  },
};
