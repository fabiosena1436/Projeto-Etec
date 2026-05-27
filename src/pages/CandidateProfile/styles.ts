import styled from 'styled-components';

export const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

export const HeaderCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;

  /* Detalhe de design premium no topo do card */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
    z-index: 0;
  }

  > * {
    z-index: 1;
  }
`;

export const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 4px solid ${({ theme }) => theme.colors.surface};
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 20px; /* Para descer um pouco por causa da faixa superior */
`;

export const UserInfo = styled.div`
  h1 {
    font-size: 1.75rem;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.25rem;
  }
  
  h2 {
    font-size: 1.125rem;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.textLight};
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
`;

export const ContentCard = styled.section`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const AboutText = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.6;
`;

export const SkillsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const SkillTag = styled.span`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ExperienceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ExperienceItem = styled.div`
  display: flex;
  gap: 1rem;
  
  .icon-col {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.primary}10;
    color: ${({ theme }) => theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .content-col {
    h4 {
      font-size: 1.125rem;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 0.25rem;
    }
    
    .company {
      font-weight: 500;
      color: ${({ theme }) => theme.colors.text};
    }
    
    .period {
      color: ${({ theme }) => theme.colors.textLight};
      font-size: 0.875rem;
    }
  }
`;
