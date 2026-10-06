import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { presentationService } from '../../services/supabase/presentation.service';
import { PRESENTATION_DEMOS_ENABLED } from '../../data/presentationDemo';

export function PresentationControls() {
  const [state,setState]=useState<{enabled:boolean;available:boolean}|null>(null);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;
    presentationService.visibility().then(value=>{if(active)setState(value);});
    return()=>{active=false;};
  },[]);
  async function toggle() {
    if (!state) return;
    setSaving(true);setError('');
    try {
      await presentationService.setVisible(!state.enabled);
      setState(await presentationService.visibility());
      toast.success(state.enabled?'Exemplos removidos da exibição do site.':'Exemplos ativados para apresentação.');
    } catch(e) {setError(e instanceof Error?e.message:'Não foi possível atualizar.');}
    finally {setSaving(false);}
  }
  return <section>
    <h2>Exemplos para apresentação</h2>
    <p>Cinco empresas fictícias, dez publicações e seis ofertas. Você pode ocultar todos os exemplos do site e reativá-los quando precisar apresentar o projeto. Atualize as páginas abertas para ver a mudança.</p>
    {state?<p>Status: <strong>{state.enabled?'Exemplos visíveis':'Exemplos ocultos'}</strong></p>:<p role="status">Consultando configuração...</p>}
    {state&&!state.available&&<p>Para usar este controle, aplique a migração 015 no Supabase.</p>}
    {!PRESENTATION_DEMOS_ENABLED&&<p>Esta versão foi publicada com os exemplos desativados. A reativação exige uma nova publicação com VITE_PRESENTATION_DEMOS=true.</p>}
    {error&&<p role="alert">{error}</p>}
    <button type="button" disabled={!state?.available || saving || !PRESENTATION_DEMOS_ENABLED} onClick={()=>void toggle()}>{saving?'Salvando...':state?.enabled?'Remover exemplos do site':'Mostrar exemplos no site'}</button>
  </section>;
}
