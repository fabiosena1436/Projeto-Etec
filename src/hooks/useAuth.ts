import { useState, useEffect } from 'react';

const STORAGE_KEY = '@ConectaTeodoro:auth';

export type UserRole = 'candidato' | 'empresa' | null;

export function useAuth() {
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as UserRole;
      }
    } catch (e) {
      console.error('Error reading auth from localStorage', e);
    }
    return null;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setRole(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<UserRole>;
      setRole(customEvent.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateUpdated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateUpdated', handleCustomEvent);
    };
  }, []);

  const login = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRole));
    window.dispatchEvent(new CustomEvent('authStateUpdated', { detail: newRole }));
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('authStateUpdated', { detail: null }));
  };

  return {
    role,
    login,
    logout,
    isAuthenticated: role !== null,
    isCandidato: role === 'candidato',
    isEmpresa: role === 'empresa'
  };
}
