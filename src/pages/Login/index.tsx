import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, Building, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as S from './styles';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLoginCandidato = () => {
    setLoading(true);
    setTimeout(() => {
      login('candidato');
      navigate('/dashboard/candidato');
    }, 1500);
  };

  const handleLoginEmpresa = () => {
    setLoading(true);
    setTimeout(() => {
      login('empresa');
      navigate('/dashboard/empresa');
    }, 1500);
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
          <S.RoleButton onClick={handleLoginCandidato} disabled={loading}>
            <User size={24} />
            {loading ? 'Entrando...' : 'Entrar como Candidato'}
          </S.RoleButton>
          
          <S.RoleButton $variant="secondary" onClick={handleLoginEmpresa} disabled={loading}>
            <Building size={24} />
            {loading ? 'Entrando...' : 'Entrar como Empresa'}
          </S.RoleButton>
        </S.RoleButtonGroup>

        <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Ainda não tem uma conta? </span>
          <button 
            onClick={() => navigate('/cadastro')} 
            disabled={loading}
            style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.875rem', padding: '0.25rem', background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            Cadastre-se
          </button>
        </div>

        <S.BackLink onClick={() => navigate('/')} disabled={loading}>
          <ArrowLeft size={16} />
          Voltar para a página inicial
        </S.BackLink>
      </S.LoginCard>
    </S.LoginContainer>
  );
}
