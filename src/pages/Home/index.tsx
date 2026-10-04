import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Building, Smartphone } from 'lucide-react';
import { SponsorCarousel } from '../../components/SponsorCarousel';
import { JobsBoard } from '../../components/JobsBoard';
import { DatabaseStatus } from '../../components/DatabaseStatus';
import { useAuth } from '../../hooks/useAuth';
import { metricsService } from '../../services/supabase/metrics.service';
import type { PublicMetrics } from '../../services/supabase/metrics.service';
import * as S from './styles';

const fmt = (n: number) => n.toLocaleString('pt-BR');

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading } = useAuth();
  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);

  useEffect(() => {
    metricsService.getPublic().then(setMetrics).catch(() => {});
  }, []);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      if (role === 'candidato') {
        navigate('/candidato/painel', { replace: true });
      } else if (role === 'empresa') {
        navigate('/empresa/painel', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate, loading]);

  if (isAuthenticated) {
    return <></>;
  }

  return (
    <S.HomeContainer>
     

      <S.HeroSection>
        <S.HeroContent>
          <h1>Conectando Talentos às Oportunidades em Teodoro Sampaio</h1>
          <p>A plataforma definitiva para empresas locais encontrarem os melhores profissionais e para os cidadãos conquistarem o emprego ideal.</p>
          <S.ButtonGroup>
            <S.PrimaryButton onClick={() => navigate('/login?type=candidato')}>Sou Candidato</S.PrimaryButton>
            <S.SecondaryButton onClick={() => navigate('/login?type=empresa')}>Sou Empresa</S.SecondaryButton>
          </S.ButtonGroup>
          {import.meta.env.DEV && (
            <div style={{ marginTop: '2rem', maxWidth: '600px' }}>
              <DatabaseStatus />
            </div>
          )}
        </S.HeroContent>
      </S.HeroSection>
 <SponsorCarousel />
      <S.StatsSection>
        <S.StatCard>
          <h3>{metrics ? fmt(metrics.active_jobs) : '—'}</h3>
          <p>Vagas Abertas</p>
        </S.StatCard>
        <S.StatCard>
          <h3>{metrics ? fmt(metrics.companies) : '—'}</h3>
          <p>Empresas Cadastradas</p>
        </S.StatCard>
        <S.StatCard>
          <h3>{metrics ? fmt(metrics.candidates) : '—'}</h3>
          <p>Candidatos Cadastrados</p>
        </S.StatCard>
      </S.StatsSection>

      <S.FeaturesSection>
        <S.SectionTitle>
          <h2>Por que usar o Conecta Sampaio?</h2>
          <p>Uma plataforma feita sob medida para o desenvolvimento econômico da nossa região.</p>
        </S.SectionTitle>

        <S.FeaturesGrid>
          <S.FeatureCard>
            <S.IconWrapper>
              <TrendingUp size={32} />
            </S.IconWrapper>
            <h4>Fortalecimento Local</h4>
            <p>Priorizamos vagas e talentos da cidade, mantendo a riqueza e as oportunidades circulando na nossa região.</p>
          </S.FeatureCard>
          
          <S.FeatureCard>
            <S.IconWrapper>
              <Users size={32} />
            </S.IconWrapper>
            <h4>Inclusão Digital</h4>
            <p>Fácil de usar para todas as idades, conectando desde o jovem aprendiz até profissionais experientes.</p>
          </S.FeatureCard>

          <S.FeatureCard>
            <S.IconWrapper>
              <Building size={32} />
            </S.IconWrapper>
            <h4>Apoio ao Comércio</h4>
            <p>Pequenos comércios agora possuem uma vitrine digital profissional para atrair os melhores funcionários.</p>
          </S.FeatureCard>

          <S.FeatureCard>
            <S.IconWrapper>
              <Smartphone size={32} />
            </S.IconWrapper>
            <h4>100% Responsivo</h4>
            <p>Acesse pelo celular, tablet ou computador. Seu currículo ou painel da empresa sempre com você.</p>
          </S.FeatureCard>
        </S.FeaturesGrid>
      </S.FeaturesSection>

      <S.RecentJobsSection>
        <S.SectionTitle>
          <h2>Vagas Disponíveis</h2>
          <p>Confira todas as oportunidades publicadas na plataforma e encontre a ideal para você.</p>
        </S.SectionTitle>
        <S.RecentJobsGrid>
          <JobsBoard />
        </S.RecentJobsGrid>
      </S.RecentJobsSection>
    </S.HomeContainer>
  );
}
