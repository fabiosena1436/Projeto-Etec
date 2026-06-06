import { useParams, useLocation } from 'react-router-dom';
import { MapPin, Briefcase, GraduationCap, User, Phone, Download, Mail, Calendar } from 'lucide-react';
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
    const phoneUnformatted = user.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${user.name}, vi seu perfil no Conecta Sampaio e gostaria de conversar sobre uma oportunidade.`);
    window.open(`https://wa.me/55${phoneUnformatted}?text=${message}`, '_blank');
  };

  return (
    <S.ProfileContainer>
      <S.LeftColumn>
        <S.HeaderCard>
          <S.Avatar>
            {user.name.charAt(0)}
          </S.Avatar>
          
          <S.UserInfo>
            <h1>{user.name}</h1>
            <h2>{user.profession}</h2>

            <S.InfoList>
              <li>
                <MapPin size={18} />
                {user.city}
              </li>
              <li>
                <Calendar size={18} />
                {user.age} anos
              </li>
              <li>
                <Mail size={18} />
                {user.email || 'contato@email.com'}
              </li>
              {isRecruiter && user.phone && (
                <li>
                  <Phone size={18} />
                  {user.phone}
                </li>
              )}
            </S.InfoList>

            {isRecruiter && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', width: '100%' }}>
                {user.phone && (
                  <button 
                    onClick={handleWhatsAppContact}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.875rem',
                      backgroundColor: '#25D366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#20bd5a')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#25D366')}
                  >
                    <Phone size={20} />
                    Chamar no WhatsApp
                  </button>
                )}

                {user.resumeUrl && (
                  <a 
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.875rem',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      width: '100%'
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
            <GraduationCap size={24} />
            Habilidades
          </S.SectionTitle>
          <S.SkillsGrid>
            {user.skills.map((skill, index) => (
              <S.SkillTag key={index}>{skill}</S.SkillTag>
            ))}
          </S.SkillsGrid>
        </S.ContentCard>
      </S.LeftColumn>

      <S.RightColumn>
        <S.ContentCard>
          <S.SectionTitle>
            <User size={24} />
            Sobre Mim
          </S.SectionTitle>
          <S.AboutText>{user.about}</S.AboutText>
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
        
        <S.ContentCard>
          <S.SectionTitle>
            <GraduationCap size={24} />
            Formação Acadêmica
          </S.SectionTitle>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.125rem', color: '#0f172a', marginBottom: '0.25rem' }}>{user.education}</h4>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Ensino Concluído</p>
            </div>
          </div>
        </S.ContentCard>
      </S.RightColumn>
    </S.ProfileContainer>
  );
}
