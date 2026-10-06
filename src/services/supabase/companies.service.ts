import { presentationService } from './presentation.service';
import { getPresentationCompany, presentationCompanies } from '../../data/presentationDemo';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { companiesMock } from '../../data/companies';
import type { Company, Promotion } from '../../types/database';
import { prepareImage } from '../../utils/prepareImage';
import { translateDbError } from './jobs.service';

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
    const demoVisibility = presentationService.visibility();
    if (!isSupabaseConfigured || !supabase) {
      await new Promise(r => setTimeout(r, 400));
      let filtered = [...mapMockToCompany(),...((await demoVisibility).enabled?presentationCompanies:[])];
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
    const demos = ((await demoVisibility).enabled?presentationCompanies:[]).filter(c=>(!params?.isSponsor||c.is_sponsor) && (!params?.industry||c.industry===params.industry) && (!params?.search||c.name.toLocaleLowerCase('pt-BR').includes(params.search.toLocaleLowerCase('pt-BR'))));
    return [...(data as Company[]).map(c=>({...c,is_sponsor:c.is_sponsor&&(!c.sponsor_expires_at||new Date(c.sponsor_expires_at)>new Date())})),...demos].slice(0,params?.limit||100);
  },

  async getSponsors(): Promise<Company[]> {
    return this.getAll({ isSponsor: true, limit: 20 });
  },

  async getById(id: string): Promise<Company | null> {
    const demo = getPresentationCompany(id); if(demo) return (await presentationService.visibility()).enabled?demo:null;
    if (!isSupabaseConfigured || !supabase) {
      await new Promise(r => setTimeout(r, 200));
      return mapMockToCompany().find(c => c.id === id || c.slug === id) || null;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = (supabase as any).from('companies').select('*, promotions(*)');
    query = isUuid ? query.eq('id', id) : query.eq('slug', id);
    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      if (error) console.error('Erro buscar empresa:', error.message);
      return null;
    }

    (supabase as any).rpc('increment_company_view', { company_uuid: (data as any).id }).then(() => {}, () => {});

    const company=data as Company;
    return {...company,is_sponsor:company.is_sponsor&&(!company.sponsor_expires_at||new Date(company.sponsor_expires_at)>new Date())};
  },

  /** Empresa do usuário logado. Cria automaticamente se o perfil for empresa e ainda não tiver. */
  async getMyCompany(): Promise<(Company & { promotions?: Promotion[] }) | null> {
    if (!isSupabaseConfigured || !supabase) {
      const c = mapMockToCompany().find(c => c.id === 'comp-3') || null;
      if (c) (c as any).promotions = companiesMock.find(m => m.id === 'comp-3')?.promotions || [];
      return c;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await (supabase as any)
      .from('companies')
      .select('*, promotions(*)')
      .eq('owner_profile_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Erro buscar minha empresa:', error.message);
      return null;
    }
    if (data) return {...data,is_sponsor:data.is_sponsor&&(!data.sponsor_expires_at||new Date(data.sponsor_expires_at)>new Date())} as any;

    // Sem empresa ainda: usa RPC (migration 005) para criar de forma segura
    const { data: created, error: rpcError } = await (supabase as any).rpc('ensure_my_company');
    if (rpcError) {
      console.warn('ensure_my_company indisponível:', rpcError.message);
      return null;
    }
    return created ? ({ ...(created as any), promotions: [] } as any) : null;
  },

  async uploadLogo(companyId: string, file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase não configurado');
    if (file.type === 'image/svg+xml') {
      if (file.size > 2 * 1024 * 1024) throw new Error('A logo em SVG deve ter no máximo 2 MB.');
    } else { file = await prepareImage(file, 512); }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const path = `${companyId}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('company-logos').upload(path, file, { upsert: true, cacheControl: '3600' });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('company-logos').getPublicUrl(path);
    await this.update(companyId, { logo_url: data.publicUrl });
    return data.publicUrl;
  },

  // ---------------- Promoções (patrocinadores) ----------------
  async createPromotion(promo: { company_id: string; title: string; description: string; price?: number | null; discount_price?: number | null; valid_until?: string | null; image_url?: string | null }): Promise<Promotion> {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await (supabase as any).from('promotions').insert(promo).select().single();
    if (error) throw new Error(translateDbError(error));
    return data as Promotion;
  },

  async updatePromotion(id: string, updates: Partial<Promotion>): Promise<Promotion> {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await (supabase as any).from('promotions').update(updates).eq('id', id).select().single();
    if (error) throw new Error(translateDbError(error));
    return data as Promotion;
  },

  async deletePromotion(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await (supabase as any).from('promotions').delete().eq('id', id);
    if (error) throw new Error(translateDbError(error));
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
    if (error) throw new Error(translateDbError(error));
    return data as Company;
  },
};
