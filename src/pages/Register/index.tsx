import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, User, Building, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import * as S from './styles';

type Step = 'select' | 'candidato' | 'empresa';

export function Register() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as Step | null;
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(initialType || 'select');
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simples validação de senha (apenas UI mockup)
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }

    setLoading(true);

    // Simula o tempo de requisição para a apresentação
    setTimeout(() => {
      setLoading(false);
      toast.success('Cadastro realizado com sucesso!', {
        description: 'Sua conta foi criada. Faça login para continuar.',
      });
      navigate(`/login?type=${step}`);
    }, 1500);
  };

  return (
    <S.Container>
      <S.Card>
        <S.Brand>
          <Briefcase size={48} />
          <h1>Criar Nova Conta</h1>
        </S.Brand>

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
              <input required type="text" placeholder="Ex: João da Silva" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>E-mail</label>
              <input required type="email" placeholder="Ex: joao@email.com" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>WhatsApp (com DDD)</label>
              <input required type="tel" placeholder="Ex: (18) 99999-9999" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>Senha</label>
              <input required name="password" type="password" placeholder="Crie uma senha forte" disabled={loading} />
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
              <input required type="text" placeholder="Ex: Supermercado Central" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>CNPJ</label>
              <input required type="text" placeholder="00.000.000/0000-00" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>E-mail Corporativo</label>
              <input required type="email" placeholder="Ex: contato@empresa.com" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>WhatsApp (com DDD)</label>
              <input required type="tel" placeholder="Ex: (18) 99999-9999" disabled={loading} />
            </S.FormGroup>
            <S.FormGroup>
              <label>Senha</label>
              <input required name="password" type="password" placeholder="Crie uma senha forte" disabled={loading} />
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