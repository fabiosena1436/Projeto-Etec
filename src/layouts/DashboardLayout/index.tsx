import { Outlet } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import * as S from './styles';

export function DashboardLayout() {
  return <S.LayoutContainer>
    <Header />
    <S.MainContent id="conteudo" tabIndex={-1}>
      <Outlet />
    </S.MainContent>
    <Footer />
  </S.LayoutContainer>;
}
