import { useParams } from 'react-router-dom';
import { MapPin, Briefcase, GraduationCap, User } from 'lucide-react';
import { usersMock } from '../../data/users';
import * as S from './styles';

export function CandidateProfile() {
  const { id } = useParams();
  
  // Na vida real buscaria na API pelo ID. 
  // No mock, se não achar pelo ID da rota, pega o primeiro.
  const user = usersMock.find(u => u.id === id) || usersMock[0];

  return (
    <S.ProfileContainer>
      <S.HeaderCard>
        <S.Avatar>
          {user.name.charAt(0)}
        </S.Avatar>
        
        <S.UserInfo>
          <h1>{user.name}</h1>
          <h2>{user.profession}</h2>
          <p>
            <MapPin size={16} />
            {user.city} • {user.age} anos
          </p>
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
