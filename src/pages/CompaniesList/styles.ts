import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

export const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textLight};
    font-size: 1.125rem;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

export const CompanyCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: ${({ theme }) => theme.colors.primary};
  }

  img, .placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 1rem;
    object-fit: cover;
    background-color: ${({ theme }) => theme.colors.background};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.textLight};
  }

  h3 {
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.25rem;
  }

  .industry {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 500;
    margin-bottom: 1rem;
  }

  p.desc {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textLight};
    margin-bottom: 1.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  button {
    margin-top: auto;
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
    transition: background-color 0.2s;

    &:hover {
      background-color: ${({ theme }) => theme.colors.border};
    }
  }
`;