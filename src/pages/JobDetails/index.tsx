import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import type { Job } from '../../data/jobs';
import type { Company } from '../../data/companies';
import { useAppliedJobs } from '../../hooks/useAppliedJobs';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import * as S from './styles';

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasApplied, applyToJob } = useAppliedJobs();
  
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const fetchedJob = await apiService.getJobById(id);
        if (fetchedJob) {
          setJob(fetchedJob);
          const fetchedCompany = await apiService.getCompanyById(fetchedJob.companyId);
          setCompany(fetchedCompany || null);
        }
      } catch (error) {
        console.error("Failed to fetch job details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <S.Container>
        <p>Carregando vaga...</p>
      </S.Container>
    );
  }
  
  if (!job) {
    return (
      <S.Container>
        <S.ErrorState>
          <h2>Vaga não encontrada</h2>
          <button onClick={() => navigate('/vagas')}>Voltar para vagas</button>
        </S.ErrorState>
      </S.Container>
    );
  }

  const handleApply = () => {
    if (job) {
      applyToJob(job.id);
    }
    toast.success('Candidatura enviada com sucesso!', {
      description: 'A empresa receberá seu currículo em breve.',
    });
    // Simula redirecionamento ou delay
    setTimeout(() => navigate('/vagas'), 2000);
  };

  return (
    <S.Container>
      <S.BackButton onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Voltar
      </S.BackButton>

      <S.ContentWrapper>
        <S.MainInfo>
          <S.Header>
            <div className="title-section">
              <h1>{job.title}</h1>
              <span className="status">{job.status}</span>
            </div>
            
            <S.Tags>
              <div className="tag">
                <Briefcase size={18} />
                {job.type}
              </div>
              <div className="tag">
                <MapPin size={18} />
                {job.location}
              </div>
              <div className="tag">
                <DollarSign size={18} />
                {job.salary}
              </div>
              <div className="tag">
                <Calendar size={18} />
                Publicada em {new Date(job.postedAt).toLocaleDateString('pt-BR')}
              </div>
            </S.Tags>
          </S.Header>

          <S.Section>
            <h2>Descrição da Vaga</h2>
            <p>{job.description}</p>
          </S.Section>

          <S.Section>
            <h2>Requisitos</h2>
            <ul>
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </S.Section>

          <S.Section>
            <h2>Benefícios</h2>
            <ul>
              {job.benefits.map((ben, index) => (
                <li key={index}>{ben}</li>
              ))}
            </ul>
          </S.Section>
        </S.MainInfo>

        <S.Sidebar>
          <S.CompanyCard>
            <img src={company?.logoUrl} alt={company?.name} />
            <h3>{company?.name}</h3>
            <p>{company?.industry}</p>
            <p className="description">{company?.description}</p>
          </S.CompanyCard>

          {hasApplied(job.id) ? (
            <S.ApplyButton 
              onClick={() => navigate('/dashboard/candidato')} 
              style={{ background: '#16a34a' }}
            >
              Você já se candidatou a essa vaga
            </S.ApplyButton>
          ) : (
            <S.ApplyButton onClick={handleApply}>
              Candidatar-se a esta vaga
            </S.ApplyButton>
          )}
        </S.Sidebar>
      </S.ContentWrapper>
    </S.Container>
  );
}