import styled, { keyframes } from 'styled-components';

const spin = keyframes`to { transform: rotate(360deg); }`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 50vh;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: ${spin} 0.8s linear infinite;
`;

export function PageLoader({ label = 'Carregando...' }: { label?: string }) {
  return (
    <Wrapper role="status" aria-live="polite">
      <Spinner />
      <span>{label}</span>
    </Wrapper>
  );
}
