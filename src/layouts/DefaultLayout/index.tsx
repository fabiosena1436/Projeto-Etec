import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/Header';
import { useAuth } from '../../hooks/useAuth';
import * as S from './styles';

export function DefaultLayout() {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (isAuthenticated && location.pathname === '/') {
    return <Navigate to={role === 'candidato' ? '/candidato/painel' : '/empresa/painel'} replace />;
  }

  return (
    <S.LayoutContainer>
      <Header />
      
      <S.MainContent>
        <Outlet />
      </S.MainContent>
      
      <S.Footer>
        <S.FooterContent>
          <p>&copy; 2026 Conecta Teodoro Sampaio. Todos os direitos reservados.</p>
        </S.FooterContent>
      </S.Footer>
    </S.LayoutContainer>
  );
}
