import { useNavigate } from 'react-router-dom';
import { PlusCircle, Eye, Users, Briefcase } from 'lucide-react';
import { jobsMock } from '../../data/jobs';
import { companiesMock } from '../../data/companies';
import * as S from './styles';

export function CompanyDashboard() {
  const navigate = useNavigate();
  // Simula a empresa logada (empresa 2 no mock)
  const company = companiesMock.find(c => c.id === 'comp-2')!;
  const myJobs = jobsMock.filter(j => j.companyId === company.id);

  return (
    <S.DashboardContainer>
      <S.Header>
        <div>
          <S.Greeting>Olá, {company.name}</S.Greeting>
          <p>Acompanhe o desempenho das suas vagas.</p>
        </div>
        <S.CreateJobButton onClick={() => navigate('/empresa/vaga/nova')}>
          <PlusCircle size={20} />
          <span>Nova Vaga</span>
        </S.CreateJobButton>
      </S.Header>

      <S.MetricsGrid>
        <S.MetricCard>
          <div className="icon"><Briefcase size={24} color="#2563eb" /></div>
          <div className="info">
            <h3>{myJobs.length}</h3>
            <p>Vagas Ativas</p>
          </div>
        </S.MetricCard>
        <S.MetricCard>
          <div className="icon"><Eye size={24} color="#10b981" /></div>
          <div className="info">
            <h3>1.245</h3>
            <p>Visualizações</p>
          </div>
        </S.MetricCard>
        <S.MetricCard>
          <div className="icon"><Users size={24} color="#f59e0b" /></div>
          <div className="info">
            <h3>48</h3>
            <p>Candidatos</p>
          </div>
        </S.MetricCard>
      </S.MetricsGrid>

      <S.Section>
        <S.SectionTitle>Suas Vagas Recentes</S.SectionTitle>
        <S.JobList>
          {myJobs.map(job => (
            <S.JobCard key={job.id} onClick={() => navigate(`/vagas/${job.id}`)}>
              <div className="job-info">
                <h4>{job.title}</h4>
                <span className="type">{job.type}</span>
              </div>
              <div className="job-stats">
                <span><Users size={16} /> 12 candidatos</span>
                <span><Eye size={16} /> 340 vis.</span>
              </div>
            </S.JobCard>
          ))}
        </S.JobList>
      </S.Section>
    </S.DashboardContainer>
  );
}
