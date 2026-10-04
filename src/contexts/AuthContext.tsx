import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { request } from '../services/api';
import type { Account } from '../services/api';
interface AuthState { user: Account | null; loading: boolean; error: string; refresh: () => Promise<void>; logout: () => Promise<void> }
export const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true);
    try { const session = await request<{ user: Account | null }>('auth/session'); setUser(session.user); setError(''); }
    catch (e) { setUser(null); setError((e as Error).message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const logout = async () => { await request('auth/logout', 'POST'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, error, refresh, logout }}>{children}</AuthContext.Provider>;
}
