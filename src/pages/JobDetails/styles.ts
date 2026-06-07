import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

export const ErrorState = styled.div`
  text-align: center;
  padding: 4rem;
  
  h2 {
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 1rem;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.2s;
    
    &:hover {
      filter: brightness(0.9);
    }
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

export const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  align-items: start;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const MainInfo = styled.main`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

export const Header = styled.header`
  margin-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background};
  padding-bottom: 1.5rem;
  
  .title-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    
    h1 {
      color: ${({ theme }) => theme.colors.text};
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .status {
      background: ${({ theme }) => theme.colors.primary}15;
      color: ${({ theme }) => theme.colors.primary};
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.875rem;
      font-weight: 500;
    }
  }
`;

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  
  .tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.colors.textLight};
    font-size: 0.875rem;
    
    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

export const Section = styled.section`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h2 {
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textLight};
    line-height: 1.6;
    white-space: pre-wrap;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
    
    li {
      position: relative;
      padding-left: 1.5rem;
      margin-bottom: 0.75rem;
      color: ${({ theme }) => theme.colors.textLight};
      line-height: 1.5;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.5rem;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: ${({ theme }) => theme.colors.primary};
      }
    }
  }
`;

export const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 2rem;
`;

export const CompanyCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 1rem;
    object-fit: cover;
    border: 2px solid ${({ theme }) => theme.colors.background};
  }
  
  h3 {
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.125rem;
    margin-bottom: 0.25rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }
  
  .description {
    color: ${({ theme }) => theme.colors.textLight};
    font-size: 0.875rem;
    font-weight: 400;
    margin-bottom: 0;
    line-height: 1.5;
  }
`;

export const ApplyButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: filter 0.2s, transform 0.1s;
  box-shadow: 0 4px 6px -1px ${({ theme }) => theme.colors.primary}40;
  
  &:hover {
    filter: brightness(0.9);
  }
  
  &:active {
    transform: translateY(2px);
  }
`;
