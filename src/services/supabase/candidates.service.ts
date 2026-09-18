import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { usersMock } from '../../data/users';
import type { Candidate, Profile } from '../../types/database';

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

    await (supabase as any)
      .from('candidates')
      .update({ profile_views: (data as any).profile_views + 1 })
      .eq('profile_id', id);

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

  async updateMyProfile(updates: any): Promise<Candidate> {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { full_name, phone, avatar_url, ...candidateUpdates } = updates;

    if (full_name || phone || avatar_url) {
      const profileUpdates: any = {};
      if (full_name) profileUpdates.full_name = full_name;
      if (phone) profileUpdates.phone = phone;
      if (avatar_url) profileUpdates.avatar_url = avatar_url;
      await (supabase as any).from('profiles').update(profileUpdates).eq('id', user.id);
    }

    if (Object.keys(candidateUpdates).length > 0) {
      const { data, error } = await (supabase as any)
        .from('candidates')
        .update(candidateUpdates)
        .eq('profile_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data as Candidate;
    }

    const { data } = await (supabase as any).from('candidates').select('*').eq('profile_id', user.id).single();
    return data as Candidate;
  },
};
