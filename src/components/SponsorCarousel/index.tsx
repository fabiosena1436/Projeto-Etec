import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { apiService } from '../../services/api';
import type { Company } from '../../data/companies';
import * as S from './styles';
export function SponsorCarousel() {
  const [sponsors,setSponsors]=useState<Company[]>([]);
  useEffect(()=>{let active=true;apiService.getCompanies().then(companies=>{if(active)setSponsors(companies.filter(company=>company.isSponsor));}).catch(()=>{});return()=>{active=false;};},[]);
  if(!sponsors.length)return null;
  return <S.CarouselSection><S.Title>Empresas que apoiam esta conexão</S.Title><S.TrackContainer aria-label="Empresas patrocinadoras"><S.Track>
    {sponsors.map(sponsor=><S.SponsorCard as={Link} to={`/patrocinador/${sponsor.id}`} key={sponsor.id}>
      {sponsor.logoUrl?<img src={sponsor.logoUrl} alt="" loading="lazy"/>:<span aria-hidden="true" style={{fontSize:30,fontWeight:700}}>{sponsor.name.charAt(0)}</span>}
      <h3>{sponsor.name}</h3>{sponsor.slogan&&<p>{sponsor.slogan}</p>}<span style={{display:'flex',gap:8,alignItems:'center',fontSize:14,color:'#175cda'}}>Ver empresa <ArrowUpRight size={16}/></span>
    </S.SponsorCard>)}
  </S.Track></S.TrackContainer></S.CarouselSection>;
}
