// Hook unificado de autenticação.
// Usa Supabase Auth quando configurado e cai em modo demonstração (localStorage) caso contrário.
export { useAuthContext as useAuth } from '../contexts/AuthContext';
export type { AuthRole as UserRole } from '../contexts/AuthContext';
