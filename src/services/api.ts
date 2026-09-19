// Camada de compatibilidade: expõe os dados no formato "legado" (camelCase)
// usado pelos componentes visuais, buscando sempre do Supabase quando configurado
// e caindo para o mock apenas em modo demonstração.

import { jobsService } from './supabase/jobs.service';
import { companiesService } from './supabase/companies.service';
import type { Job } from '../data/jobs';
import type { Company } from '../data/companies';
import type { JobWithCompany, Company as DbCompany, Job as DbJob, Promotion as DbPromotion } from '../types/database';

export function mapJob(j: JobWithCompany | DbJob): Job {
  const withCompany = j as Partial<JobWithCompany>;
  const embedded = (j as DbJob).company;
  return {
    id: j.id,
    title: j.title,
    companyId: j.company_id,
    location: j.location,
    type: j.type as Job['type'],
    salary: j.salary_text,
    requirements: j.requirements || [],
    benefits: j.benefits || [],
    description: j.description,
    postedAt: j.posted_at,
    status: j.status as Job['status'],
    companyName: withCompany.company_name ?? embedded?.name,
    companyLogoUrl: withCompany.company_logo_url ?? embedded?.logo_url ?? null,
    companyIsSponsor: withCompany.company_is_sponsor ?? embedded?.is_sponsor ?? false,
    viewsCount: j.views_count,
    applicationsCount: j.applications_count,
  };
}

export function mapPromotion(p: DbPromotion) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    imageUrl: p.image_url || undefined,
    price: p.price != null ? Number(p.price) : undefined,
    discountPrice: p.discount_price != null ? Number(p.discount_price) : undefined,
    validUntil: p.valid_until || undefined,
  };
}

export function mapCompany(c: DbCompany): Company {
  return {
    id: c.id,
    name: c.name,
    industry: c.industry,
    logoUrl: c.logo_url || '',
    description: c.description || '',
    location: c.location,
    contactEmail: c.contact_email,
    website: c.website || undefined,
    slogan: c.slogan || undefined,
    isSponsor: c.is_sponsor,
    promotions: (c.promotions || []).map(mapPromotion),
  };
}

export const apiService = {
  async getJobs(params?: { search?: string; type?: string; limit?: number }): Promise<Job[]> {
    const jobs = await jobsService.getAll({
      search: params?.search,
      type: params?.type as any,
      limit: params?.limit || 100,
    });
    return jobs.map(mapJob);
  },

  async getJobById(id: string): Promise<Job | undefined> {
    const job = await jobsService.getById(id);
    return job ? mapJob(job) : undefined;
  },

  async getJobsByCompany(companyId: string): Promise<Job[]> {
    const jobs = await jobsService.getByCompany(companyId);
    return jobs.map(mapJob);
  },

  async getCompanies(): Promise<Company[]> {
    const companies = await companiesService.getAll({ limit: 100 });
    return companies.map(mapCompany);
  },

  async getCompanyById(id: string): Promise<Company | undefined> {
    const company = await companiesService.getById(id);
    return company ? mapCompany(company) : undefined;
  },

  jobs: jobsService,
  companies: companiesService,
};

export { jobsService } from './supabase/jobs.service';
export { companiesService } from './supabase/companies.service';
export { authService } from './supabase/auth.service';
export { applicationsService } from './supabase/applications.service';
export { candidatesService } from './supabase/candidates.service';
export { metricsService } from './supabase/metrics.service';
