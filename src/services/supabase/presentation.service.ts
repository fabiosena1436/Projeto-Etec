import { supabase } from '../../lib/supabase';
import { PRESENTATION_DEMOS_ENABLED } from '../../data/presentationDemo';

type Visibility = { enabled: boolean; available: boolean };
let cached: { value: Visibility; expires: number } | undefined;
let pending: Promise<Visibility> | undefined;
let generation = 0;

export const presentationService = {
  async visibility(): Promise<Visibility> {
    if (cached && cached.expires > Date.now()) return cached.value;
    if (pending) return pending;
    const requestGeneration = generation;
    const request = (async () => {
      let value: Visibility = {enabled:PRESENTATION_DEMOS_ENABLED,available:false};
      if (supabase) {
        try {
          const {data,error} = await (supabase as any).rpc('presentation_demo_visibility');
          value = !error ? {enabled:PRESENTATION_DEMOS_ENABLED && data===true,available:true}
            : {enabled:PRESENTATION_DEMOS_ENABLED && ['PGRST202','42883'].includes(error.code),available:false};
        } catch { value = {enabled:false,available:false}; }
      }
      if (requestGeneration===generation) cached = {value,expires:Date.now()+30000};
      return value;
    })();
    pending = request;
    try { return await request; }
    finally { if (pending===request) pending=undefined; }
  },
  async setVisible(enabled: boolean) {
    if (!supabase) throw new Error('O controle global precisa do banco conectado.');
    const {error} = await (supabase as any).rpc('admin_set_presentation_demos',{show_examples:enabled});
    if (error) throw new Error(['PGRST202','42883'].includes(error.code)
      ? 'Aplique a migração 015 no Supabase para controlar os exemplos pelo painel.' : error.message);
    generation++;
    pending=undefined;
    cached={value:{enabled:PRESENTATION_DEMOS_ENABLED&&enabled,available:true},expires:Date.now()+30000};
  },
};
