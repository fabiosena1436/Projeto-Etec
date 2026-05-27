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
  
  @media (max-width: 600px) {
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

export const JobCard = styled.div`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .job-info {
    h4 {
      font-size: 1rem;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 0.25rem;
    }

    .type {
      font-size: 0.75rem;
      background: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.textLight};
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
    }
  }

  .job-stats {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;

    span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.textLight};
    }
  }
`;
