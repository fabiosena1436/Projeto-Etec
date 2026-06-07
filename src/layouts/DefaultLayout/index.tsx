import { Outlet } from 'react-router-dom';
import { Header } from '../../components/Header';
import * as S from './styles';

export function DefaultLayout() {
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
