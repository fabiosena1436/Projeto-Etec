import type { UserRole } from '../types/database';

export function canAccessRoles(role: UserRole | null, isAdmin: boolean, roles?: UserRole[]): boolean {
  if (!roles) return true;
  return isAdmin || (role !== null && role !== 'admin' && roles.includes(role));
}
