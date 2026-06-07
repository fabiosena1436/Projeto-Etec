import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

export const Container = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

export const Header = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

export const LogoSkeleton = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.border};
`;

export const InfoSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const TitleSkeleton = styled.div`
  width: 60%;
  height: 20px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.border};
`;

export const CompanySkeleton = styled.div`
  width: 40%;
  height: 16px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.border};
`;

export const TagsSkeleton = styled.div`
  display: flex;
  gap: 8px;
`;

export const TagSkeleton = styled.div`
  width: 80px;
  height: 28px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.border};
`;

export const FooterSkeleton = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
`;

export const ButtonSkeleton = styled.div`
  width: 120px;
  height: 36px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.border};
`;
