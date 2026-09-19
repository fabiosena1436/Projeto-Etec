import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, GraduationCap, User, Phone, Download, Mail, Calendar, ArrowLeft, Edit2, Clock, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { candidatesService } from '../../services/supabase/candidates.service';
import { applicationsService } from '../../services/supabase/applications.service';
import { PageLoader } from '../../components/PageLoader';
import type { Candidate, Profile } from '../../types/database';
import * as S from './styles';

type CandidateFull = Candidate & { profile: Profile };

const actionBtn = (bg: string, color: string, border = 'none'): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem',
  backgroundColor: bg, color, border, borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
  transition: 'all 0.2s', width: '100%', textDecoration: 'none', font: 'inherit',
});

function formatPeriod(start: string, end: string | null, current: boolean) {
  const f = (d: string) => new Date(d).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  return `${f(start)} — ${current || !end ? 'Atual' : f(end)}`;
}

export function CandidateProfile() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { role, profile, isMock } = useAuth();

  const [candidate, setCandidate] = useState<CandidateFull | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = !!profile && profile.id === id;
  const isRecruiter = role === 'empresa' || role === 'admin' || new URLSearchParams(location.search).get('viewer') === 'recruiter';
  const applicationId = new URLSearchParams(location.search).get('app');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await candidatesService.getById(isMock && !id.startsWith('user-') ? 'user-1' : id);
        if (!cancelled) setCandidate(data as CandidateFull | null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, isMock]);

  // Empresa abriu o perfil a partir de uma candidatura → marca como visualizada
  useEffect(() => {
    if (applicationId && isRecruiter && !isMock) {
      applicationsService.markViewed(applicationId);
    }
  }, [applicationId, isRecruiter, isMock]);

  if (loading) return <PageLoader label="Carregando perfil..." />;

  if (!candidate) {
    return (
      <S.ProfileContainer style={{ display: 'block', textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Perfil não encontrado</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          {isOwner ? 'Complete seu cadastro no painel para ativar seu perfil público.' : 'Este candidato pode ter desativado o perfil.'}
        </p>
        <button onClick={() => navigate(isOwner ? '/candidato/painel' : -1 as any)} style={{ ...actionBtn('#2563eb', 'white'), width: 'auto', margin: '0 auto', padding: '0.75rem 1.5rem' }}>
          {isOwner ? 'Ir para o painel' : 'Voltar'}
        </button>
      </S.ProfileContainer>
    );
  }

  const p = candidate.profile;
  const name = p?.full_name || 'Candidato';
  const skills = (candidate.skills || []).map(s => s.skill?.name).filter(Boolean) as string[];
  const experiences = candidate.experiences || [];
  const canSeeContact = isRecruiter || isOwner;

  const handleWhatsAppContact = () => {
    if (!p?.phone) return;
    const digits = p.phone.replace(/\D/g, '');
    const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
    const message = encodeURIComponent(`Olá ${name.split(' ')[0]}, vi seu perfil no Conecta Sampaio e gostaria de conversar sobre uma oportunidade.`);
    window.open(`https://wa.me/${withCountry}?text=${message}`, '_blank', 'noopener');
  };

  const handleDownloadResume = async () => {
    if (!candidate.resume_url) return;
    const url = await candidatesService.getResumeSignedUrl(candidate.resume_url);
    if (url) window.open(url, '_blank', 'noopener');
    else toast.error('Currículo indisponível. A empresa só pode baixar currículos de quem se candidatou às suas vagas.');
  };

  return (
    <>
      <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto 1rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <S.BackButton onClick={() => navigate(isRecruiter ? '/empresa/painel' : -1 as any)}>
          <ArrowLeft size={20} />
          {isRecruiter ? 'Voltar para o Painel da Empresa' : 'Voltar'}
        </S.BackButton>
        {isOwner && (
          <button onClick={() => navigate('/candidato/painel')} style={{ ...actionBtn('#eff6ff', '#2563eb'), width: 'auto', padding: '0.6rem 1rem' }}>
            <Edit2 size={16} /> Editar meu perfil
          </button>
        )}
      </div>

      <S.ProfileContainer>
        <S.LeftColumn>
          <S.HeaderCard>
            <S.Avatar style={p?.avatar_url ? { backgroundImage: `url(${p.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              {!p?.avatar_url && name.charAt(0).toUpperCase()}
            </S.Avatar>

            <S.UserInfo>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'inherit' }}>
                {name}
                {p?.is_verified && <BadgeCheck size={20} color="#2563eb" aria-label="Verificado" />}
              </h1>
              <h2>{candidate.profession || 'Em busca de oportunidade'}</h2>

              {candidate.is_open_to_work && (
                <span style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 999, marginTop: '0.5rem' }}>
                  DISPONÍVEL PARA TRABALHAR
                </span>
              )}

              <S.InfoList>
                <li><MapPin size={18} />{candidate.city || p?.city}</li>
                {candidate.age && <li><Calendar size={18} />{candidate.age} anos</li>}
                {candidate.availability && <li><Clock size={18} />Disponibilidade: {candidate.availability}</li>}
                {canSeeContact && p?.email && <li><Mail size={18} />{p.email}</li>}
                {canSeeContact && p?.phone && <li><Phone size={18} />{p.phone}</li>}
              </S.InfoList>

              {isRecruiter && !isOwner && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', width: '100%' }}>
                  {p?.phone && (
                    <button onClick={handleWhatsAppContact} style={actionBtn('#25D366', 'white')}>
                      <Phone size={20} /> Chamar no WhatsApp
                    </button>
                  )}
                  {p?.email && (
                    <a href={`mailto:${p.email}`} style={actionBtn('#0f172a', 'white')}>
                      <Mail size={20} /> Enviar e-mail
                    </a>
                  )}
                  {candidate.resume_url && (
                    <button onClick={handleDownloadResume} style={actionBtn('#eff6ff', '#2563eb', '1px solid #bfdbfe')}>
                      <Download size={20} /> Baixar Currículo
                    </button>
                  )}
                </div>
              )}
            </S.UserInfo>
          </S.HeaderCard>

          <S.ContentCard>
            <S.SectionTitle><GraduationCap size={24} />Habilidades</S.SectionTitle>
            {skills.length ? (
              <S.SkillsGrid>{skills.map((skill, i) => <S.SkillTag key={i}>{skill}</S.SkillTag>)}</S.SkillsGrid>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Nenhuma habilidade informada.</p>
            )}
          </S.ContentCard>
        </S.LeftColumn>

        <S.RightColumn>
          <S.ContentCard>
            <S.SectionTitle><User size={24} />Sobre</S.SectionTitle>
            <S.AboutText style={{ whiteSpace: 'pre-line' }}>{candidate.about || 'Este candidato ainda não escreveu uma apresentação.'}</S.AboutText>
          </S.ContentCard>

          <S.ContentCard>
            <S.SectionTitle><Briefcase size={24} />Experiência Profissional</S.SectionTitle>
            {experiences.length ? (
              <S.ExperienceList>
                {experiences.map(exp => (
                  <S.ExperienceItem key={exp.id}>
                    <div className="icon-col"><Briefcase size={20} /></div>
                    <div className="content-col">
                      <h4>{exp.role}</h4>
                      <p className="company">{exp.company_name}</p>
                      <p className="period">{formatPeriod(exp.start_date, exp.end_date, exp.is_current)}</p>
                      {exp.description && <p style={{ marginTop: '0.4rem', color: '#475569', fontSize: '0.9rem' }}>{exp.description}</p>}
                    </div>
                  </S.ExperienceItem>
                ))}
              </S.ExperienceList>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Sem experiências cadastradas — em busca do primeiro emprego.</p>
            )}
          </S.ContentCard>

          <S.ContentCard>
            <S.SectionTitle><GraduationCap size={24} />Formação Acadêmica</S.SectionTitle>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.125rem', color: '#0f172a', marginBottom: '0.25rem' }}>{candidate.education || 'Não informada'}</h4>
                {candidate.experience_years > 0 && <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{candidate.experience_years} ano(s) de experiência</p>}
              </div>
            </div>
          </S.ContentCard>
        </S.RightColumn>
      </S.ProfileContainer>
    </>
  );
}
