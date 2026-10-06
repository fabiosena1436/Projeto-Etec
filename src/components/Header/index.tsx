import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ArrowUpRight, UserRound, Bookmark, PlusCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { BrandMark } from '../BrandMark';
import { useAuth } from '../../hooks/useAuth';
import * as S from './styles';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, logout, isAdmin, isEmpresa, isCandidato, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenu = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); setAccountOpen(false); }, [location.pathname, location.search]);
  useEffect(() => {
    if (!accountOpen && !open) return;
    function closeOutside(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;
      if (!accountMenu.current?.contains(event.target)) setAccountOpen(false);
      if (!header.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [accountOpen, open]);
  const panel = isAdmin ? '/admin/painel' : role === 'empresa' ? '/empresa/painel' : '/candidato/painel';
  async function handleLogout() {
    try { await logout(); setOpen(false); setAccountOpen(false); navigate('/'); }
    catch { toast.error('Não foi possível sair. Tente novamente.'); }
  }
  return <S.HeaderContainer ref={header}>
    <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
    <S.HeaderContent>
      <Link to="/" aria-label="Conecta Sampaio — início">
        <S.Logo><BrandMark /><span>Conecta <strong>Sampaio</strong><small>Oportunidades perto de você</small></span></S.Logo>
      </Link>
      <S.Nav id="menu-principal" $open={open} aria-label="Navegação principal" onClick={e => {
        if (e.target instanceof Element && e.target.closest('a')) { setOpen(false); setAccountOpen(false); }
      }} onKeyDown={e => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          if (accountOpen) { setAccountOpen(false); accountButton.current?.focus(); }
          else { setOpen(false); menuButton.current?.focus(); }
        }
      }}>
        <NavLink to="/comunidade">Comunidade</NavLink>
        <NavLink to="/vagas">Encontrar vagas</NavLink>
        <NavLink to="/empresas">Empresas</NavLink>
        {isEmpresa && <NavLink to="/parcerias">Seja patrocinador</NavLink>}
        {isAuthenticated && <NavLink to={panel}><LayoutDashboard size={17} /> {isAdmin ? 'Administração' : 'Meu painel'}</NavLink>}
        <S.ButtonGroup>
          {isAuthenticated ? <S.AccountMenu ref={accountMenu}>
            <S.AccountToggle ref={accountButton} aria-expanded={accountOpen} aria-controls="menu-conta" onClick={() => setAccountOpen(value => !value)}>
              <UserRound size={17} /> Minha conta <ChevronDown size={15} />
            </S.AccountToggle>
            <S.AccountLinks id="menu-conta" $open={accountOpen}>
              <span className="account-name">{profile?.full_name || 'Minha conta'}</span>
              {isCandidato && profile?.id && <>
                <NavLink to={`/candidato/${profile.id}`}><UserRound size={17} /> Meu perfil</NavLink>
                <NavLink to="/candidato/salvas"><Bookmark size={17} /> Vagas salvas</NavLink>
              </>}
              {isEmpresa && <NavLink to="/empresa/vaga/nova"><PlusCircle size={17} /> Publicar vaga</NavLink>}
              <S.LoginButton onClick={handleLogout}><LogOut size={17} /> Sair da conta</S.LoginButton>
            </S.AccountLinks>
          </S.AccountMenu> : <>
            <S.LoginButton onClick={() => navigate('/login')}>Entrar</S.LoginButton>
            <S.RegisterButton onClick={() => navigate('/cadastro')}>Criar conta <ArrowUpRight size={17} /></S.RegisterButton>
          </>}
        </S.ButtonGroup>
      </S.Nav>
      <S.MobileMenuButton ref={menuButton} aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-controls="menu-principal" aria-expanded={open} onClick={() => { setOpen(v => !v); setAccountOpen(false); }} onKeyDown={e => { if(e.key === 'Escape') setOpen(false); }}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </S.MobileMenuButton>
    </S.HeaderContent>
  </S.HeaderContainer>;
}
