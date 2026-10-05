import { supabase } from '../../lib/supabase';
import type { Company, Profile } from '../../types/database';
export interface Sponsorship {
  company_id: string; status: 'pendente' | 'ativo' | 'pausado' | 'cancelado';
  payment_status: 'pendente' | 'recebido' | 'atrasado'; monthly_amount: number;
  starts_at: string; expires_at: string | null; internal_notes: string;
}
export interface AdminSnapshot {
  totals: { users: number; companies: number; sponsors: number; monthly_revenue: number };
  companies: Company[]; users: Profile[]; sponsorships: Sponsorship[];
  audit: { action: string; entity_type: string; entity_id: string; created_at: string }[];
}
export const adminService = {
  async getDashboard(): Promise<AdminSnapshot> {
    if (!supabase) throw new Error('Banco indisponível.');
    const { data, error } = await (supabase as any).rpc('admin_dashboard');
    if (error) throw new Error(error.message);
    return data;
  },
  async saveSponsorship(value: Sponsorship) {
    const { error } = await (supabase as any).rpc('admin_save_sponsorship', {
      company_uuid:value.company_id, sponsorship_status:value.status, payment_state:value.payment_status,
      amount:value.monthly_amount, start_date:value.starts_at, end_date:value.expires_at, notes:value.internal_notes,
    });
    if (error) throw new Error(error.message);
  },
  async verify(kind: 'company' | 'user', id: string, verified: boolean) {
    const { error } = await (supabase as any).rpc('admin_verify_entity', {entity_kind:kind,entity_uuid:id,verified});
    if (error) throw new Error(error.message);
  },
};
