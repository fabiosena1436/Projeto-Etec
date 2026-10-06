import styled from 'styled-components';

export const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const MainContent = styled.main`
  flex: 1;
  min-width: 0;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 1rem 0.75rem 2rem;
  }
`;
