import styled from 'styled-components';

export const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 350px 1fr;
    align-items: start;
  }
`;

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 2rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}10;
  }
`;

export const LeftColumn = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const RightColumn = styled.main`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
  gap: 1.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
    z-index: 0;
  }

  > * {
    z-index: 1;
  }
`;

export const Avatar = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 4px solid ${({ theme }) => theme.colors.surface};
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 20px; 
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  h1 {
    font-size: 1.75rem;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.25rem;
  }
  
  h2 {
    font-size: 1.125rem;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 500;
    margin-bottom: 1rem;
  }
`;

export const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 1.5rem;

  li {
    color: ${({ theme }) => theme.colors.textLight};
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    svg {
      color: ${({ theme }) => theme.colors.primary};
      flex-shrink: 0;
    }
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
  line-height: 1.7;
`;

export const SkillsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const SkillTag = styled.span`
  background-color: ${({ theme }) => theme.colors.primary}10;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid ${({ theme }) => theme.colors.primary}20;
`;

export const ExperienceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const ExperienceItem = styled.div`
  display: flex;
  gap: 1.25rem;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 23px;
    top: 50px;
    bottom: -2rem;
    width: 2px;
    background-color: ${({ theme }) => theme.colors.border};
  }

  .icon-col {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background-color: ${({ theme }) => theme.colors.primary}10;
    color: ${({ theme }) => theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    z-index: 1;
  }

  .content-col {
    h4 {
      font-size: 1.125rem;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 0.25rem;
    }
    
    .company {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.primary};
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }
    
    .period {
      color: ${({ theme }) => theme.colors.textLight};
      font-size: 0.875rem;
    }
  }
`;
