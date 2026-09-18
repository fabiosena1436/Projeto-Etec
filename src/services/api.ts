// API Service - Agora híbrido: tenta Supabase primeiro, fallback para mock
// Mantém compatibilidade total com código existente

import { jobsService } from './supabase/jobs.service';
import { companiesService } from './supabase/companies.service';
import { isSupabaseConfigured } from '../lib/supabase';

export const apiService = {
  // Busca de Vagas
  async getJobs() {
    try {
      const jobs = await jobsService.getAll({ limit: 50 });
      // Converte para formato antigo para compatibilidade
      if (isSupabaseConfigured && jobs.length > 0) {
        return jobs.map(j => ({
          id: j.id,
          title: j.title,
          companyId: j.company_id,
          location: j.location,
          type: j.type,
          salary: j.salary_text,
          requirements: j.requirements,
          benefits: j.benefits,
          description: j.description,
          postedAt: j.posted_at,
          status: j.status,
        }));
      }
      // Fallback usa o service que já faz fallback mock internamente
      const raw = await jobsService.getAll({ limit: 50 });
      return raw.map(j => ({
        id: j.id,
        title: j.title,
        companyId: j.company_id,
        location: j.location,
        type: j.type,
        salary: j.salary_text,
        requirements: j.requirements,
        benefits: j.benefits,
        description: j.description,
        postedAt: j.posted_at,
        status: j.status,
      }));
    } catch (e) {
      console.error('Erro em getJobs, usando fallback:', e);
      // Último fallback para mock direto
      const { jobsMock } = await import('../data/jobs');
      await new Promise((resolve) => setTimeout(resolve, 400));
      return jobsMock;
    }
  },

  async getJobById(id: string) {
    try {
      const job = await jobsService.getById(id);
      if (!job) return undefined;
      return {
        id: job.id,
        title: job.title,
        companyId: job.company_id,
        location: job.location,
        type: job.type,
        salary: job.salary_text,
        requirements: job.requirements,
        benefits: job.benefits,
        description: job.description,
        postedAt: job.posted_at,
        status: job.status,
      };
    } catch (e) {
      console.error('Erro getJobById:', e);
      const { jobsMock } = await import('../data/jobs');
      await new Promise((resolve) => setTimeout(resolve, 200));
      return jobsMock.find((job) => job.id === id);
    }
  },

  // Busca de Empresas/Patrocinadores
  async getCompanies() {
    try {
      const companies = await companiesService.getAll({ limit: 50 });
      return companies.map(c => ({
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
        promotions: [], // será carregado separado se necessário
      }));
    } catch (e) {
      console.error('Erro getCompanies:', e);
      const { companiesMock } = await import('../data/companies');
      await new Promise((resolve) => setTimeout(resolve, 400));
      return companiesMock;
    }
  },

  async getCompanyById(id: string) {
    try {
      const company = await companiesService.getById(id);
      if (!company) return undefined;
      return {
        id: company.id,
        name: company.name,
        industry: company.industry,
        logoUrl: company.logo_url || '',
        description: company.description || '',
        location: company.location,
        contactEmail: company.contact_email,
        website: company.website || undefined,
        slogan: company.slogan || undefined,
        isSponsor: company.is_sponsor,
        promotions: (company as any).promotions || [],
      };
    } catch (e) {
      console.error('Erro getCompanyById:', e);
      const { companiesMock } = await import('../data/companies');
      await new Promise((resolve) => setTimeout(resolve, 200));
      return companiesMock.find((company) => company.id === id);
    }
  },

  // Novos métodos com Supabase (para uso futuro no código novo)
  jobs: jobsService,
  companies: companiesService,
};

// Re-exporta services para uso direto no código novo
export { jobsService } from './supabase/jobs.service';
export { companiesService } from './supabase/companies.service';
export { authService } from './supabase/auth.service';
export { applicationsService } from './supabase/applications.service';
export { candidatesService } from './supabase/candidates.service';
