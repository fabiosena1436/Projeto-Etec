import styled from 'styled-components';

export const CarouselSection = styled.section`
  padding: 3rem 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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
  overflow-x: auto;
  scroll-behavior: auto;
  display: flex;
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;

export const Track = styled.div`
  display: flex;
  gap: 2rem;
  width: max-content;
  padding: 0 1rem;
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
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.primary};
  }

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

export const PromoButton = styled.button`
  margin-top: auto;
  padding: 0.5rem 1rem;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

