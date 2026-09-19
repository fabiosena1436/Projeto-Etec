import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, User, Building, ArrowLeft, Eye, EyeOff, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/supabase/auth.service';
import { isSupabaseConfigured } from '../../lib/supabase';
import * as S from './styles';

type RoleType = 'candidato' | 'empresa';

const linkBtn: React.CSSProperties = {
  color: '#2563eb', fontWeight: 600, fontSize: '0.875rem', padding: '0.25rem',
  background: 'none', border: 'none', cursor: 'pointer',
};

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as RoleType | null;
  const { login, isAuthenticated, role, loading: authLoading, isMock } = useAuth();

  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<RoleType | null>(initialType);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  const from = (location.state as any)?.from as string | undefined;

  // Já logado → vai para o painel
  useEffect(() => {
    if (!authLoading && isAuthenticated && role) {
      navigate(from || (role === 'empresa' ? '/empresa/painel' : '/candidato/painel'), { replace: true });
    }
  }, [authLoading, isAuthenticated, role, navigate, from]);

  // Retorno do link de confirmação de e-mail
  useEffect(() => {
    if (searchParams.get('confirmed') === '1') {
      toast.success('E-mail confirmado! Agora é só entrar.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeType) return;
    setLoading(true);
    setUnconfirmedEmail(null);
    try {
      if (isMock) {
        await new Promise(r => setTimeout(r, 500));
        login(activeType);
        toast.success(`Entrando como ${activeType} (modo demonstração)`);
        navigate(`/${activeType}/painel`, { replace: true });
        return;
      }

      const result = await authService.signIn({ email: email.trim(), password });
      const realRole = result.profile?.role || activeType;

      if (realRole !== activeType && realRole !== 'admin') {
        toast.info(`Sua conta é de ${realRole}. Redirecionando para o painel correto.`);
      }
      toast.success(`Bem-vindo(a), ${result.profile?.full_name?.split(' ')[0] || ''}!`);
      const target = realRole === 'empresa' ? '/empresa/painel' : '/candidato/painel';
      navigate(from && from.startsWith(`/${realRole}`) ? from : target, { replace: true });
    } catch (err: any) {
      const msg: string = err?.message || 'Erro ao fazer login';
      if (msg.toLowerCase().includes('confirme seu e-mail')) setUnconfirmedEmail(email.trim());
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMock) return toast.info('Recuperação de senha disponível apenas com o banco conectado.');
    setLoading(true);
    try {
      await authService.resetPassword(email.trim());
      toast.success('Enviamos um link de redefinição para o seu e-mail.', { description: 'Verifique também a caixa de spam.' });
      setMode('login');
    } catch (err: any) {
      toast.error(err.message || 'Não foi possível enviar o e-mail.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unconfirmedEmail) return;
    setLoading(true);
    try {
      await authService.resendConfirmation(unconfirmedEmail);
      toast.success('E-mail de confirmação reenviado!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.LoginContainer>
      <S.LoginCard>
        <S.Brand>
          <Briefcase size={48} />
          <h1>Conecta Sampaio</h1>
        </S.Brand>

        {!isSupabaseConfigured && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', color: '#92400e', marginBottom: '1rem', textAlign: 'center' }}>
            ⚠️ Modo demonstração (sem banco). Qualquer e-mail/senha entra.
          </div>
        )}

        {!activeType ? (
          <>
            <p style={{ marginBottom: '2rem', color: '#64748b', textAlign: 'center' }}>
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
        ) : mode === 'forgot' ? (
          <>
            <p style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>Recuperar senha</p>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
              Informe seu e-mail e enviaremos um link para criar uma nova senha.
            </p>
            <S.Form onSubmit={handleForgot}>
              <S.FormGroup>
                <label>E-mail</label>
                <input required type="email" autoComplete="email" placeholder="seu@email.com" disabled={loading} value={email} onChange={e => setEmail(e.target.value)} />
              </S.FormGroup>
              <S.SubmitButton type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar link'}</S.SubmitButton>
            </S.Form>
            <S.BackLink onClick={() => setMode('login')} disabled={loading}>
              <ArrowLeft size={16} />
              Voltar para o login
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
                <input required type="email" autoComplete="email" placeholder="Digite seu e-mail" disabled={loading} value={email} onChange={e => setEmail(e.target.value)} />
              </S.FormGroup>
              <S.FormGroup>
                <label>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    disabled={loading}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </S.FormGroup>

              <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                <button type="button" onClick={() => setMode('forgot')} disabled={loading} style={{ ...linkBtn, fontSize: '0.8rem' }}>
                  Esqueci minha senha
                </button>
              </div>

              {unconfirmedEmail && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: '#1e40af', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <MailCheck size={18} style={{ flexShrink: 0 }} />
                  <div>
                    Seu e-mail ainda não foi confirmado.{' '}
                    <button type="button" onClick={handleResend} disabled={loading} style={{ ...linkBtn, padding: 0, fontSize: '0.8rem' }}>Reenviar confirmação</button>
                  </div>
                </div>
              )}

              <S.SubmitButton type="submit" disabled={loading} style={activeType === 'empresa' ? { backgroundColor: '#0f172a' } : {}}>
                {loading ? 'Entrando...' : 'Entrar'}
              </S.SubmitButton>
            </S.Form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Ainda não tem uma conta? </span>
              <button onClick={() => navigate(`/cadastro?type=${activeType}`)} disabled={loading} style={linkBtn}>
                Cadastre-se
              </button>
            </div>

            <S.BackLink onClick={() => { setActiveType(null); setUnconfirmedEmail(null); }} disabled={loading}>
              <ArrowLeft size={16} />
              Voltar para seleção de perfil
            </S.BackLink>
          </>
        )}
      </S.LoginCard>
    </S.LoginContainer>
  );
}
