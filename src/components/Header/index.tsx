import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as S from './styles';

export function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePainel = () => {
    if (role === 'candidato') navigate('/candidato/painel');
    else if (role === 'empresa') navigate('/empresa/painel');
  };

  return (
    <S.HeaderContainer>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <S.Logo>
          <Briefcase size={28} />
          Conecta jovens
        </S.Logo>
      </Link>

      <S.Nav>
        <Link to="/vagas">Vagas Locais</Link>
        <Link to="/empresas">Empresas</Link>

        {isAuthenticated ? (
          <S.ButtonGroup>
            <S.LoginButton onClick={handlePainel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={18} />
              Meu Painel
            </S.LoginButton>
            <S.RegisterButton onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444' }}>
              <LogOut size={18} />
              Sair
            </S.RegisterButton>
          </S.ButtonGroup>
        ) : (
          <S.ButtonGroup>
            <S.LoginButton onClick={() => navigate('/login')}>Entrar</S.LoginButton>
            <S.RegisterButton onClick={() => navigate('/cadastro')}>Cadastrar</S.RegisterButton>
          </S.ButtonGroup>
        )}
      </S.Nav>

      <S.MobileMenuButton onClick={isAuthenticated ? handlePainel : () => navigate('/login')}>
        <Menu size={28} />
      </S.MobileMenuButton>
    </S.HeaderContainer>
  );
}
