import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import * as S from './styles';

export function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simula requisição e tempo de rede
    setTimeout(() => {
      setLoading(false);
      toast.success('Vaga publicada com sucesso!', {
        description: 'Sua vaga já está visível para os candidatos.'
      });
      navigate('/empresa/painel');
    }, 1500);
  };

  return (
    <S.Container>
      <S.Header>
        <S.BackButton type="button" onClick={() => navigate('/empresa/painel')}>
          <ArrowLeft size={20} />
          Voltar para o Painel
        </S.BackButton>
        <h1>Publicar Nova Vaga</h1>
      </S.Header>

      <S.Form onSubmit={handleSubmit}>
        <S.FormGroup>
          <label>Título da Vaga</label>
          <input required type="text" placeholder="Ex: Desenvolvedor(a) Front-End" />
        </S.FormGroup>

        <S.FormRow>
          <S.FormGroup>
            <label>Modalidade</label>
            <select required>
              <option value="">Selecione...</option>
              <option value="Presencial">Presencial</option>
              <option value="Remoto">Remoto</option>
              <option value="Estágio">Estágio</option>
              <option value="Jovem Aprendiz">Jovem Aprendiz</option>
              <option value="Freelancer">Freelancer</option>
            </select>
          </S.FormGroup>
          <S.FormGroup>
            <label>Salário (Opcional)</label>
            <input type="text" placeholder="Ex: R$ 2.500,00" />
          </S.FormGroup>
        </S.FormRow>

        <S.FormGroup>
          <label>Localização</label>
          <input required type="text" placeholder="Ex: Centro, Teodoro Sampaio" />
        </S.FormGroup>

        <S.FormGroup>
          <label>Descrição da Vaga</label>
          <textarea required rows={5} placeholder="Descreva o dia a dia e as responsabilidades da vaga..."></textarea>
        </S.FormGroup>

        <S.FormGroup>
          <label>Requisitos</label>
          <textarea required rows={4} placeholder="Liste os requisitos separados por linha (ex: Ensino Médio Completo, Experiência na área...)"></textarea>
        </S.FormGroup>

        <S.FormGroup>
          <label>Benefícios</label>
          <textarea rows={4} placeholder="Liste os benefícios separados por linha (ex: Vale Transporte, Plano de Saúde...)"></textarea>
        </S.FormGroup>

        <S.SubmitButton type="submit" disabled={loading}>
          <Save size={20} />
          {loading ? 'Publicando...' : 'Publicar Vaga'}
        </S.SubmitButton>
      </S.Form>
    </S.Container>
  );
}
