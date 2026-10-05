import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { BrandMark } from '../BrandMark';
import { useAuth } from '../../hooks/useAuth';
import * as S from './styles';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);
  const panel = role === 'empresa' ? '/empresa/painel' : '/candidato/painel';
  async function handleLogout() {
    try { await logout(); setOpen(false); navigate('/'); }
    catch { toast.error('Não foi possível sair. Tente novamente.'); }
  }
  return <S.HeaderContainer>
    <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
    <S.HeaderContent>
      <Link to={isAuthenticated ? panel : '/'} aria-label="Conecta Sampaio — início">
        <S.Logo><BrandMark /><span>Conecta <strong>Sampaio</strong><small>Oportunidades perto de você</small></span></S.Logo>
      </Link>
      <S.Nav id="menu-principal" $open={open} aria-label="Navegação principal" onKeyDown={e => { if(e.key === 'Escape') setOpen(false); }}>
        <NavLink to="/vagas">Encontrar vagas</NavLink>
        <NavLink to="/empresas">Empresas</NavLink>
        <NavLink to="/parcerias">Seja patrocinador</NavLink>
        <NavLink to="/ajuda">Como funciona</NavLink>
        <S.ButtonGroup>
          {isAuthenticated ? <>
            {isAdmin&&<S.LoginButton onClick={()=>navigate('/admin/painel')}>Administração</S.LoginButton>}
            <S.LoginButton onClick={() => navigate(panel)}><LayoutDashboard size={17} /> Meu painel</S.LoginButton>
            <S.LoginButton onClick={handleLogout}><LogOut size={17} /> Sair</S.LoginButton>
          </> : <>
            <S.LoginButton onClick={() => navigate('/login')}>Entrar</S.LoginButton>
            <S.RegisterButton onClick={() => navigate('/cadastro')}>Criar conta <ArrowUpRight size={17} /></S.RegisterButton>
          </>}
        </S.ButtonGroup>
      </S.Nav>
      <S.MobileMenuButton aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-controls="menu-principal" aria-expanded={open} onClick={() => setOpen(v => !v)} onKeyDown={e => { if(e.key === 'Escape') setOpen(false); }}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </S.MobileMenuButton>
    </S.HeaderContent>
  </S.HeaderContainer>;
}
