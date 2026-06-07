import { jobsMock } from '../data/jobs';
import { companiesMock } from '../data/companies';


// Esta classe simula as requisições que no futuro serão feitas para o Banco de Dados
export const apiService = {
  // Busca de Vagas
  async getJobs() {
    // Simula uma pequena latência de rede para testar os Loadings do Front
    await new Promise((resolve) => setTimeout(resolve, 400));
    return jobsMock;
  },

  async getJobById(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return jobsMock.find((job) => job.id === id);
  },

  // Busca de Empresas/Patrocinadores
  async getCompanies() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return companiesMock;
  },

  async getCompanyById(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return companiesMock.find((company) => company.id === id);
  }
};
