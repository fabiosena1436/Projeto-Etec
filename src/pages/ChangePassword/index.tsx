import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/supabase/auth.service';
import { PasswordRequirements } from '../../components/PasswordRequirements';
import { PASSWORD_MIN_LENGTH, isStrongPassword, PASSWORD_POLICY_MESSAGE } from '../../utils/passwordPolicy';
import * as S from '../Login/styles';

const Container = styled.section`
  padding:40px 20px; display:flex; justify-content:center; background:#f5f7fa; min-height:65vh;
  .help { color:#526578; font-size:14px; line-height:1.6; margin:0 0 24px; }
  .visibility { display:flex; align-items:center; gap:10px; font-size:14px; min-height:44px; cursor:pointer; }
  .visibility input { width:18px; height:18px; }
  .success { padding:14px; background:#e8f3ee; color:#0c6d5d; border-radius:9px; margin:0 0 20px; }
  .error { color:#b42318; padding:12px; background:#fff1f0; border-radius:9px; }
  .links { display:flex; flex-wrap:wrap; justify-content:space-between; gap:16px; margin-top:24px; font-size:14px; }
  a { color:#165bb4; } :focus-visible { outline:3px solid #76abe9; outline-offset:3px; }
  @media(max-width:500px) { padding:24px 16px; }
`;

export function ChangePassword() {
  const { user, isMock, isAdmin, isEmpresa } = useAuth();
  const [current,setCurrent]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
  const [visible,setVisible]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(false);
  const panel=isAdmin?'/admin/painel':isEmpresa?'/empresa/painel':'/candidato/painel';
  async function submit(event:React.FormEvent) {
    event.preventDefault();
    if(saving||isMock||!user)return;
    setError(''); setSuccess(false);
    if(!isStrongPassword(password)){setError(PASSWORD_POLICY_MESSAGE);return;}
    if(password!==confirm){setError('As senhas não coincidem.');return;}
    setSaving(true);
    try {
      await authService.changePassword(current,password,user.id);
      setCurrent('');setPassword('');setConfirm('');setVisible(false);setSuccess(true);
      toast.success('Senha alterada com sucesso!');
    } catch(err) { setError(err instanceof Error?err.message:'Não foi possível alterar a senha. Tente novamente.'); }
    finally { setSaving(false); }
  }
  const type=visible?'text':'password';
  return <Container><S.LoginCard>
    <S.Brand><KeyRound size={36}/><h1>Alterar senha</h1></S.Brand>
    <p className="help">Confirme sua senha atual e escolha uma nova para sua conta no Conecta Jovens.</p>
    {isMock?<p role="status" className="help">A conta de demonstração não possui senha real para alterar.</p>:<>
      {success&&<p role="status" className="success">Senha alterada. Use a nova senha no próximo acesso.</p>}
      <S.Form onSubmit={submit}>
        <S.FormGroup><label htmlFor="current-password">Senha atual</label><input id="current-password" type={type} required autoComplete="current-password" value={current} onChange={e=>setCurrent(e.target.value)} disabled={saving}/></S.FormGroup>
        <S.FormGroup><label htmlFor="new-password">Nova senha</label><input id="new-password" type={type} required minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" aria-describedby="change-password-rules" value={password} onChange={e=>setPassword(e.target.value)} disabled={saving}/><PasswordRequirements id="change-password-rules" password={password}/></S.FormGroup>
        <S.FormGroup><label htmlFor="confirm-password">Confirmar nova senha</label><input id="confirm-password" type={type} required minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} disabled={saving}/></S.FormGroup>
        <label className="visibility"><input type="checkbox" checked={visible} onChange={e=>setVisible(e.target.checked)} disabled={saving}/> Mostrar senhas</label>
        {error&&<p role="alert" className="error">{error}</p>}
        <S.SubmitButton disabled={saving} type="submit">{saving?'Salvando...':'Salvar nova senha'}</S.SubmitButton>
      </S.Form>
    </>}
    <div className="links"><Link to={panel}>Voltar ao meu painel</Link><Link to="/login?recuperar=1">Esqueci minha senha atual</Link></div>
  </S.LoginCard></Container>;
}
