import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, UserRole } from '../types/database';

const MOCK_STORAGE_KEY = '@ConectaTeodoro:auth';

export type AuthRole = UserRole | null;

interface AuthContextValue {
  /** Sessão real do Supabase (null em modo mock) */
  session: Session | null;
  user: User | null;
  /** Linha da tabela `profiles` do usuário logado */
  profile: Profile | null;
  role: AuthRole;
  /** true enquanto a sessão inicial ainda está sendo resolvida */
  loading: boolean;
  isAuthenticated: boolean;
  isCandidato: boolean;
  isEmpresa: boolean;
  isAdmin: boolean;
  /** true quando o app roda sem Supabase (demonstração) */
  isMock: boolean;
  /** Login de demonstração (somente modo mock) */
  login: (role: AuthRole) => void;
  logout: () => Promise<void>;
  /** Recarrega o profile do banco (após editar nome, avatar, etc) */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function buildMockProfile(role: UserRole): Profile {
  const now = new Date().toISOString();
  return {
    id: role === 'empresa' ? 'mock-company-owner' : 'user-1',
    role,
    email: role === 'empresa' ? 'rh@empresa-demo.com.br' : 'carlos@email.com',
    full_name: role === 'empresa' ? 'Indústria Agrícola Anastaciana' : 'Carlos Henrique',
    avatar_url: null,
    phone: '18999999999',
    city: 'Teodoro Sampaio, SP',
    state: 'SP',
    is_verified: true,
    is_active: true,
    last_seen_at: now,
    created_at: now,
    updated_at: now,
  };
}

function readMockRole(): AuthRole {
  try {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuthRole) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isMock = !isSupabaseConfigured || !supabase;

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    if (!isMock) return null;
    const role = readMockRole();
    return role ? buildMockProfile(role) : null;
  });
  const [loading, setLoading] = useState(!isMock);
  const fetchingFor = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error('Erro ao carregar profile:', error.message);
      return null;
    }
    return data as Profile;
  }, []);

  // ---------- Modo Supabase ----------
  useEffect(() => {
    if (isMock || !supabase) return;

    let cancelled = false;

    const resolveSession = async (nextSession: Session | null) => {
      setSession(nextSession);
      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      // evita corrida entre getSession e onAuthStateChange
      fetchingFor.current = nextSession.user.id;
      const p = await fetchProfile(nextSession.user.id);
      if (cancelled || fetchingFor.current !== nextSession.user.id) return;
      setProfile(p);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => resolveSession(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      resolveSession(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isMock, fetchProfile]);

  // ---------- Modo Mock (sincroniza entre abas/eventos) ----------
  useEffect(() => {
    if (!isMock) return;
    const sync = () => {
      const role = readMockRole();
      setProfile(role ? buildMockProfile(role) : null);
    };
    window.addEventListener('storage', sync);
    window.addEventListener('authStateUpdated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('authStateUpdated', sync);
    };
  }, [isMock]);

  const login = useCallback((role: AuthRole) => {
    if (!isMock) return;
    if (role) localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(role));
    else localStorage.removeItem(MOCK_STORAGE_KEY);
    setProfile(role ? buildMockProfile(role) : null);
    window.dispatchEvent(new CustomEvent('authStateUpdated', { detail: role }));
  }, [isMock]);

  const logout = useCallback(async () => {
    localStorage.removeItem(MOCK_STORAGE_KEY);
    localStorage.removeItem('@ConectaTeodoro:appliedJobs');
    if (!isMock && supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setProfile(null);
    window.dispatchEvent(new CustomEvent('authStateUpdated', { detail: null }));
  }, [isMock]);

  const refreshProfile = useCallback(async () => {
    if (isMock || !session?.user) return;
    const p = await fetchProfile(session.user.id);
    if (p) setProfile(p);
  }, [isMock, session, fetchProfile]);

  const value = useMemo<AuthContextValue>(() => {
    const role = profile?.role ?? null;
    return {
      session,
      user: session?.user ?? null,
      profile,
      role,
      loading,
      isAuthenticated: !!profile,
      isCandidato: role === 'candidato',
      isEmpresa: role === 'empresa',
      isAdmin: role === 'admin',
      isMock,
      login,
      logout,
      refreshProfile,
    };
  }, [session, profile, loading, isMock, login, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
