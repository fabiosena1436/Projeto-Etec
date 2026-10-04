import type { Job } from '../data/jobs';
import type { Company } from '../data/companies';
import type { User } from '../data/users';
export interface Account { id: string; email: string; name: string; role: 'candidato' | 'empresa' }
export interface Application { id: string; jobId: string; candidateId: string; status: string; job: Job }
export interface CompanyDashboardData { company: Company; jobs: Job[]; applications: { application: Omit<Application, 'job'>; candidate: User }[] }
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api/${path}`, { method, credentials: 'same-origin', headers: method !== 'GET' ? { 'Content-Type': 'application/json' } : {}, body: method !== 'GET' ? JSON.stringify(body || {}) : undefined });
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) throw new ApiError(response.status, data?.error || 'Não foi possível acessar o serviço. Tente novamente.');
  return data as T;
}
export const apiService = {
  getJobs: () => request<(Job & { company?: Company })[]>('jobs'),
  getJobById: (id: string) => request<Job & { company?: Company }>(`jobs/${id}`),
  getCompanies: () => request<Company[]>('companies'),
  getCompanyById: (id: string) => request<Company>(`companies/${id}`),
  getMyCompany: () => request<Company>('company/me'),
  getCompanyDashboard: () => request<CompanyDashboardData>('company/dashboard'),
  updateCompany: (body: unknown) => request<Company>('company/me', 'PATCH', body),
  createJob: (body: unknown) => request<Job>('jobs', 'POST', body),
  updateJob: (id: string, body: unknown) => request<Job>(`jobs/${id}`, 'PATCH', body),
  setJobStatus: (id: string, status: string) => request<Job>(`jobs/${id}/status`, 'PATCH', { status }),
  getMyCandidate: () => request<User>('candidate/me'),
  getCandidate: (id: string) => request<User>(`candidates/${id}`),
  updateCandidate: (body: unknown) => request<User>('candidate/me', 'PATCH', body),
  getApplications: () => request<Application[]>('applications'),
  apply: (jobId: string) => request('applications', 'POST', { jobId }),
  withdraw: (jobId: string) => request(`applications/${jobId}`, 'DELETE'),
  getSavedJobs: () => request<Job[]>('saved-jobs'),
  saveJob: (id: string) => request(`saved-jobs/${id}`, 'POST'),
  unsaveJob: (id: string) => request(`saved-jobs/${id}`, 'DELETE'),
};
