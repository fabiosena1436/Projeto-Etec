import { useState, useEffect } from 'react';

const STORAGE_KEY = '@ConectaTeodoro:appliedJobs';
const INITIAL_JOBS = ['job-1', 'job-3'];

export function useAppliedJobs() {
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
    return INITIAL_JOBS;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setAppliedJobIds(JSON.parse(e.newValue));
      }
    };
    
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      setAppliedJobIds(customEvent.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('appliedJobsUpdated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('appliedJobsUpdated', handleCustomEvent);
    };
  }, []);

  const updateAndSync = (next: string[]) => {
    setAppliedJobIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('appliedJobsUpdated', { detail: next }));
  };

  const applyToJob = (jobId: string) => {
    if (appliedJobIds.includes(jobId)) return;
    updateAndSync([...appliedJobIds, jobId]);
  };

  const withdrawFromJob = (jobId: string) => {
    updateAndSync(appliedJobIds.filter(id => id !== jobId));
  };

  const hasApplied = (jobId: string) => appliedJobIds.includes(jobId);

  return {
    appliedJobIds,
    applyToJob,
    withdrawFromJob,
    hasApplied
  };
}