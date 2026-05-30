import { useNavigate } from 'react-router-dom';
import { FileText, Eye, CheckCircle } from 'lucide-react';
import { usersMock } from '../../data/users';
import { JobsBoard } from '../../components/JobsBoard';
import { SponsorCarousel } from '../../components/SponsorCarousel';
import * as S from './styles';

export function CandidateDashboard() {
  const navigate = useNavigate();
  const currentUser = usersMock[0]; // Usando o primeiro usuário como mock logado

  return (
    <S.DashboardContainer>
     
      <S.WelcomeSection>
        <h1>Olá, {currentUser.name.split(' ')[0]}! </h1>
        <p>Aqui está o resumo das suas atividades na plataforma.</p>
      </S.WelcomeSection>

      <S.StatsGrid>
        <S.StatCard>
          <div className="icon-wrapper">
            <CheckCircle size={20} />
          </div>
          <span className="value">3</span>
          <span className="label">Candidaturas</span>
        </S.StatCard>

        <S.StatCard>
          <div className="icon-wrapper">
            <Eye size={20} />
          </div>
          <span className="value">12</span>
          <span className="label">Visualizações no Perfil</span>
        </S.StatCard>

        <S.StatCard>
          <div className="icon-wrapper">
            <FileText size={20} />
          </div>
          <span className="value">85%</span>
          <span className="label">Perfil Completo</span>
        </S.StatCard>
      </S.StatsGrid>
     <SponsorCarousel />
      <section>
        <S.SectionTitle>
          Vagas Disponíveis
          <button onClick={() => navigate('/vagas')}>Ver todas na página</button>
        </S.SectionTitle>

        <JobsBoard />
      </section>
    </S.DashboardContainer>
  );
}
