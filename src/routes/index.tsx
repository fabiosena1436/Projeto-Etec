import { Routes, Route, Navigate } from 'react-router-dom';
import { DefaultLayout } from '../layouts/DefaultLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

import { Home } from '../pages/Home';
import { JobsList } from '../pages/JobsList';
import { JobDetails } from '../pages/JobDetails';
import { CompaniesList } from '../pages/CompaniesList';
import { SponsorProfile } from '../pages/SponsorProfile';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';

import { CandidateDashboard } from '../pages/CandidateDashboard';
import { CandidateProfile } from '../pages/CandidateProfile';
import { SavedJobs } from '../pages/SavedJobs';
import { CompanyDashboard } from '../pages/CompanyDashboard';
import { CreateJob } from '../pages/CreateJob';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas de Autenticação Autônomas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />

      {/* Layout Público (Visitantes e Navegação da Cidade) */}
      <Route path="/" element={<DefaultLayout />}>
        <Route index element={<Home />} />
        <Route path="vagas" element={<JobsList />} />
        <Route path="vagas/:id" element={<JobDetails />} />
        <Route path="empresas" element={<CompaniesList />} />
        <Route path="patrocinador/:id" element={<SponsorProfile />} />
      </Route>

      {/* Layout Protegido (Dashboard unificado sob o prefixo /dashboard) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Painel do Candidato */}
        <Route path="candidato" element={<CandidateDashboard />} />
        <Route path="candidato/perfil/:id" element={<CandidateProfile />} />
        <Route path="candidato/salvas" element={<SavedJobs />} />
        
        {/* Painel da Empresa */}
        <Route path="empresa" element={<CompanyDashboard />} />
        <Route path="empresa/vaga/nova" element={<CreateJob />} />
        <Route path="empresa/vaga/:id/editar" element={<CreateJob />} />
      </Route>

      {/* Fallback para rotas inexistentes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
