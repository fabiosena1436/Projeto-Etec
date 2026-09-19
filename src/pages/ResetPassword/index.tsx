import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../services/supabase/auth.service';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import * as S from '../Login/styles';

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
    if (password.length < 6) return toast.error('A senha deve ter pelo menos 6 caracteres.');
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
              <label>Nova senha</label>
              <input required type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} disabled={loading} placeholder="Mínimo 6 caracteres" />
            </S.FormGroup>
            <S.FormGroup>
              <label>Confirmar nova senha</label>
              <input required type="password" minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} disabled={loading} placeholder="Repita a senha" />
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
