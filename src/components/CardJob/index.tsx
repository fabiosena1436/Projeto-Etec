import { useNavigate } from 'react-router-dom';
import type { Job } from '../../data/jobs';
import { companiesMock } from '../../data/companies';
import { useAppliedJobs } from '../../hooks/useAppliedJobs';
import { MapPin, Briefcase, DollarSign, CheckCircle } from 'lucide-react';
import * as S from './styles';

interface CardJobProps {
  job: Job;
}

export function CardJob({ job }: CardJobProps) {
  const navigate = useNavigate();
  const { hasApplied } = useAppliedJobs();
  const company = companiesMock.find(c => c.id === job.companyId);

  return (
    <S.CardContainer onClick={() => navigate(`/vagas/${job.id}`)}>
      <S.CompanyHeader>
        {company?.logoUrl ? (
          <img src={company.logoUrl} alt={`Logo ${company.name}`} />
        ) : (
          <div className="placeholder" />
        )}
        <div>
          <h3>{job.title}</h3>
          <span>{company?.name || 'Empresa Confidencial'}</span>
        </div>
      </S.CompanyHeader>

      <S.TagsContainer>
        <S.Tag>
          <Briefcase size={16} />
          {job.type}
        </S.Tag>
        <S.Tag>
          <MapPin size={16} />
          {job.location}
        </S.Tag>
        <S.Tag>
          <DollarSign size={16} />
          {job.salary}
        </S.Tag>
        {hasApplied(job.id) && (
          <S.Tag style={{ background: '#dcfce3', color: '#166534', border: '1px solid #bbf7d0' }}>
            <CheckCircle size={16} />
            Candidatura Realizada
          </S.Tag>
        )}
      </S.TagsContainer>
      
      <S.Description>
        {job.description.length > 100 
          ? `${job.description.substring(0, 100)}...` 
          : job.description}
      </S.Description>
    </S.CardContainer>
  );
}