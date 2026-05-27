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

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

export const CompanyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  img {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    object-fit: cover;

    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
      width: 40px;
      height: 40px;
      border-radius: 6px;
    }
  }

  .placeholder {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.border};

    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
      width: 40px;
      height: 40px;
      border-radius: 6px;
    }
  }

  h3 {
    font-size: 1.125rem;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.25rem;

    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
      font-size: 1rem;
      margin-bottom: 0.125rem;
      line-height: 1.2;
    }
  }

  span {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textLight};

    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
      font-size: 0.75rem;
    }
  }
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
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

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 0.75rem;
    padding: 0.15rem 0.4rem;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

export const Description = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 0.875rem;
    line-height: 1.4;
  }
`;
