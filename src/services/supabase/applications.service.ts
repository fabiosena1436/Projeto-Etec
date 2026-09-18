import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Application, SavedJob } from '../../types/database';

const STORAGE_KEY = '@ConectaTeodoro:appliedJobs';

export const applicationsService = {
  async apply(jobId: string, coverLetter?: string): Promise<Application> {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem(STORAGE_KEY);
      const applied: string[] = stored ? JSON.parse(stored) : [];
      if (!applied.includes(jobId)) {
        const next = [...applied, jobId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('appliedJobsUpdated', { detail: next }));
      }
      return {
        id: `mock-${Date.now()}`,
        job_id: jobId,
        candidate_id: 'mock-candidate',
        company_id: 'mock-company',
        status: 'enviada',
        cover_letter: coverLetter || null,
        expected_salary: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data: canProceed } = await (supabase as any).rpc('check_rate_limit', {
      action_name: 'apply_job',
      max_per_hour: 10,
    });

    if (canProceed === false) {
      throw new Error('Muitas candidaturas em pouco tempo. Tente novamente em 1 hora.');
    }

    const { data, error } = await (supabase as any).rpc('apply_to_job', {
      job_uuid: jobId,
      cover_letter_text: coverLetter || null,
    });

    if (error) throw new Error(error.message);

    const { data: application, error: fetchError } = await (supabase as any)
      .from('applications')
      .select('*, job:jobs(*), company:companies(*)')
      .eq('id', data)
      .single();

    if (fetchError) throw fetchError;
    return application as unknown as Application;
  },

  async getMyApplications(): Promise<Application[]> {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem(STORAGE_KEY);
      const applied: string[] = stored ? JSON.parse(stored) : ['job-1', 'job-3'];
      return applied.map(id => ({
        id: `mock-app-${id}`,
        job_id: id,
        candidate_id: 'mock-candidate',
        company_id: 'mock-company',
        status: 'enviada' as const,
        cover_letter: null,
        expected_salary: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    const { data, error } = await (supabase as any)
      .from('applications')
      .select('*, job:jobs(*, company:companies(*))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as Application[];
  },

  async getCompanyApplications(companyId: string): Promise<Application[]> {
    if (!supabase) return [];
    const { data, error } = await (supabase as any)
      .from('applications')
      .select('*, job:jobs(*), candidate:profiles!applications_candidate_id_fkey(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as Application[];
  },

  async updateStatus(applicationId: string, status: Application['status']): Promise<Application> {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await (supabase as any)
      .from('applications')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();
    if (error) throw error;
    if (data) {
      await (supabase as any).from('notifications').insert({
        profile_id: (data as any).candidate_id,
        title: `Candidatura ${status}`,
        message: `Sua candidatura foi atualizada para: ${status}`,
        type: 'application',
        link: `/vagas/${(data as any).job_id}`,
      });
    }
    return data as unknown as Application;
  },

  async withdraw(jobId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem(STORAGE_KEY);
      const applied: string[] = stored ? JSON.parse(stored) : [];
      const next = applied.filter(id => id !== jobId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('appliedJobsUpdated', { detail: next }));
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { error } = await (supabase as any)
      .from('applications')
      .delete()
      .eq('job_id', jobId)
      .eq('candidate_id', user.id);
    if (error) throw error;
  },

  async hasApplied(jobId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem(STORAGE_KEY);
      const applied: string[] = stored ? JSON.parse(stored) : ['job-1', 'job-3'];
      return applied.includes(jobId);
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data, error } = await (supabase as any)
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', user.id)
      .maybeSingle();
    if (error) return false;
    return !!data;
  },

  async getSavedJobs(): Promise<SavedJob[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await (supabase as any)
      .from('saved_jobs')
      .select('*, job:v_jobs_with_company(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as SavedJob[];
  },

  async saveJob(jobId: string): Promise<SavedJob> {
    if (!isSupabaseConfigured || !supabase) {
      return { id: `mock-saved-${jobId}`, candidate_id: 'mock', job_id: jobId, created_at: new Date().toISOString() };
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data, error } = await (supabase as any)
      .from('saved_jobs')
      .insert({ candidate_id: user.id, job_id: jobId })
      .select()
      .single();
    if (error) throw error;
    return data as unknown as SavedJob;
  },

  async unsaveJob(jobId: string): Promise<void> {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await (supabase as any)
      .from('saved_jobs')
      .delete()
      .eq('job_id', jobId)
      .eq('candidate_id', user.id);
    if (error) throw error;
  },

  async isJobSaved(jobId: string): Promise<boolean> {
    if (!supabase) return false;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await (supabase as any)
      .from('saved_jobs')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', user.id)
      .maybeSingle();
    return !!data;
  },
};
