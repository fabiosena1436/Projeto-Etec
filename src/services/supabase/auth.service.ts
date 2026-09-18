import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { UserRole, Profile } from '../../types/database';

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  city?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase não configurado, usando mock auth');
      localStorage.setItem('@ConectaTeodoro:auth', JSON.stringify(data.role));
      window.dispatchEvent(new CustomEvent('authStateUpdated', { detail: data.role }));
      return { user: { id: 'mock-id', email: data.email }, profile: null as any };
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role: data.role,
          city: data.city || 'Teodoro Sampaio, SP',
        },
      },
    });

    if (error) throw error;

    if (authData.user && data.phone) {
      await (supabase as any)
        .from('profiles')
        .update({ phone: data.phone })
        .eq('id', authData.user.id);
    }

    return authData;
  },

  async signIn(data: SignInData) {
    if (!isSupabaseConfigured || !supabase) {
      const role: UserRole = data.email.includes('empresa') || data.email.includes('rh@') ? 'empresa' : 'candidato';
      localStorage.setItem('@ConectaTeodoro:auth', JSON.stringify(role));
      window.dispatchEvent(new CustomEvent('authStateUpdated', { detail: role }));
      return { user: { id: 'mock-id', email: data.email }, profile: { role } as unknown as Profile };
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    await (supabase as any)
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    if (profile) {
      localStorage.setItem('@ConectaTeodoro:auth', JSON.stringify((profile as any).role));
      window.dispatchEvent(new CustomEvent('authStateUpdated', { detail: (profile as any).role }));
    }

    return { user: authData.user, profile: profile as Profile };
  },

  async signOut() {
    if (!isSupabaseConfigured || !supabase) {
      localStorage.removeItem('@ConectaTeodoro:auth');
      window.dispatchEvent(new CustomEvent('authStateUpdated', { detail: null }));
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('@ConectaTeodoro:auth');
    window.dispatchEvent(new CustomEvent('authStateUpdated', { detail: null }));
  },

  async getSession() {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem('@ConectaTeodoro:auth');
      return stored ? JSON.parse(stored) : null;
    }
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getProfile(): Promise<Profile | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) return null;
    return data as Profile;
  },

  async signInWithGoogle() {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/candidato/painel` },
    });
    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange(callback);
  },
};
