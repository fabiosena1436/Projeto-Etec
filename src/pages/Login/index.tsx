import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, User, Building, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as S from './styles';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as 'candidato' | 'empresa' | null;
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<'candidato' | 'empresa' | null>(initialType);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeType) return;
    
    setLoading(true);
    setTimeout(() => {
      login(activeType);
      navigate(`/${activeType}/painel`);
    }, 1500);
  };

  return (
    <S.LoginContainer>
      <S.LoginCard>
        <S.Brand>
          <Briefcase size={48} />
          <h1>Conecta Sampaio</h1>
        </S.Brand>

        {!activeType ? (
          <>
            <p style={{ marginBottom: '2rem', color: '#64748b' }}>
              Selecione o seu perfil para acessar a plataforma
            </p>

            <S.RoleButtonGroup>
              <S.RoleButton onClick={() => setActiveType('candidato')} disabled={loading}>
                <User size={24} />
                Entrar como Candidato
              </S.RoleButton>
              
              <S.RoleButton $variant="secondary" onClick={() => setActiveType('empresa')} disabled={loading}>
                <Building size={24} />
                Entrar como Empresa
              </S.RoleButton>
            </S.RoleButtonGroup>

            <S.BackLink onClick={() => navigate('/')} disabled={loading}>
              <ArrowLeft size={16} />
              Voltar para a página inicial
            </S.BackLink>
          </>
        ) : (
          <>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 600, color: '#334155' }}>
              {activeType === 'candidato' ? 'Acesso do Candidato' : 'Acesso da Empresa'}
            </p>
            
            <S.Form onSubmit={handleLogin}>
              <S.FormGroup>
                <label>E-mail</label>
                <input required type="email" placeholder="Digite seu e-mail" disabled={loading} />
              </S.FormGroup>
              <S.FormGroup>
                <label>Senha</label>
                <input required type="password" placeholder="Digite sua senha" disabled={loading} />
              </S.FormGroup>
              
              <S.SubmitButton type="submit" disabled={loading} style={activeType === 'empresa' ? { backgroundColor: '#0f172a' } : {}}>
                {loading ? 'Entrando...' : 'Entrar'}
              </S.SubmitButton>
            </S.Form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Ainda não tem uma conta? </span>
              <button 
                onClick={() => navigate(`/cadastro?type=${activeType}`)} 
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
          </>
        )}
      </S.LoginCard>
    </S.LoginContainer>
  );
}
