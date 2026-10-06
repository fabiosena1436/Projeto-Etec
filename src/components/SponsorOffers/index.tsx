import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowUpRight } from 'lucide-react';
import styled from 'styled-components';
import { sponsorsService, type SponsorOffer, type SponsorSurface } from '../../services/supabase/sponsors.service';

const Section = styled.section`
  min-width:0; padding:24px; border:1px solid #dde6ee; border-radius:16px; background:#fff;
  h2 { color:#102a43; font-size:22px; margin:0 0 8px; }
  .explanation { color:#52687a; font-size:14px; line-height:1.6; margin:0 0 18px; }
  .offers { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr)); gap:18px; }
  article { min-width:0; display:flex; flex-direction:column; border:1px solid #e1e8ee; border-radius:12px; padding:16px; }
  .sponsor-label { display:block; font-size:11px; color:#52687a; margin-bottom:12px; }
  .business { display:flex; align-items:center; gap:10px; min-width:0; margin-bottom:12px; }
  .business img,.business svg { width:36px; height:36px; object-fit:contain; flex-shrink:0; }
  .business strong { font-size:14px; overflow-wrap:anywhere; color:#102a43; }
  .offer-photo { width:100%; height:160px; object-fit:contain; background:#f3f6f9; border-radius:9px; margin-bottom:12px; }
  h3 { font-size:17px; margin:0 0 8px; color:#16344b; overflow-wrap:anywhere; }
  .description { font-size:14px; line-height:1.55; color:#52687a; overflow-wrap:anywhere; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; margin:0 0 12px; }
  .prices { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; color:#0c6d5d; }
  del { color:#52687a; font-size:13px; }
  small { font-size:12px; color:#52687a; margin-bottom:12px; }
  .offer-link { margin-top:auto; display:flex; justify-content:space-between; align-items:center; min-height:44px; gap:8px; color:#165bb4; font-weight:650; font-size:14px; }
  a:focus-visible { outline:3px solid #76abe9; outline-offset:3px; }
  &[data-surface=community] { padding:16px; margin-bottom:18px; }
  &[data-surface=community] h2 { font-size:18px; }
  &[data-surface=community] .offers { display:block; }
  &[data-surface=community] article { padding:0; border:0; }
  &[data-surface=community] .offer-photo { height:140px; }
  @media(max-width:600px) { padding:18px; }
`;
const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

function OfferCard({offer}:{offer:SponsorOffer}) {
  const element=useRef<HTMLElement>(null);
  useEffect(()=>{
    if (!offer.token || !element.current || !('IntersectionObserver' in window)) return;
    let timer:ReturnType<typeof setTimeout>|undefined, sent=false, visible=false;
    const cancel=()=>{if(timer){clearTimeout(timer);timer=undefined;}};
    const schedule=()=>{
      cancel();
      if(visible&&!sent&&document.visibilityState==='visible')timer=setTimeout(()=>{
        sent=true;void sponsorsService.track(offer.token,'impression',offer.company_id);
      },1000);
    };
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=0.5;schedule();},{threshold:[0,0.5]});
    observer.observe(element.current);
    document.addEventListener('visibilitychange',schedule);
    return()=>{cancel();observer.disconnect();document.removeEventListener('visibilitychange',schedule);};
  },[offer.token,offer.company_id]);
  const params=new URLSearchParams();
  if(offer.token)params.set('divulgacao',offer.token);
  const href=`/patrocinador/${offer.company_id}${params.size?'?'+params:''}${offer.promotion_id?'#oferta-'+offer.promotion_id:''}`;
  return <article ref={element} aria-label={`${offer.is_demo?'Oferta de demonstração':'Oferta patrocinada'} de ${offer.company_name}`}>
    <span className="sponsor-label">{offer.is_demo?'Demonstração de parceria · Oferta fictícia':'Patrocinado · Parceiro da cidade'}</span>
    <div className="business">{offer.logo_url?<img src={offer.logo_url} alt="" loading="lazy" referrerPolicy="no-referrer"/>:<Building2/>}<strong>{offer.company_name}</strong></div>
    {offer.image_url&&<img className="offer-photo" src={offer.image_url} alt={offer.title} loading="lazy" referrerPolicy="no-referrer"/>}
    <h3>{offer.title}</h3><p className="description">{offer.description}</p>
    {(offer.price!==null||offer.discount_price!==null)&&<div className="prices">{offer.discount_price!==null?<>{offer.price!==null&&<del>{money(offer.price)}</del>}<strong>{money(offer.discount_price)}</strong></>:<strong>{money(offer.price!)}</strong>}</div>}
    {offer.valid_until&&<small>Válido até {new Date(offer.valid_until+'T12:00:00').toLocaleDateString('pt-BR')}</small>}
    <Link className="offer-link" to={href} onClick={()=>void sponsorsService.track(offer.token,'click',offer.company_id)}>{offer.promotion_id?'Ver oferta':'Conhecer empresa'}<ArrowUpRight size={18}/></Link>
  </article>;
}

export function SponsorOffers({surface}:{surface:SponsorSurface}) {
  const [offers,setOffers]=useState<SponsorOffer[]>([]);
  useEffect(()=>{let active=true;sponsorsService.placements(surface).then(rows=>{if(active)setOffers(rows);}).catch(()=>{});return()=>{active=false;};},[surface]);
  if(!offers.length)return null;
  return <Section data-surface={surface} aria-label="Ofertas patrocinadas de empresas locais"><h2>{surface==='home'?'Ofertas dos parceiros':'Parceiro da cidade'}</h2>
    <p className="explanation">{surface==='home'?'Conheça ofertas e negócios locais que apoiam esta conexão.':'Divulgação de quem apoia a plataforma.'}</p>
    <div className="offers">{offers.map(offer=><OfferCard key={offer.company_id} offer={offer}/>)}</div>
  </Section>;
}
