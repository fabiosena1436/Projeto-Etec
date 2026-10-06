import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../PageLoader';
import type { UserRole } from '../../types/database';
import { canAccessRoles } from '../../utils/accessPolicy';

interface ProtectedRouteProps {
  /** Se informado, só permite estes papéis e administradores confirmados pelo banco. */
  roles?: UserRole[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, role, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Verificando sessão..." />;

  if (!isAuthenticated) {
    const wantedRole = roles?.[0] === 'admin' ? 'empresa' : roles?.[0];
    const wanted = wantedRole ? `?type=${wantedRole}` : '';
    return <Navigate to={`/login${wanted}`} replace state={{ from: location.pathname }} />;
  }

  if (!canAccessRoles(role, isAdmin, roles)) {
    return <Navigate to={role === 'empresa' ? '/empresa/painel' : role === 'candidato' ? '/candidato/painel' : '/'} replace />;
  }

  return <Outlet />;
}
