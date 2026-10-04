import { Routes, Route, Navigate } from 'react-router-dom';
import { DefaultLayout } from '../layouts/DefaultLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

import { Home } from '../pages/Home';
import { JobsList } from '../pages/JobsList';
import { JobDetails } from '../pages/JobDetails';
import { CompaniesList } from '../pages/CompaniesList';
import { SponsorProfile } from '../pages/SponsorProfile';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ResetPassword } from '../pages/ResetPassword';

import { CandidateDashboard } from '../pages/CandidateDashboard';
import { CandidateProfile } from '../pages/CandidateProfile';
import { SavedJobs } from '../pages/SavedJobs';
import { CompanyDashboard } from '../pages/CompanyDashboard';
import { CreateJob } from '../pages/CreateJob';

export function AppRoutes() {
  return (
    <Routes>
      {/* Autenticação (tela cheia) */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/redefinir-senha" element={<ResetPassword />} />

      {/* Público */}
      <Route path="/" element={<DefaultLayout />}>
        <Route index element={<Home />} />
        <Route path="vagas" element={<JobsList />} />
        <Route path="vagas/:id" element={<JobDetails />} />
        <Route path="empresas" element={<CompaniesList />} />
        <Route path="empresas/:id" element={<SponsorProfile />} />
        <Route path="patrocinador/:id" element={<SponsorProfile />} />
      </Route>

      {/* Área logada */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Perfil público do candidato: qualquer usuário logado (empresa vê como recrutador) */}
          <Route path="/candidato/:id" element={<CandidateProfile />} />

          <Route element={<ProtectedRoute roles={['candidato']} />}>
            <Route path="/candidato/painel" element={<CandidateDashboard />} />
            <Route path="/candidato/salvas" element={<SavedJobs />} />
          </Route>

          <Route element={<ProtectedRoute roles={['empresa']} />}>
            <Route path="/empresa/painel" element={<CompanyDashboard />} />
            <Route path="/empresa/vaga/nova" element={<CreateJob />} />
            <Route path="/empresa/vaga/:id/editar" element={<CreateJob />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
