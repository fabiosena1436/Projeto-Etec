import styled from 'styled-components';

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  padding-bottom: 6rem; /* para a bottom nav mobile */
`;

export const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.colors.border};

  svg {
    color: ${({ theme }) => theme.colors.textLight};
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.textLight};
    max-width: 400px;
    margin-bottom: 1.5rem;
  }

  button {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;

    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`;