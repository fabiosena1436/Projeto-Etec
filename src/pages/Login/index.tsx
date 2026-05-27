import { useNavigate } from 'react-router-dom';
import { Briefcase, User, Building, ArrowLeft } from 'lucide-react';
import * as S from './styles';

export function Login() {
  const navigate = useNavigate();

  const handleLoginCandidato = () => {
    // Redireciona para o painel do candidato mockado (Fase 2)
    navigate('/candidato/painel');
  };

  const handleLoginEmpresa = () => {
    // Redireciona para o painel da empresa mockado (Fase 3)
    navigate('/empresa/painel');
  };

  return (
    <S.LoginContainer>
      <S.LoginCard>
        <S.Brand>
          <Briefcase size={48} />
          <h1>Conecta Sampaio</h1>
        </S.Brand>

        <p style={{ marginBottom: '2rem', color: '#64748b' }}>
          Selecione o seu perfil para acessar a plataforma (Modo Demonstração)
        </p>

        <S.RoleButtonGroup>
          <S.RoleButton onClick={handleLoginCandidato}>
            <User size={24} />
            Entrar como Candidato
          </S.RoleButton>
          
          <S.RoleButton $variant="secondary" onClick={handleLoginEmpresa}>
            <Building size={24} />
            Entrar como Empresa
          </S.RoleButton>
        </S.RoleButtonGroup>

        <S.BackLink onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          Voltar para a página inicial
        </S.BackLink>
      </S.LoginCard>
    </S.LoginContainer>
  );
}
