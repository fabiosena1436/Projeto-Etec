import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DefaultLayout } from '../layouts/DefaultLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { CandidateDashboard } from '../pages/CandidateDashboard';
import { CandidateProfile } from '../pages/CandidateProfile';
import { JobsList } from '../pages/JobsList';
import { JobDetails } from '../pages/JobDetails';
import { CompanyDashboard } from '../pages/CompanyDashboard';
import { CreateJob } from '../pages/CreateJob';
import { CompaniesList } from '../pages/CompaniesList';
import { SavedJobs } from '../pages/SavedJobs';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        
        {/* Layout padrão para visitantes (com Header institucional) */}
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Home />} />
          <Route path="vagas" element={<JobsList />} />
          <Route path="vagas/:id" element={<JobDetails />} />
          <Route path="empresas" element={<CompaniesList />} />
        </Route>

        {/* Layout de Dashboard para usuários logados (com Bottom Nav no Mobile) */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="candidato/painel" element={<CandidateDashboard />} />
          <Route path="candidato/:id" element={<CandidateProfile />} />
          <Route path="candidato/salvas" element={<SavedJobs />} />
          <Route path="empresa/painel" element={<CompanyDashboard />} />
          <Route path="empresa/vaga/nova" element={<CreateJob />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
