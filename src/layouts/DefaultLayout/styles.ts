import styled from 'styled-components';

export const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const Footer = styled.footer`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.surface};
  margin-top: auto;
  width: 100%;
`;

export const FooterContent = styled.div`
  padding: 2rem;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;
