import styled, { keyframes } from 'styled-components';

const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

export const CarouselSection = styled.section`
  padding: 3rem 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  width: 100%;
  position: relative;
`;

export const Title = styled.h2`
  text-align: center;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2rem;
  font-weight: 700;
`;

export const TrackContainer = styled.div`
  width: 100%;
  overflow: hidden;
  display: flex;
`;

export const Track = styled.div`
  display: flex;
  gap: 2rem;
  width: max-content;
  animation: ${scroll} 25s linear infinite;

  &:hover {
    animation-play-state: paused;
  }
`;

export const SponsorCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 300px;
  text-align: center;

  img {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
  }

  h4 {
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.125rem;
    font-weight: 600;
  }

  p {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.875rem;
    font-weight: 500;
    font-style: italic;
  }
`;
