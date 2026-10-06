import { isDemoMode, isSupabaseConfigured, supabase } from '../../lib/supabase';
import { apiService } from '../api';
import type { Promotion } from '../../types/database';

export type SponsorSurface = 'home' | 'community';
export interface SponsorOffer {
  token: string | null; company_id: string; company_name: string; logo_url: string | null;
  industry: string; title: string; description: string; image_url: string | null;
  promotion_id: string | null; price: number | null; discount_price: number | null; valid_until: string | null;
}
export interface SponsorReport {
  days: number; impressions: number; clicks: number; visits: number; whatsapp: number;
  surfaces: Array<{surface: SponsorSurface; impressions: number; clicks: number; visits: number; whatsapp: number}>;
}
let memorySession: string | undefined;
export function sponsorSession() {
  if (memorySession) return memorySession;
  try {
    const previous = sessionStorage.getItem('conecta-sponsor-session');
    memorySession = isDeliveryToken(previous) ? previous : crypto.randomUUID();
    sessionStorage.setItem('conecta-sponsor-session', memorySession);
  } catch { memorySession = crypto.randomUUID(); }
  return memorySession;
}
export const isDeliveryToken = (value: string | null): value is string => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));

export const sponsorsService = {
  async placements(surface: SponsorSurface): Promise<SponsorOffer[]> {
    if (isSupabaseConfigured) {
      const {data,error} = await (supabase as any).rpc('sponsor_placements',{placement:surface,visitor_session:sponsorSession()});
      if (!error) return data || [];
      // Older deployments still show real offers, without inventing measured results.
      if (!['PGRST202','42883'].includes(error.code)) throw new Error('Não foi possível carregar as ofertas dos parceiros.');
    } else if (!isDemoMode) return [];
    const companies = (await apiService.getCompanies()).filter(c=>c.isSponsor);
    const today = new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
    // Stable within a tab; compatibility mode is not the server's balanced rotation.
    const seed = [...sponsorSession()].reduce((sum,c)=>sum+c.charCodeAt(0),0);
    const ordered = companies.slice().sort((a,b)=>a.id.localeCompare(b.id));
    const offset = ordered.length ? seed % ordered.length : 0;
    const selected = [...ordered.slice(offset),...ordered.slice(0,offset)].slice(0,surface==='home'?3:1);
    if (isSupabaseConfigured && selected.length) {
      const {data,error} = await supabase.from('promotions').select('*').in('company_id',selected.map(c=>c.id)).eq('is_active',true).order('created_at',{ascending:false}).limit(18);
      if (error) throw new Error('Não foi possível carregar as ofertas dos parceiros.');
      const promotions = (data || []) as Promotion[];
      for (const company of selected) company.promotions = promotions.filter(p=>p.company_id===company.id && (!p.valid_until||p.valid_until>=today)).map(p=>({id:p.id,title:p.title,description:p.description,imageUrl:p.image_url||undefined,price:p.price??undefined,discountPrice:p.discount_price??undefined,validUntil:p.valid_until||undefined}));
    }
    return selected.map(c=>{
      const p=c.promotions?.find(p=>!p.validUntil||p.validUntil>=today);
      return {token:null,company_id:c.id,company_name:c.name,logo_url:c.logoUrl||null,industry:c.industry,
        title:p?.title||c.slogan||c.name,description:p?.description||c.description,image_url:p?.imageUrl||null,
        promotion_id:p?.id||null,price:p?.price??null,discount_price:p?.discountPrice??null,valid_until:p?.validUntil||null};
    });
  },
  async track(token: string | null, event: 'impression'|'click'|'visit'|'whatsapp', companyId: string) {
    if (!isSupabaseConfigured || !isDeliveryToken(token)) return;
    // Analytics must never block opening an offer or talking to the company.
    try { await (supabase as any).rpc('track_sponsor_event',{delivery_token:token,event_name:event,company_uuid:companyId}); } catch { /* best effort */ }
  },
  async report(companyId: string): Promise<SponsorReport> {
    if (!isSupabaseConfigured) throw new Error('O relatório de divulgação fica disponível com o banco conectado.');
    const {data,error}=await (supabase as any).rpc('sponsor_report',{company_uuid:companyId});
    if (error) throw new Error(['PGRST202','42883'].includes(error.code)
      ? 'O relatório precisa da atualização de divulgação no Supabase.' : 'Não foi possível carregar o relatório de divulgação.');
    return data;
  },
};
