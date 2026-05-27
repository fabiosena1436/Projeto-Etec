import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  width: 100%;
`;

export const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.25rem;
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.125rem;
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

export const SearchContainer = styled.div`
  margin-bottom: 3rem;
`;

export const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  gap: 0.75rem;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text};

    &::placeholder {
      color: ${({ theme }) => theme.colors.textLight};
    }
  }
`;

export const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

export const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  
  p {
    color: ${({ theme }) => theme.colors.textLight};
    font-size: 1.125rem;
  }
`;
