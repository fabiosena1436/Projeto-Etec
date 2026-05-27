import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Home, Search, Bookmark, User as UserIcon } from 'lucide-react';
import { usersMock } from '../../data/users';
import * as S from './styles';

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = usersMock[0]; // Usuário mockado simulando estar logado

  // Função auxiliar para verificar rota ativa
  const isActive = (path: string) => location.pathname === path;

  return (
    <S.LayoutContainer>
      <S.TopBar>
        <S.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Briefcase size={24} />
          <span>Conecta Sampaio</span>
        </S.Brand>

        <S.ProfileMenu onClick={() => navigate(`/candidato/${currentUser.id}`)}>
          <span>{currentUser.name}</span>
          <div className="avatar">
            {currentUser.name.charAt(0)}
          </div>
        </S.ProfileMenu>
      </S.TopBar>

      <S.MainContent>
        <Outlet />
      </S.MainContent>

      <S.BottomNav>
        <S.NavItem 
          $active={isActive('/candidato/painel')} 
          onClick={() => navigate('/candidato/painel')}
        >
          <Home size={24} />
          <span>Início</span>
        </S.NavItem>
        
        <S.NavItem 
          $active={isActive('/vagas')} 
          onClick={() => navigate('/vagas')}
        >
          <Search size={24} />
          <span>Vagas</span>
        </S.NavItem>

        <S.NavItem 
          $active={isActive('/candidato/salvas')} 
          onClick={() => navigate('/candidato/salvas')} // Rota mockada futura
        >
          <Bookmark size={24} />
          <span>Salvas</span>
        </S.NavItem>

        <S.NavItem 
          $active={isActive(`/candidato/${currentUser.id}`)} 
          onClick={() => navigate(`/candidato/${currentUser.id}`)}
        >
          <UserIcon size={24} />
          <span>Perfil</span>
        </S.NavItem>
      </S.BottomNav>
    </S.LayoutContainer>
  );
}
