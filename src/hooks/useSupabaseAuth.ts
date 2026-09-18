import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types/database';

// Hook moderno que usa Supabase Auth quando configurado, fallback para mock
export function useSupabaseAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Modo mock - usa localStorage antigo
      const stored = localStorage.getItem('@ConectaTeodoro:auth');
      if (stored) {
        const role = JSON.parse(stored);
        setProfile({
          id: 'mock-id',
          role,
          email: 'mock@email.com',
          full_name: role === 'empresa' ? 'Empresa Mock' : 'Candidato Mock',
          avatar_url: null,
          phone: null,
          city: 'Teodoro Sampaio, SP',
          state: 'SP',
          is_verified: true,
          is_active: true,
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Profile);
      }
      setLoading(false);
      setIsMock(true);
      return;
    }

    setIsMock(false);

    // Busca sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data as Profile);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // Listener de mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) setProfile(data as Profile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    profile,
    loading,
    isMock,
    isSupabaseConfigured,
    role: profile?.role || null,
    isAuthenticated: !!profile,
    isCandidato: profile?.role === 'candidato',
    isEmpresa: profile?.role === 'empresa',
    isAdmin: profile?.role === 'admin',
  };
}
