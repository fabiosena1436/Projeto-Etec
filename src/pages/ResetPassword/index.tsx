import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../services/supabase/auth.service';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import * as S from '../Login/styles';
import { PasswordRequirements } from '../../components/PasswordRequirements';
import { isStrongPassword, PASSWORD_MIN_LENGTH, PASSWORD_POLICY_MESSAGE } from '../../utils/passwordPolicy';

/**
 * Página aberta pelo link do e-mail "Esqueci minha senha".
 * O Supabase cria uma sessão de recuperação; aqui só trocamos a senha.
 */
export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrongPassword(password)) return toast.error(PASSWORD_POLICY_MESSAGE);
    if (password !== confirm) return toast.error('As senhas não coincidem.');
    setLoading(true);
    try {
      await authService.updatePassword(password);
      toast.success('Senha redefinida com sucesso!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.LoginContainer>
      <S.LoginCard>
        <S.Brand>
          <KeyRound size={48} />
          <h1>Nova senha</h1>
        </S.Brand>

        {!ready ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            Link inválido ou expirado. Solicite uma nova redefinição de senha na tela de login.
          </p>
        ) : (
          <S.Form onSubmit={handleSubmit}>
            <S.FormGroup>
              <label htmlFor="field-1">Nova senha</label>
              <input id="field-1" required type="password" minLength={PASSWORD_MIN_LENGTH} value={password} onChange={e => setPassword(e.target.value)} disabled={loading} placeholder="Pelo menos 8 caracteres" autoComplete="new-password" aria-describedby="password-rules" />
              <PasswordRequirements id="password-rules" password={password} />
            </S.FormGroup>
            <S.FormGroup>
              <label htmlFor="field-2">Confirmar nova senha</label>
              <input id="field-2" required type="password" minLength={PASSWORD_MIN_LENGTH} value={confirm} onChange={e => setConfirm(e.target.value)} disabled={loading} placeholder="Repita a senha" autoComplete="new-password" />
            </S.FormGroup>
            <S.SubmitButton type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar nova senha'}</S.SubmitButton>
          </S.Form>
        )}

        <S.BackLink onClick={() => navigate('/login')} disabled={loading}>
          <ArrowLeft size={16} />
          Voltar para o login
        </S.BackLink>
      </S.LoginCard>
    </S.LoginContainer>
  );
}
