import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Home, Search, Bookmark, User as UserIcon, Building, PlusCircle } from 'lucide-react';
import { usersMock } from '../../data/users';
import { companiesMock } from '../../data/companies';
import * as S from './styles';

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detecção de tipo de usuário com base na rota (para apresentação visual)
  const isCompanyFlow = location.pathname.includes('/empresa');

  // Mocks de dados
  const currentUser = usersMock[0];
  const currentCompany = companiesMock.find(c => c.id === 'comp-2')!; // Empresa mockada do painel

  const isActive = (path: string) => location.pathname === path;

  return (
    <S.LayoutContainer>
      <S.TopBar>
        <S.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Briefcase size={24} />
          <span>Conecta jovens</span>
        </S.Brand>

        {isCompanyFlow ? (
          <S.ProfileMenu onClick={() => navigate('/empresa/painel')}>
            <span>{currentCompany.name}</span>
            <div className="avatar" style={{ backgroundColor: '#0f172a' }}>
              <Building size={16} color="white" />
            </div>
          </S.ProfileMenu>
        ) : (
          <S.ProfileMenu onClick={() => navigate(`/candidato/${currentUser.id}`)}>
            <span>{currentUser.name}</span>
            <div className="avatar">
              {currentUser.name.charAt(0)}
            </div>
          </S.ProfileMenu>
        )}
      </S.TopBar>

      <S.MainContent>
        <Outlet />
      </S.MainContent>

      <S.BottomNav>
        {isCompanyFlow ? (
          // Menu Inferior da Empresa
          <>
            <S.NavItem 
              $active={isActive('/empresa/painel')} 
              onClick={() => navigate('/empresa/painel')}
            >
              <Building size={24} />
              <span>Painel</span>
            </S.NavItem>
            
            <S.NavItem 
              $active={isActive('/empresa/vaga/nova')} 
              onClick={() => navigate('/empresa/vaga/nova')}
            >
              <PlusCircle size={24} />
              <span>Nova Vaga</span>
            </S.NavItem>
          </>
        ) : (
          // Menu Inferior do Candidato
          <>
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
              onClick={() => navigate('/candidato/salvas')}
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
          </>
        )}
      </S.BottomNav>
    </S.LayoutContainer>
  );
}
