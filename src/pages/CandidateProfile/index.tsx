import { useParams, useLocation } from 'react-router-dom';
import { MapPin, Briefcase, GraduationCap, User, Phone, Download } from 'lucide-react';
import { usersMock } from '../../data/users';
import * as S from './styles';

export function CandidateProfile() {
  const { id } = useParams();
  const location = useLocation();
  
  // Verifica se a URL contém ?viewer=recruiter
  const isRecruiter = new URLSearchParams(location.search).get('viewer') === 'recruiter';
  
  // Na vida real buscaria na API pelo ID. 
  // No mock, se não achar pelo ID da rota, pega o primeiro.
  const user = usersMock.find(u => u.id === id) || usersMock[0];

  const handleWhatsAppContact = () => {
    if (!user.phone) return;
    // Formata o número (remove não-dígitos) para a URL do WhatsApp
    const phoneUnformatted = user.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${user.name}, vi seu perfil no Conecta Sampaio e gostaria de conversar sobre uma oportunidade.`);
    window.open(`https://wa.me/55${phoneUnformatted}?text=${message}`, '_blank');
  };

  return (
    <S.ProfileContainer>
      <S.HeaderCard>
        <S.Avatar>
          {user.name.charAt(0)}
        </S.Avatar>
        
        <S.UserInfo>
          <h1>{user.name}</h1>
          <h2>{user.profession}</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={16} />
              {user.city} • {user.age} anos
            </span>
            
            {isRecruiter && user.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Phone size={16} />
                {user.phone}
              </span>
            )}
          </div>

          {isRecruiter && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {user.phone && (
                <button 
                  onClick={handleWhatsAppContact}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#25D366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#20bd5a')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#25D366')}
                >
                  <Phone size={20} />
                  Contato via WhatsApp
                </button>
              )}

              {user.resumeUrl && (
                <a 
                  href={user.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dbeafe')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                >
                  <Download size={20} />
                  Baixar Currículo
                </a>
              )}
            </div>
          )}
        </S.UserInfo>
      </S.HeaderCard>

      <S.ContentCard>
        <S.SectionTitle>
          <User size={24} />
          Sobre Mim
        </S.SectionTitle>
        <S.AboutText>{user.about}</S.AboutText>
      </S.ContentCard>

      <S.ContentCard>
        <S.SectionTitle>
          <GraduationCap size={24} />
          Habilidades e Formação
        </S.SectionTitle>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.75rem' }}>Formação Acadêmica</h4>
          <p style={{ color: '#64748b' }}>{user.education}</p>
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.75rem' }}>Competências</h4>
          <S.SkillsGrid>
            {user.skills.map((skill, index) => (
              <S.SkillTag key={index}>{skill}</S.SkillTag>
            ))}
          </S.SkillsGrid>
        </div>
      </S.ContentCard>

      <S.ContentCard>
        <S.SectionTitle>
          <Briefcase size={24} />
          Experiência Profissional
        </S.SectionTitle>

        <S.ExperienceList>
          {user.experience.map((exp, index) => (
            <S.ExperienceItem key={index}>
              <div className="icon-col">
                <Briefcase size={20} />
              </div>
              <div className="content-col">
                <h4>{exp.role}</h4>
                <p className="company">{exp.company}</p>
                <p className="period">{exp.period}</p>
              </div>
            </S.ExperienceItem>
          ))}
        </S.ExperienceList>
      </S.ContentCard>
    </S.ProfileContainer>
  );
}
