import { useCallback, useEffect, useState } from 'react';
import { applicationsService } from '../services/supabase/applications.service';
import { useAuth } from './useAuth';
import type { Application } from '../types/database';

const EVENT = 'appliedJobsUpdated';

/**
 * Candidaturas do candidato logado, sincronizadas com o Supabase.
 * Em modo demonstração usa localStorage (via applicationsService).
 */
export function useAppliedJobs() {
  const { isAuthenticated, isCandidato, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated || !isCandidato) {
      setApplications([]);
      setLoading(false);
      return;
    }
    try {
      const apps = await applicationsService.getMyApplications();
      setApplications(apps);
    } catch (e) {
      console.error('Erro ao carregar candidaturas', e);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, isCandidato]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [refresh]);

  const appliedJobIds = applications.map(a => a.job_id);

  const applyToJob = async (jobId: string, coverLetter?: string) => {
    await applicationsService.apply(jobId, coverLetter);
    window.dispatchEvent(new CustomEvent(EVENT));
  };

  const withdrawFromJob = async (jobId: string) => {
    await applicationsService.withdraw(jobId);
    window.dispatchEvent(new CustomEvent(EVENT));
  };

  const hasApplied = (jobId: string) => appliedJobIds.includes(jobId);

  return { applications, appliedJobIds, loading, applyToJob, withdrawFromJob, hasApplied, refresh };
}
