import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Menu } from 'lucide-react';
import * as S from './styles';

export function Header() {
  const navigate = useNavigate();

  return (
    <S.HeaderContainer>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <S.Logo>
          <Briefcase size={28} />
          Conecta Sampaio
        </S.Logo>
      </Link>

      <S.Nav>
        <Link to="/vagas">Vagas Locais</Link>
        <Link to="/empresas">Empresas</Link>

        <S.ButtonGroup>
          <S.LoginButton onClick={() => navigate('/login')}>Entrar</S.LoginButton>
          <S.RegisterButton onClick={() => navigate('/cadastro')}>Cadastrar</S.RegisterButton>
        </S.ButtonGroup>
      </S.Nav>

      <S.MobileMenuButton onClick={() => navigate('/login')}>
        <Menu size={28} />
      </S.MobileMenuButton>
    </S.HeaderContainer>
  );
}
