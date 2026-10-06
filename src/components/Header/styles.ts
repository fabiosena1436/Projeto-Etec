import styled from 'styled-components';
export const HeaderContainer = styled.header`
  background: #ffffffed; backdrop-filter: blur(16px); border-bottom: 1px solid ${({ theme }) => theme.colors.border}; position: sticky; top: 0; z-index: 100;
`;
export const HeaderContent = styled.div`
  max-width: 1200px; margin: auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px;
  > a { min-width: 0; }
  @media(max-width: 900px) { padding: 14px 20px; }
  @media(max-width: 400px) { padding: 12px 16px; gap: 12px; }
`;
export const Logo = styled.div`
  display: flex; align-items: center; gap: 10px; color: ${({ theme }) => theme.colors.secondary}; font-size: 20px; font-weight: 600; line-height: 1.2; white-space: nowrap;
  strong { font-weight: 800; } small { display: block; font-size: 11px; font-weight: 500; color: ${({ theme }) => theme.colors.textLight}; margin-top: 4px; letter-spacing: .02em; }
`;
export const Nav = styled.nav<{ $open: boolean }>`
  display: flex; gap: 18px; align-items: center; font-size: 14px; font-weight: 600;
  > a { display:inline-flex;align-items:center;gap:7px;padding: 10px 0; color: ${({ theme }) => theme.colors.textLight}; }
  > a:hover, > a.active { color: ${({ theme }) => theme.colors.primary}; }
  @media(max-width: 1200px) {
    display: ${({ $open }) => $open ? 'flex' : 'none'}; position: absolute; top: 100%; left: 0; right: 0; background: white; padding: 20px; flex-direction: column; align-items: stretch; gap: 8px; border-bottom: 1px solid #dbe3eb; box-shadow: 0 16px 30px #102a4310;
    > a { padding: 12px; border-radius: 8px; } > a.active { background: #edf4ff; }
    max-height: calc(100dvh - 80px); overflow-y: auto; overscroll-behavior: contain;
  }
`;
export const ButtonGroup = styled.div`display:flex; gap: 10px; flex-shrink:0; @media(max-width:1200px) { margin-top: 8px; flex-wrap:wrap; > button { flex: 1 1 130px; } }`;
export const LoginButton = styled.button`
  display: inline-flex; justify-content: center; align-items: center; gap: 7px; border: 1px solid #dbe3eb; color: ${({ theme }) => theme.colors.secondary}; padding: 10px 17px; border-radius: 9px; font-size: 14px; font-weight: 650;
  &:hover { background: #f0f5fa; }
`;
export const RegisterButton = styled(LoginButton)`background: ${({ theme }) => theme.colors.primary}; color: white; border-color: transparent; &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }`;
export const MobileMenuButton = styled.button`display: none; align-items: center; justify-content: center; width:44px; flex-shrink:0; color:#102a43; border:1px solid #dbe3eb; border-radius:9px; @media(max-width:1200px){display:flex;}`;

export const AccountMenu = styled.div`position:relative;min-width:0;@media(max-width:1200px){width:100%;}`;
export const AccountToggle = styled(LoginButton)`@media(max-width:1200px){display:none;}`;
export const AccountLinks = styled.div<{ $open: boolean }>`
  display:${({$open})=>$open?'flex':'none'};flex-direction:column;gap:6px;position:absolute;right:0;top:calc(100% + 12px);width:250px;padding:14px;background:white;border:1px solid #dbe3eb;border-radius:12px;box-shadow:0 12px 30px #102a4318;
  .account-name{color:#526578;font-size:12px;padding:4px 8px 10px;overflow-wrap:anywhere;border-bottom:1px solid #dbe3eb;}
  a{display:flex;align-items:center;gap:8px;padding:12px 8px;min-height:44px;color:#526578;border-radius:8px;}
  a:hover,a.active{background:#edf4ff;color:#175cda;}button{justify-content:flex-start;}
  @media(max-width:1200px){display:flex;position:static;width:100%;padding:12px 0 0;border:none;border-top:1px solid #dbe3eb;border-radius:0;box-shadow:none;}
`;
