import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useAuth } from '../../hooks/useAuth';
import * as S from './styles';

export function DefaultLayout() {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (!loading && isAuthenticated && location.pathname === '/') {
    return <Navigate to={role === 'candidato' ? '/candidato/painel' : '/empresa/painel'} replace />;
  }

  return (
    <S.LayoutContainer>
      <Header />
      
      <S.MainContent id="conteudo" tabIndex={-1}>
        <Outlet />
      </S.MainContent>
      
      <Footer />
    </S.LayoutContainer>
  );
}
