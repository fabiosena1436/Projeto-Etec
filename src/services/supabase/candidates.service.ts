import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { usersMock } from '../../data/users';
import type { Candidate, Profile } from '../../types/database';
import { translateDbError } from './jobs.service';

function mapMockToCandidate(): (Candidate & { profile: Profile })[] {
  return usersMock.map(u => ({
    profile_id: u.id,
    about: u.about,
    profession: u.profession,
    age: u.age,
    education: u.education,
    resume_url: u.resumeUrl || null,
    linkedin_url: null,
    portfolio_url: null,
    city: u.city,
    experience_years: u.experience.length,
    availability: 'Imediata',
    profile_views: 12,
    completion_percent: 85,
    is_open_to_work: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile: {
      id: u.id,
      role: 'candidato',
      email: u.email || `${u.name.toLowerCase().replace(' ', '.')}@email.com`,
      full_name: u.name,
      avatar_url: u.avatarUrl,
      phone: u.phone,
      city: u.city,
      state: 'SP',
      is_verified: true,
      is_active: true,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    skills: u.skills.map((s, i) => ({
      id: `skill-${i}`,
      candidate_id: u.id,
      skill_id: `skill-id-${i}`,
      level: 4,
      created_at: new Date().toISOString(),
      skill: {
        id: `skill-id-${i}`,
        name: s,
        slug: s.toLowerCase().replace(' ', '-'),
        category: 'Geral',
        created_at: new Date().toISOString(),
      },
    })),
    experiences: u.experience.map((exp, i) => ({
      id: `exp-${i}`,
      candidate_id: u.id,
      company_name: exp.company,
      role: exp.role,
      description: null,
      start_date: '2023-01-01',
      end_date: null,
      is_current: true,
      created_at: new Date().toISOString(),
    })),
  }));
}

export const candidatesService = {
  async getAll(params?: { city?: string; profession?: string; search?: string; limit?: number }): Promise<(Candidate & { profile: Profile })[]> {
    if (!isSupabaseConfigured || !supabase) {
      await new Promise(r => setTimeout(r, 300));
      return mapMockToCandidate().slice(0, params?.limit || 20);
    }

    let query = (supabase as any)
      .from('candidates')
      .select('*, profile:profiles(*), skills:candidate_skills(*, skill:skills(*)), experiences:candidate_experiences(*)')
      .eq('is_open_to_work', true)
      .order('profile_views', { ascending: false });

    if (params?.city) query = query.ilike('city', `%${params.city}%`);
    if (params?.profession) query = query.ilike('profession', `%${params.profession}%`);
    if (params?.limit) query = query.limit(params.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data as any;
  },

  async getById(id: string): Promise<(Candidate & { profile: Profile }) | null> {
    if (!isSupabaseConfigured || !supabase) {
      await new Promise(r => setTimeout(r, 200));
      return mapMockToCandidate().find(c => c.profile_id === id) || null;
    }

    const { data, error } = await (supabase as any)
      .from('candidates')
      .select('*, profile:profiles(*), skills:candidate_skills(*, skill:skills(*)), experiences:candidate_experiences(*)')
      .eq('profile_id', id)
      .single();

    if (error) return null;

    (supabase as any).rpc('increment_candidate_view', { candidate_uuid: id }).then(() => {}, () => {});

    return data as any;
  },

  async getMyProfile(): Promise<(Candidate & { profile: Profile }) | null> {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await (supabase as any)
      .from('candidates')
      .select('*, profile:profiles(*), skills:candidate_skills(*, skill:skills(*)), experiences:candidate_experiences(*)')
      .eq('profile_id', user.id)
      .single();
    if (error) return null;
    return data as any;
  },

  /** Substitui todas as habilidades do candidato logado (cria skills novas se necessário) */
  async setMySkills(skillNames: string[]): Promise<void> {
    if (!supabase) return;
    const { error } = await (supabase as any).rpc('set_my_skills', { skill_names: skillNames });
    if (error) throw new Error(error.message);
  },

  async addExperience(exp: { company_name: string; role: string; start_date: string; end_date?: string | null; is_current?: boolean; description?: string | null }): Promise<void> {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { error } = await (supabase as any).from('candidate_experiences').insert({ ...exp, candidate_id: user.id });
    if (error) throw new Error(error.message);
  },

  async removeExperience(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await (supabase as any).from('candidate_experiences').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /** Upload de currículo (bucket privado `resumes/<uid>/...`) */
  async uploadResume(file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase não configurado');
    if (file.size > 5 * 1024 * 1024) throw new Error('O currículo deve ter no máximo 5MB.');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const path = `${user.id}/curriculo.${ext}`;
    const { error } = await supabase.storage.from('resumes').upload(path, file, { upsert: true, cacheControl: '3600' });
    if (error) throw new Error(error.message);
    await (supabase as any).from('candidates').update({ resume_url: path }).eq('profile_id', user.id);
    return path;
  },

  /** URL temporária (1h) para baixar currículo — respeita RLS do bucket privado */
  async getResumeSignedUrl(path: string): Promise<string | null> {
    if (!supabase || !path) return null;
    if (/^https?:\/\//.test(path)) return path; // legado/mock
    const { data, error } = await supabase.storage.from('resumes').createSignedUrl(path, 3600);
    if (error) return null;
    return data.signedUrl;
  },

  async uploadAvatar(file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase não configurado');
    if (file.size > 2 * 1024 * 1024) throw new Error('A foto deve ter no máximo 2MB.');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${data.publicUrl}?v=${Date.now()}`;
    await (supabase as any).from('profiles').update({ avatar_url: url }).eq('id', user.id);
    return url;
  },

  async updateMyProfile(updates: any): Promise<Candidate> {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { full_name, phone, avatar_url, ...candidateUpdates } = updates;

    if (full_name !== undefined || phone !== undefined || avatar_url !== undefined) {
      const profileUpdates: any = {};
      if (full_name !== undefined) profileUpdates.full_name = full_name;
      if (phone !== undefined) profileUpdates.phone = phone ? String(phone).replace(/\D/g, '') || null : null;
      if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url;
      if (candidateUpdates.city) profileUpdates.city = candidateUpdates.city;
      const { error: pErr } = await (supabase as any).from('profiles').update(profileUpdates).eq('id', user.id);
      if (pErr) throw new Error(translateDbError(pErr));
    }

    if (Object.keys(candidateUpdates).length > 0) {
      if (candidateUpdates.age === '' || candidateUpdates.age === undefined) delete candidateUpdates.age;
      else candidateUpdates.age = Number(candidateUpdates.age);
      const { data, error } = await (supabase as any)
        .from('candidates')
        .upsert({ ...candidateUpdates, profile_id: user.id }, { onConflict: 'profile_id' })
        .select()
        .single();
      if (error) throw new Error(translateDbError(error));
      return data as Candidate;
    }

    const { data } = await (supabase as any).from('candidates').select('*').eq('profile_id', user.id).single();
    return data as Candidate;
  },
};
