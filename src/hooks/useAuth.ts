import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
export type UserRole = 'candidato' | 'empresa' | null;
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider obrigatório');
  return { ...context, role: context.user?.role || null, isAuthenticated: !!context.user, isCandidato: context.user?.role === 'candidato', isEmpresa: context.user?.role === 'empresa' };
}
