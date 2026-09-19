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

    if (error) {
      const m = error.message || '';
      if (m.includes('já se candidatou')) throw new Error('Você já se candidatou a esta vaga.');
      if (m.includes('própria empresa')) throw new Error('Você não pode se candidatar a vagas da sua própria empresa.');
      if (m.includes('não autenticado')) throw new Error('Faça login como candidato para se candidatar.');
      throw new Error(m);
    }

    const { data: application, error: fetchError } = await (supabase as any)
      .from('applications')
      .select('*, job:jobs(*), company:companies(*)')
      .eq('id', data)
      .single();

    if (fetchError) return { id: data } as Application;
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
    if (!isSupabaseConfigured || !supabase) {
      const { usersMock } = await import('../../data/users');
      return usersMock.slice(0, 2).map((u, i) => ({
        id: `mock-app-${i}`,
        job_id: 'job-3',
        candidate_id: u.id,
        company_id: companyId,
        status: 'enviada' as const,
        cover_letter: null,
        expected_salary: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        candidate: { id: u.id, full_name: u.name, avatar_url: u.avatarUrl, city: u.city, phone: u.phone, email: u.email || '' } as any,
        candidate_details: { profession: u.profession, skills: u.skills.map(s => ({ skill: { name: s } })) } as any,
      })) as any;
    }
    // applications.candidate_id -> profiles.id ; candidates.profile_id -> profiles.id
    // Então os detalhes do candidato são embutidos via profiles.
    const { data, error } = await (supabase as any)
      .from('applications')
      .select('*, job:jobs(id,title,status), candidate:profiles!applications_candidate_id_fkey(*, details:candidates(profession, resume_url, skills:candidate_skills(skill:skills(name))))')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      const { data: simple, error: e2 } = await (supabase as any)
        .from('applications')
        .select('*, job:jobs(id,title,status), candidate:profiles!applications_candidate_id_fkey(*)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (e2) throw e2;
      return simple as unknown as Application[];
    }

    // Achata candidate.details -> candidate_details
    return (data as any[]).map(a => {
      const details = a.candidate?.details;
      const flat = Array.isArray(details) ? details[0] : details;
      if (a.candidate) delete a.candidate.details;
      return { ...a, candidate_details: flat || null };
    }) as unknown as Application[];
  },

  async markViewed(applicationId: string): Promise<void> {
    if (!supabase) return;
    await (supabase as any).rpc('mark_application_viewed', { application_uuid: applicationId }).then(() => {}, () => {});
  },

  async toggleSaved(jobId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      const key = '@ConectaTeodoro:savedJobs';
      const saved: string[] = JSON.parse(localStorage.getItem(key) || '[]');
      const next = saved.includes(jobId) ? saved.filter(id => id !== jobId) : [...saved, jobId];
      localStorage.setItem(key, JSON.stringify(next));
      return next.includes(jobId);
    }
    const { data, error } = await (supabase as any).rpc('toggle_saved_job', { job_uuid: jobId });
    if (error) {
      // fallback sem RPC
      const isSaved = await this.isJobSaved(jobId);
      if (isSaved) { await this.unsaveJob(jobId); return false; }
      await this.saveJob(jobId); return true;
    }
    return !!data;
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
    if (!isSupabaseConfigured || !supabase) {
      const saved: string[] = JSON.parse(localStorage.getItem('@ConectaTeodoro:savedJobs') || '[]');
      const { jobsService } = await import('./jobs.service');
      const all = await jobsService.getAll({ limit: 100 });
      return saved
        .map(id => all.find(j => j.id === id))
        .filter(Boolean)
        .map(j => ({ id: `mock-saved-${j!.id}`, candidate_id: 'mock', job_id: j!.id, created_at: new Date().toISOString(), job: j! }));
    }
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
    if (!isSupabaseConfigured || !supabase) {
      const saved: string[] = JSON.parse(localStorage.getItem('@ConectaTeodoro:savedJobs') || '[]');
      return saved.includes(jobId);
    }
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
