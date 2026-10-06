import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { sponsorsService, type SponsorReport as Report } from '../../services/supabase/sponsors.service';

const Container=styled.section`
  background:white; border:1px solid #dde6ee; border-radius:16px; padding:24px; min-width:0;
  h2 { font-size:20px; color:#102a43; margin:0 0 8px; }
  p,small { color:#52687a; line-height:1.6; }
  .numbers { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr)); gap:14px; margin:20px 0; }
  .numbers div { padding:16px; border-radius:10px; background:#f3f6f9; }
  strong { display:block; color:#102a43; font-size:24px; }
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:14px; text-align:left; }
  th,td { padding:10px; border-bottom:1px solid #e1e8ee; }
  button { padding:10px 14px; min-height:44px; border:1px solid #cedbe7; border-radius:9px; background:white; cursor:pointer; }
`;
export function SponsorReport({companyId}:{companyId:string}) {
  const [report,setReport]=useState<Report|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0),[loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;setLoading(true);setError('');sponsorsService.report(companyId).then(data=>{if(active)setReport(data);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[companyId,attempt]);
  return <Container aria-label="Relatório de divulgação"><h2>Divulgação da sua empresa</h2><p>Resultados dos últimos 30 dias nos espaços de parceiros.</p>
    <button type="button" disabled={loading} onClick={()=>setAttempt(value=>value+1)}>Atualizar relatório</button>
    {loading?<p role="status">Carregando divulgação...</p>:error?<p role="alert">{error}</p>:report&&<>
      <div className="numbers">{[[report.impressions,'Exibições'],[report.clicks,'Cliques nos destaques'],[report.visits,'Acessos à vitrine'],[report.whatsapp,'Cliques no WhatsApp']].map(([value,label])=><div key={label}><strong>{Number(value).toLocaleString('pt-BR')}</strong><span>{label}</span></div>)}</div>
      <p>Taxa de cliques: {report.impressions?`${(report.clicks/report.impressions*100).toLocaleString('pt-BR',{maximumFractionDigits:1})}%`:'Ainda sem exibições para calcular.'}</p>
      {!!report.surfaces.length&&<div className="table-wrap"><table><caption>Resultado por espaço</caption><thead><tr><th>Espaço</th><th>Exibições</th><th>Cliques</th><th>Vitrine</th><th>WhatsApp</th></tr></thead><tbody>{report.surfaces.map(row=><tr key={row.surface}><th scope="row">{row.surface==='home'?'Página inicial':'Comunidade'}</th><td>{row.impressions}</td><td>{row.clicks}</td><td>{row.visits}</td><td>{row.whatsapp}</td></tr>)}</tbody></table></div>}
      <small>Uma exibição exige metade do cartão visível por um segundo. Eventos repetidos da mesma divulgação são contados uma vez por sessão e dia. Acessos da própria empresa e de administradores conectados são excluídos. Cliques no WhatsApp não comprovam mensagens ou vendas; os números não representam pessoas únicas.</small>
    </>}
  </Container>;
}
