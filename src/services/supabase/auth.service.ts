import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { UserRole, Profile } from '../../types/database';

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  city?: string;
  phone?: string;
  /** Campos da empresa (quando role === 'empresa') */
  company?: {
    name: string;
    cnpj?: string;
    industry?: string;
    location?: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

const MOCK_KEY = '@ConectaTeodoro:auth';

function setMockRole(role: UserRole | null) {
  if (role) localStorage.setItem(MOCK_KEY, JSON.stringify(role));
  else localStorage.removeItem(MOCK_KEY);
  window.dispatchEvent(new CustomEvent('authStateUpdated', { detail: role }));
}

/** Normaliza telefone para somente dígitos (aceito pela constraint do banco) */
export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits : null;
}

export function normalizeCnpj(cnpj?: string | null): string | null {
  if (!cnpj) return null;
  const digits = cnpj.replace(/\D/g, '');
  return digits.length === 14 ? digits : null;
}

/** Traduz mensagens de erro do Supabase Auth para PT-BR amigável */
export function translateAuthError(message?: string): string {
  if (!message) return 'Ocorreu um erro inesperado. Tente novamente.';
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada (e o spam).';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este e-mail já está cadastrado. Faça login.';
  if (m.includes('password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (m.includes('rate limit') || m.includes('too many requests')) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (m.includes('invalid email')) return 'E-mail inválido.';
  if (m.includes('network') || m.includes('fetch')) return 'Falha de conexão. Verifique sua internet.';
  return message;
}

export const authService = {
  async signUp(data: SignUpData) {
    if (!isSupabaseConfigured || !supabase) {
      setMockRole(data.role);
      return { user: { id: 'mock-id', email: data.email }, session: null, needsEmailConfirmation: false };
    }

    const phone = normalizePhone(data.phone);

    // Todos os dados vão no metadata: o trigger `handle_new_user` no banco
    // cria profile + candidate/company de forma atômica, mesmo se o usuário
    // ainda precisar confirmar o e-mail (quando não há sessão para inserir via RLS).
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?type=${data.role}&confirmed=1`,
        data: {
          full_name: data.full_name,
          role: data.role,
          city: data.city || 'Teodoro Sampaio, SP',
          phone,
          company_name: data.company?.name || null,
          company_cnpj: normalizeCnpj(data.company?.cnpj),
          company_industry: data.company?.industry || null,
          company_location: data.company?.location || null,
        },
      },
    });

    if (error) throw new Error(translateAuthError(error.message));

    // Supabase retorna user com identities vazio quando o e-mail já existe
    if (authData.user && Array.isArray((authData.user as any).identities) && (authData.user as any).identities.length === 0) {
      throw new Error('Este e-mail já está cadastrado. Faça login.');
    }

    return {
      user: authData.user,
      session: authData.session,
      needsEmailConfirmation: !authData.session,
    };
  },

  async signIn(data: SignInData) {
    if (!isSupabaseConfigured || !supabase) {
      const role: UserRole = data.email.includes('empresa') || data.email.includes('rh@') ? 'empresa' : 'candidato';
      setMockRole(role);
      return { user: { id: 'mock-id', email: data.email }, profile: { role } as unknown as Profile };
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(translateAuthError(error.message));

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // fire-and-forget
    void (supabase as any)
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    return { user: authData.user, profile: (profile as Profile | null) ?? null };
  },

  async signOut() {
    setMockRole(null);
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(translateAuthError(error.message));
  },

  async resendConfirmation(email: string) {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw new Error(translateAuthError(error.message));
  },

  async resetPassword(email: string) {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) throw new Error(translateAuthError(error.message));
  },

  async updatePassword(newPassword: string) {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(translateAuthError(error.message));
  },

  async signInWithGoogle(role: UserRole = 'candidato') {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/${role}/painel`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw new Error(translateAuthError(error.message));
    return data;
  },
};
