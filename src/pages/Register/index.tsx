import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, User, Building, ArrowLeft, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../services/supabase/auth.service';
import { isSupabaseConfigured } from '../../lib/supabase';
import * as S from './styles';

type Step = 'select' | 'candidato' | 'empresa';

export const INDUSTRIES = [
  'Varejo', 'Supermercado', 'Alimentação', 'Saúde', 'Farmácia', 'Educação', 'Tecnologia da Informação',
  'Agronegócio', 'Indústria', 'Construção Civil', 'Serviços', 'Beleza e Estética', 'Transporte e Logística',
  'Hotelaria e Turismo', 'Setor Público', 'Outro',
];

export function Register() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as Step | null;
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(initialType || 'select');
  const [loading, setLoading] = useState(false);

  const [emailSent, setEmailSent] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get('fullName') as string || '').trim();
    const email = (formData.get('email') as string || '').trim().toLowerCase();
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const companyName = (formData.get('companyName') as string || '').trim();
    const cnpj = formData.get('cnpj') as string;
    const industry = formData.get('industry') as string;
    const location = (formData.get('location') as string || '').trim();

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }
    if (password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    const role = step === 'empresa' ? 'empresa' : 'candidato';
    const nameToUse = role === 'empresa' ? companyName : fullName;
    if (nameToUse.length < 3) {
      toast.error('Informe um nome com pelo menos 3 caracteres.');
      return;
    }
    const digitsPhone = (phone || '').replace(/\D/g, '');
    if (digitsPhone.length < 10 || digitsPhone.length > 13) {
      toast.error('Informe um WhatsApp válido com DDD (ex: 18 99999-9999).');
      return;
    }
    if (cnpj && cnpj.replace(/\D/g, '').length !== 14) {
      toast.error('CNPJ inválido. Informe os 14 dígitos ou deixe em branco.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const result = await authService.signUp({
          email,
          password,
          full_name: nameToUse,
          role,
          city: 'Teodoro Sampaio, SP',
          phone,
          company: role === 'empresa' ? { name: companyName, cnpj, industry, location: location || 'Teodoro Sampaio, SP' } : undefined,
        });

        if (result.needsEmailConfirmation) {
          setEmailSent(email);
          toast.success('Cadastro realizado! Confirme seu e-mail para ativar a conta.');
        } else {
          toast.success('Conta criada com sucesso!');
          navigate(`/${role}/painel`, { replace: true });
        }
      } else {
        await new Promise(r => setTimeout(r, 800));
        toast.success('Cadastro realizado com sucesso! (modo demonstração)', {
          description: 'Sua conta foi criada. Faça login para continuar.',
        });
        navigate(`/login?type=${step}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <S.Container>
        <S.Card>
          <S.Brand>
            <MailCheck size={48} />
            <h1>Confirme seu e-mail</h1>
          </S.Brand>
          <p style={{ textAlign: 'center', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Enviamos um link de confirmação para <strong>{emailSent}</strong>.<br />
            Abra o e-mail e clique no link para ativar sua conta. Depois é só fazer login.
          </p>
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            Não recebeu? Verifique a caixa de spam ou{' '}
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try { await authService.resendConfirmation(emailSent); toast.success('E-mail reenviado!'); }
                catch (e: any) { toast.error(e.message); }
                finally { setLoading(false); }
              }}
              style={{ color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              reenvie o e-mail
            </button>.
          </p>
          <S.SubmitButton type="button" onClick={() => navigate(`/login?type=${step}`)}>Ir para o login</S.SubmitButton>
        </S.Card>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Card>
        <S.Brand>
          <Briefcase size={48} />
          <h1>Criar Nova Conta</h1>
        </S.Brand>

        {!isSupabaseConfigured && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', color: '#92400e', marginBottom: '1rem', textAlign: 'center' }}>
            ⚠️ Modo demonstração. Com Supabase configurado, cadastro cria usuário real.
          </div>
        )}

        {step === 'select' && (
          <>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#64748b' }}>
              Como você deseja usar o Conecta Sampaio?
            </p>
            <S.RoleButtonGroup>
              <S.RoleButton onClick={() => setStep('candidato')}>
                <User size={24} />
                Sou um Candidato
              </S.RoleButton>
              
              <S.RoleButton $variant="secondary" onClick={() => setStep('empresa')}>
                <Building size={24} />
                Sou uma Empresa / Loja
              </S.RoleButton>
            </S.RoleButtonGroup>

            <S.BackLink onClick={() => navigate('/')}>
              <ArrowLeft size={16} />
              Voltar para o início
            </S.BackLink>
          </>
        )}

        {step === 'candidato' && (
          <S.Form onSubmit={handleRegister}>
            <p style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 500 }}>Cadastro de Candidato</p>
            <S.FormGroup>
              <label>Nome Completo</label>
              <input required name="fullName" type="text" placeholder="Ex: João da Silva" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>E-mail</label>
              <input required name="email" type="email" placeholder="Ex: joao@email.com" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>WhatsApp (com DDD)</label>
              <input required name="phone" type="tel" placeholder="Ex: (18) 99999-9999" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>Senha</label>
              <input required name="password" type="password" placeholder="Crie uma senha forte (min 6)" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>Confirmar Senha</label>
              <input required name="confirmPassword" type="password" placeholder="Digite a senha novamente" disabled={loading} />
            </S.FormGroup>
            
            <S.SubmitButton type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Concluir Cadastro'}
            </S.SubmitButton>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Já tem uma conta? </span>
              <button 
                type="button"
                onClick={() => navigate('/login?type=candidato')} 
                disabled={loading}
                style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.875rem', padding: '0.25rem', background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                Faça login
              </button>
            </div>

            <S.BackLink type="button" onClick={() => initialType ? navigate('/') : setStep('select')}>
              <ArrowLeft size={16} />
              {initialType ? 'Voltar para o início' : 'Voltar para seleção'}
            </S.BackLink>
          </S.Form>
        )}

        {step === 'empresa' && (
          <S.Form onSubmit={handleRegister}>
            <p style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 500 }}>Cadastro de Empresa / Loja</p>
            <S.FormGroup>
              <label>Nome da Empresa (Razão Social ou Fantasia)</label>
              <input required name="companyName" type="text" placeholder="Ex: Supermercado Central" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>CNPJ (opcional no cadastro rápido)</label>
              <input name="cnpj" type="text" inputMode="numeric" placeholder="00.000.000/0000-00" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>Ramo de atuação</label>
              <select name="industry" required disabled={loading} defaultValue="">
                <option value="" disabled>Selecione...</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </S.FormGroup>
            <S.FormGroup>
              <label>Endereço / Bairro</label>
              <input name="location" type="text" placeholder="Ex: Centro, Teodoro Sampaio" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>E-mail Corporativo</label>
              <input required name="email" type="email" placeholder="Ex: contato@empresa.com" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>WhatsApp (com DDD)</label>
              <input required name="phone" type="tel" placeholder="Ex: (18) 99999-9999" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>Senha</label>
              <input required name="password" type="password" placeholder="Crie uma senha forte (min 6)" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>Confirmar Senha</label>
              <input required name="confirmPassword" type="password" placeholder="Digite a senha novamente" disabled={loading} />
            </S.FormGroup>
            
            <S.SubmitButton type="submit" disabled={loading} style={{ backgroundColor: '#0f172a' }}>
              {loading ? 'Criando conta...' : 'Concluir Cadastro da Empresa'}
            </S.SubmitButton>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Já tem uma conta? </span>
              <button 
                type="button"
                onClick={() => navigate('/login?type=empresa')} 
                disabled={loading}
                style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.875rem', padding: '0.25rem', background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                Faça login
              </button>
            </div>

            <S.BackLink type="button" onClick={() => initialType ? navigate('/') : setStep('select')}>
              <ArrowLeft size={16} />
              {initialType ? 'Voltar para o início' : 'Voltar para seleção'}
            </S.BackLink>
          </S.Form>
        )}
      </S.Card>
    </S.Container>
  );
}
