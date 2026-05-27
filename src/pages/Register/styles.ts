import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Card = styled.div`
  background: white;
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

export const Brand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.primary};

  h1 {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const RoleButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const RoleButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
  
  background-color: ${({ theme, $variant }) => 
    $variant === 'secondary' ? theme.colors.secondary : theme.colors.primary};
  color: white;

  &:hover {
    background-color: ${({ theme, $variant }) => 
      $variant === 'secondary' ? theme.colors.secondaryHover : theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }

  input {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export const BackLink = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1.5rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.875rem;
  background: transparent;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
