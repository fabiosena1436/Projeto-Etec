import { TrendingUp, Users, Building, Smartphone } from 'lucide-react';
import * as S from './styles';

export function Home() {
  return (
    <S.HomeContainer>
      <S.HeroSection>
        <S.HeroContent>
          <h1>Conectando Talentos às Oportunidades em Teodoro Sampaio</h1>
          <p>A plataforma definitiva para empresas locais encontrarem os melhores profissionais e para os cidadãos conquistarem o emprego ideal.</p>
          <S.ButtonGroup>
            <S.PrimaryButton>Sou Candidato</S.PrimaryButton>
            <S.SecondaryButton>Sou Empresa</S.SecondaryButton>
          </S.ButtonGroup>
        </S.HeroContent>
      </S.HeroSection>

      <S.StatsSection>
        <S.StatCard>
          <h3>128</h3>
          <p>Vagas Abertas</p>
        </S.StatCard>
        <S.StatCard>
          <h3>67</h3>
          <p>Empresas Parceiras</p>
        </S.StatCard>
        <S.StatCard>
          <h3>1.240</h3>
          <p>Currículos Cadastrados</p>
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
    </S.HomeContainer>
  );
}
