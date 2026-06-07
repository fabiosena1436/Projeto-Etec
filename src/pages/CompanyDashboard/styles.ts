import styled from 'styled-components';

export const DashboardContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  padding-bottom: 6rem; /* espaço para o bottom nav mobile */
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  p {
    color: ${({ theme }) => theme.colors.textLight};
    margin-top: 0.25rem;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const Greeting = styled.h1`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const CreateJobButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.background};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h3 {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

export const Section = styled.section`
  margin-top: 2rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1rem;
`;

export const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PromoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const AddPromoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
  
  &:disabled {
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textLight};
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

export const PromoList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

export const PromoItem = styled.div`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;

  h4 {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textLight};
    line-height: 1.4;
  }

  .price {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
    margin-top: 0.5rem;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding-top: 1rem;
    
    button {
      flex: 1;
      padding: 0.25rem;
      font-size: 0.875rem;
      background: none;
      color: ${({ theme }) => theme.colors.textLight};
      border: 1px solid ${({ theme }) => theme.colors.border};
      border-radius: 4px;
      
      &:hover {
        background: ${({ theme }) => theme.colors.background};
        color: ${({ theme }) => theme.colors.text};
      }
    }
    
    button.delete {
      color: ${({ theme }) => theme.colors.error || '#ef4444'};
      border-color: ${({ theme }) => theme.colors.error || '#ef4444'};
      
      &:hover {
        background: ${({ theme }) => theme.colors.error || '#ef4444'};
        color: white;
      }
    }
  }
`;

export const UpsellBanner = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, #1e3a8a);
  border-radius: 12px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    font-size: 1rem;
    line-height: 1.5;
    opacity: 0.9;
    max-width: 650px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }
  }

  button {
    margin-top: 0.5rem;
    background: white;
    color: ${({ theme }) => theme.colors.primary};
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
`;
