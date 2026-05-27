import styled from 'styled-components';

export const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh; /* Usa 100dvh para evitar barra de rolagem em celulares (safari/chrome mobile) */
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.surface} 100%);
  padding: 2rem;
`;

export const LoginCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 400px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Brand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};

  h1 {
    font-size: 1.5rem;
    font-weight: 800;
  }
`;

export const RoleButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const RoleButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;

  background-color: ${({ theme, $variant }) => $variant === 'secondary' ? 'transparent' : theme.colors.primary};
  color: ${({ theme, $variant }) => $variant === 'secondary' ? theme.colors.primary : theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.primary};

  &:hover {
    background-color: ${({ theme, $variant }) => $variant === 'secondary' ? theme.colors.primary + '10' : theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

export const BackLink = styled.button`
  margin-top: 2rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
