import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../PageLoader';
import type { UserRole } from '../../types/database';

interface ProtectedRouteProps {
  /** Se informado, só permite estes papéis. Admin sempre passa. */
  roles?: UserRole[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Verificando sessão..." />;

  if (!isAuthenticated) {
    const wanted = roles?.[0] ? `?type=${roles[0]}` : '';
    return <Navigate to={`/login${wanted}`} replace state={{ from: location.pathname }} />;
  }

  if (roles && role && role !== 'admin' && !roles.includes(role)) {
    return <Navigate to={role === 'empresa' ? '/empresa/painel' : '/candidato/painel'} replace />;
  }

  return <Outlet />;
}
