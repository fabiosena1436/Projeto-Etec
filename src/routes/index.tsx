import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DefaultLayout } from '../layouts/DefaultLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { CandidateDashboard } from '../pages/CandidateDashboard';
import { CandidateProfile } from '../pages/CandidateProfile';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Layout padrão para visitantes (com Header institucional) */}
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* Layout de Dashboard para usuários logados (com Bottom Nav no Mobile) */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="candidato/painel" element={<CandidateDashboard />} />
          <Route path="candidato/:id" element={<CandidateProfile />} />
          {/* Futuras rotas aqui: /vagas, /empresas */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
