import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';
export function useAppliedJobs() {
  const { user } = useAuth();
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    const load = () => {
      if (user?.role !== 'candidato') { setAppliedJobIds([]); return; }
      apiService.getApplications().then(rows => { if (active) setAppliedJobIds(rows.map(row => row.jobId)); }).catch(() => { if (active) setAppliedJobIds([]); });
    };
    load(); window.addEventListener('applicationsUpdated', load);
    return () => { active = false; window.removeEventListener('applicationsUpdated', load); };
  }, [user?.id, user?.role]);
  const applyToJob = async (id: string) => { await apiService.apply(id); window.dispatchEvent(new Event('applicationsUpdated')); };
  const withdrawFromJob = async (id: string) => { await apiService.withdraw(id); window.dispatchEvent(new Event('applicationsUpdated')); };
  return { appliedJobIds, applyToJob, withdrawFromJob, hasApplied: (id: string) => appliedJobIds.includes(id) };
}
