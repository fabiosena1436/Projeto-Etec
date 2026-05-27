import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, Building, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import * as S from './styles';

type Step = 'select' | 'candidato' | 'empresa';

export function Register() {
  const [step, setStep] = useState<Step>('select');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simula o tempo de requisição para a apresentação
    setTimeout(() => {
      setLoading(false);
      toast.success('Cadastro realizado com sucesso!', {
        description: 'Sua conta foi criada. Faça login para continuar.',
      });
      navigate('/login');
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
              <input required type="text" placeholder="Ex: João da Silva" />
            </S.FormGroup>
            <S.FormGroup>
              <label>E-mail</label>
              <input required type="email" placeholder="Ex: joao@email.com" />
            </S.FormGroup>
            <S.FormGroup>
              <label>Senha</label>
              <input required type="password" placeholder="Crie uma senha forte" />
            </S.FormGroup>
            
            <S.SubmitButton type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Concluir Cadastro'}
            </S.SubmitButton>
            
            <S.BackLink type="button" onClick={() => setStep('select')}>
              <ArrowLeft size={16} />
              Voltar para seleção
            </S.BackLink>
          </S.Form>
        )}

        {step === 'empresa' && (
          <S.Form onSubmit={handleRegister}>
            <p style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 500 }}>Cadastro de Empresa / Loja</p>
            <S.FormGroup>
              <label>Nome da Empresa (Razão Social ou Fantasia)</label>
              <input required type="text" placeholder="Ex: Supermercado Central" />
            </S.FormGroup>
            <S.FormGroup>
              <label>CNPJ</label>
              <input required type="text" placeholder="00.000.000/0000-00" />
            </S.FormGroup>
            <S.FormGroup>
              <label>E-mail Corporativo</label>
              <input required type="email" placeholder="Ex: contato@empresa.com" />
            </S.FormGroup>
            <S.FormGroup>
              <label>Senha</label>
              <input required type="password" placeholder="Crie uma senha forte" />
            </S.FormGroup>
            
            <S.SubmitButton type="submit" disabled={loading} style={{ backgroundColor: '#0f172a' }}>
              {loading ? 'Criando conta...' : 'Concluir Cadastro da Empresa'}
            </S.SubmitButton>
            
            <S.BackLink type="button" onClick={() => setStep('select')}>
              <ArrowLeft size={16} />
              Voltar para seleção
            </S.BackLink>
          </S.Form>
        )}
      </S.Card>
    </S.Container>
  );
}