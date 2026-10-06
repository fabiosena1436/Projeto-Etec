import styled from 'styled-components';

export const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const TopBar = styled.header`
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
`;

export const TopBarContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  gap: 1rem;
  > div { min-width: 0; }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 0.75rem 1rem;
  }
`;

export const Brand = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.25rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 1.125rem;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

export const ProfileMenu = styled.button`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;

  span {
    max-width: min(28vw, 260px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
      display: none;
    }
  }

  div.avatar {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.primary}20;
    color: ${({ theme }) => theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    
    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
      width: 32px;
      height: 32px;
      font-size: 0.875rem;
    }
  }
`;

export const MainContent = styled.main`
  min-width: 0;
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 0.75rem;
    padding-bottom: calc(95px + env(safe-area-inset-bottom)); /* Adjusted for smaller nav */
  }
`;

export const BottomNav = styled.nav`
  display: flex;
  justify-content: center;
  gap: 2rem;
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: flex;
    gap: 0;
    justify-content: space-around;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    padding: 0.5rem 0.5rem;
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
    z-index: 100;
  }
`;

export const NavItem = styled.button<{ $active?: boolean }>`
  min-width: 0;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textLight};
  font-size: 0.75rem;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;

  svg {
    transition: transform 0.2s;
    transform: ${({ $active }) => $active ? 'scale(1.1)' : 'scale(1)'};
    width: 22px;
    height: 22px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 0.75rem;
  }
`;
