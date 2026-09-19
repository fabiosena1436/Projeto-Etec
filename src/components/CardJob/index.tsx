import { useNavigate } from 'react-router-dom';
import type { Job } from '../../data/jobs';
import { useAppliedJobs } from '../../hooks/useAppliedJobs';
import { MapPin, Briefcase, DollarSign, CheckCircle, Star } from 'lucide-react';
import * as S from './styles';

interface CardJobProps {
  job: Job;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 30) return `Há ${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'Há 1 mês' : `Há ${months} meses`;
}

export function CardJob({ job }: CardJobProps) {
  const navigate = useNavigate();
  const { hasApplied } = useAppliedJobs();
  const companyName = job.companyName || 'Empresa Confidencial';

  return (
    <S.CardContainer onClick={() => navigate(`/vagas/${job.id}`)} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate(`/vagas/${job.id}`)}>
      <S.CompanyHeader>
        {job.companyLogoUrl ? (
          <img src={job.companyLogoUrl} alt={`Logo ${companyName}`} loading="lazy" />
        ) : (
          <div className="placeholder">{companyName.charAt(0)}</div>
        )}
        <div style={{ minWidth: 0 }}>
          <h3>{job.title}</h3>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {companyName}
            {job.companyIsSponsor && <Star size={12} fill="#fbbf24" color="#fbbf24" aria-label="Empresa parceira" />}
          </span>
        </div>
      </S.CompanyHeader>

      <S.TagsContainer>
        <S.Tag><Briefcase size={16} />{job.type}</S.Tag>
        <S.Tag><MapPin size={16} />{job.location}</S.Tag>
        <S.Tag><DollarSign size={16} />{job.salary}</S.Tag>
        {hasApplied(job.id) && (
          <S.Tag style={{ background: '#dcfce3', color: '#166534', border: '1px solid #bbf7d0' }}>
            <CheckCircle size={16} />
            Candidatura Realizada
          </S.Tag>
        )}
      </S.TagsContainer>

      <S.Description>
        {job.description.length > 110 ? `${job.description.substring(0, 110)}...` : job.description}
      </S.Description>

      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        {timeAgo(job.postedAt)}
      </div>
    </S.CardContainer>
  );
}
