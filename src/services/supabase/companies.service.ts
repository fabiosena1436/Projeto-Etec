import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { companiesMock } from '../../data/companies';
import type { Company } from '../../types/database';

function mapMockToCompany(): Company[] {
  return companiesMock.map(c => ({
    id: c.id,
    owner_profile_id: 'mock-owner',
    name: c.name,
    slug: c.id,
    industry: c.industry,
    description: c.description,
    location: c.location,
    city: 'Teodoro Sampaio',
    state: 'SP',
    contact_email: c.contactEmail,
    phone: null,
    website: c.website || null,
    logo_url: c.logoUrl,
    banner_url: null,
    slogan: c.slogan || null,
    cnpj: null,
    is_sponsor: c.isSponsor || false,
    is_verified: true,
    sponsor_expires_at: null,
    views_count: Math.floor(Math.random() * 500),
    rating: 4.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export const companiesService = {
  async getAll(params?: { isSponsor?: boolean; industry?: string; search?: string; limit?: number }): Promise<Company[]> {
    if (!isSupabaseConfigured || !supabase) {
      await new Promise(r => setTimeout(r, 400));
      let filtered = mapMockToCompany();
      if (params?.isSponsor) filtered = filtered.filter(c => c.is_sponsor);
      if (params?.industry) filtered = filtered.filter(c => c.industry === params.industry);
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(c => c.name.toLowerCase().includes(s));
      }
      return filtered.slice(0, params?.limit || 20);
    }

    let query = (supabase as any).from('companies').select('*').order('is_sponsor', { ascending: false }).order('views_count', { ascending: false });

    if (params?.isSponsor) query = query.eq('is_sponsor', true);
    if (params?.industry) query = query.eq('industry', params.industry);
    if (params?.search) query = query.ilike('name', `%${params.search}%`);
    if (params?.limit) query = query.limit(params.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data as Company[];
  },

  async getSponsors(): Promise<Company[]> {
    return this.getAll({ isSponsor: true, limit: 20 });
  },

  async getById(id: string): Promise<Company | null> {
    if (!isSupabaseConfigured || !supabase) {
      await new Promise(r => setTimeout(r, 200));
      return mapMockToCompany().find(c => c.id === id || c.slug === id) || null;
    }

    const { data, error } = await (supabase as any)
      .from('companies')
      .select('*, promotions(*)')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();

    if (error) {
      console.error('Erro buscar empresa:', error);
      return null;
    }

    (supabase as any).rpc('increment_company_view', { company_uuid: (data as any).id }).then(() => {}, () => {});

    return data as unknown as Company;
  },

  async getByOwner(ownerId: string): Promise<Company[]> {
    if (!supabase) return [];
    const { data, error } = await (supabase as any)
      .from('companies')
      .select('*')
      .eq('owner_profile_id', ownerId);
    if (error) throw error;
    return data as Company[];
  },

  async create(company: any): Promise<Company> {
    if (!supabase) throw new Error('Supabase não configurado');
    const slug = `${company.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
    const { data, error } = await (supabase as any)
      .from('companies')
      .insert({ ...company, slug })
      .select()
      .single();
    if (error) throw error;
    return data as Company;
  },

  async update(id: string, updates: Partial<Company>): Promise<Company> {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await (supabase as any)
      .from('companies')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Company;
  },
};
