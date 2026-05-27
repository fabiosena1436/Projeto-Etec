import { useNavigate } from 'react-router-dom';
import { FileText, Eye, CheckCircle } from 'lucide-react';
import { usersMock } from '../../data/users';
import { jobsMock } from '../../data/jobs';
import * as S from './styles';

export function CandidateDashboard() {
  const navigate = useNavigate();
  const currentUser = usersMock[0]; // Usando o primeiro usuário como mock logado
  
  // Pegando algumas vagas para recomendação (apenas as 3 primeiras ativas)
  const recommendedJobs = jobsMock.filter(job => job.status === 'Ativa').slice(0, 3);

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

      <section>
        <S.SectionTitle>
          Vagas Recomendadas para você
          <button onClick={() => navigate('/vagas')}>Ver todas</button>
        </S.SectionTitle>

        <S.JobsList>
          {recommendedJobs.map(job => (
            // Como não implementamos o CardJob isolado nesta iteração, 
            // vou criar um mini-card de vaga aqui para o painel.
            // Se você já tem um componente CardJob, podemos substituí-lo depois.
            <div 
              key={job.id} 
              onClick={() => navigate(`/vagas/${job.id}`)}
              style={{
                padding: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <h3 style={{ fontSize: '1.125rem', color: '#0f172a' }}>{job.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{job.location} • {job.type}</p>
              <p style={{ color: '#2563eb', fontWeight: '600', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Ver detalhes &rarr;
              </p>
            </div>
          ))}
        </S.JobsList>
      </section>
    </S.DashboardContainer>
  );
}
