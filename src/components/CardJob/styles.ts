import styled from 'styled-components';

export const CardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 8px 16px rgba(0,0,0,0.05);
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

export const CompanyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  img {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    object-fit: cover;
  }

  .placeholder {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.border};
  }

  h3 {
    font-size: 1.125rem;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.25rem;
  }

  span {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

export const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textLight};
  background-color: ${({ theme }) => theme.colors.background};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

export const Description = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
`;
