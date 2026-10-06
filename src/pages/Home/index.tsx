import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, MapPin, Search, BriefcaseBusiness, Building2, ShieldCheck, UserRound, Check } from 'lucide-react';
import { SponsorCarousel } from '../../components/SponsorCarousel';
import { JobsBoard } from '../../components/JobsBoard';
import { metricsService } from '../../services/supabase/metrics.service';
import type { PublicMetrics } from '../../services/supabase/metrics.service';
import * as S from './styles';

export function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);
  useEffect(() => {
    let active = true;
    metricsService.getPublic().then(value => { if(active) setMetrics(value); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const fmt = (value: number | undefined) => value === undefined ? '—' : value.toLocaleString('pt-BR');
  return <S.HomeContainer>
    <S.HeroSection>
      <S.HeroContent>
        <S.Eyebrow><MapPin size={15} /> TEODORO SAMPAIO · SP</S.Eyebrow>
        <h1>Seu próximo passo<br />pode estar <em>bem perto.</em></h1>
        <p>Encontre trabalho e faça parte da vida da nossa cidade. Compartilhe seu dia, acompanhe notícias e conecte-se com pessoas e empresas.</p>
        <S.SearchForm role="search" onSubmit={e => { e.preventDefault(); navigate(`/vagas${search.trim() ? `?busca=${encodeURIComponent(search.trim())}` : ''}`); }}>
          <Search size={21} aria-hidden="true" />
          <input aria-label="Cargo ou empresa" placeholder="Qual oportunidade você procura?" value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit">Buscar vagas <ArrowRight size={17} /></button>
        </S.SearchForm>
        <S.HeroLinks><span><Check size={15} /> Consulte vagas sem cadastro</span><Link to="/comunidade">Explorar a comunidade <ArrowUpRight size={16} /></Link><Link to="/cadastro?type=empresa">Quero contratar <ArrowUpRight size={16} /></Link></S.HeroLinks>
      </S.HeroContent>
      <S.CityPanel>
        <div className="panel-top"><span className="dot" /> CONEXÕES QUE MOVEM A CIDADE</div>
        <h2>Da nossa cidade.<br />Para sua próxima<br /><em>conquista.</em></h2>
        <div className="city" aria-hidden="true"><span className="sun" /><span className="building one" /><span className="building two" /><span className="building three" /><span className="building four" /><span className="ground" /></div>
        <div className="panel-bottom"><Building2 size={20} /><span>Empresas locais.<br /><strong>Talentos de todos os caminhos.</strong></span><ArrowUpRight size={24} /></div>
      </S.CityPanel>
    </S.HeroSection>
    <S.StatsSection aria-label="A plataforma em números">
      <S.StatCard><BriefcaseBusiness size={23} /><div><strong>{fmt(metrics?.active_jobs)}</strong><span>vagas abertas</span></div></S.StatCard>
      <S.StatCard><Building2 size={23} /><div><strong>{fmt(metrics?.companies)}</strong><span>empresas cadastradas</span></div></S.StatCard>
      <S.StatCard><UserRound size={23} /><div><strong>{fmt(metrics?.candidates)}</strong><span>pessoas conectadas</span></div></S.StatCard>
      <p>Oportunidades reais.<br /><strong>Uma cidade com mais possibilidades.</strong></p>
    </S.StatsSection>
    <S.Section id="oportunidades">
      <S.SectionTitle><div><S.Eyebrow>ENCONTRE SEU CAMINHO</S.Eyebrow><h2>Oportunidades perto de você</h2><p>Do primeiro emprego ao próximo desafio. Explore as vagas da cidade.</p></div><Link to="/vagas">Ver todas as vagas <ArrowRight size={18} /></Link></S.SectionTitle>
      <JobsBoard maxItems={6} />
    </S.Section>
    <S.HowSection>
      <S.SectionTitle><div><S.Eyebrow>SIMPLES, DO COMEÇO AO FIM</S.Eyebrow><h2>Seu próximo passo em três etapas</h2></div><Link to="/ajuda">Como funciona <ArrowRight size={18} /></Link></S.SectionTitle>
      <S.StepsGrid>
        <S.Step><span>01</span><h3>Encontre uma oportunidade</h3><p>Busque vagas por cargo, empresa ou modalidade. Você pode explorar antes de criar sua conta.</p></S.Step>
        <S.Step><span>02</span><h3>Apresente seu talento</h3><p>Crie seu perfil e acrescente suas experiências, habilidades e currículo.</p></S.Step>
        <S.Step><span>03</span><h3>Dê o próximo passo</h3><p>Envie sua candidatura e acompanhe as atualizações pelo seu painel.</p></S.Step>
      </S.StepsGrid>
    </S.HowSection>
    <S.CompanySection>
      <div><S.Eyebrow>PARA QUEM FAZ A CIDADE CRESCER</S.Eyebrow><h2>O próximo talento da sua empresa<br />pode ser seu vizinho.</h2><p>Publique oportunidades e organize suas candidaturas em um só lugar. Seu comércio, negócio ou empresa tem espaço aqui.</p><Link to="/cadastro?type=empresa">Cadastrar minha empresa <ArrowUpRight size={18} /></Link></div>
      <div className="company-note"><Building2 size={40} /><strong>Mais perto das pessoas.<br />Mais perto do seu negócio.</strong><span>De pequenos comércios a grandes equipes.</span></div>
    </S.CompanySection>
    <SponsorCarousel />
    <S.TrustSection><ShieldCheck size={25} /><div><strong>Seu currículo merece cuidado.</strong><p>O arquivo fica privado e é compartilhado com as empresas para as quais você se candidata.</p></div><Link to="/privacidade">Entenda a privacidade <ArrowRight size={16} /></Link></S.TrustSection>
  </S.HomeContainer>;
}
