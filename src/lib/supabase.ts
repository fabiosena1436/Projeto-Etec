import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Validação de envs com fallback para desenvolvimento
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Se não houver envs, usamos modo mock (útil para dev sem banco ainda)
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase não configurado. Usando dados mockados. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env para usar o banco real.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // mais seguro que implicit
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-client-info': 'conecta-teodoro-web',
        },
      },
    })
  : (null as unknown as ReturnType<typeof createClient<Database>>);

// Helper para verificar sessão
export async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
  return data.user;
}

export async function getCurrentProfile() {
  if (!isSupabaseConfigured || !supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
  return data;
}

// Helper para upload com tratamento de erro
export async function uploadFile(
  bucket: 'avatars' | 'company-logos' | 'resumes' | 'promotions',
  path: string,
  file: File
) {
  if (!supabase) throw new Error('Supabase não configurado');

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;
  return data;
}

export function getPublicUrl(
  bucket: 'avatars' | 'company-logos' | 'promotions',
  path: string
) {
  if (!supabase) return '';
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
