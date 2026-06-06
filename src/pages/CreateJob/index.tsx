import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { jobsMock } from '../../data/jobs';
import * as S from './styles';

export function CreateJob() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // States para os campos do formulário
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');

  useEffect(() => {
    if (id) {
      const jobToEdit = jobsMock.find(j => j.id === id);
      if (jobToEdit) {
        setIsEditing(true);
        setTitle(jobToEdit.title);
        setType(jobToEdit.type);
        setSalary(jobToEdit.salary || '');
        setLocation(jobToEdit.location);
        setDescription(jobToEdit.description);
        setRequirements(jobToEdit.requirements.join('\n'));
        setBenefits(jobToEdit.benefits.join('\n'));
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simula requisição e tempo de rede
    setTimeout(() => {
      setLoading(false);
      if (isEditing) {
        toast.success('Vaga atualizada com sucesso!', {
          description: 'As alterações foram salvas.'
        });
      } else {
        toast.success('Vaga publicada com sucesso!', {
          description: 'Sua vaga já está visível para os candidatos.'
        });
      }
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
        <h1>{isEditing ? 'Editar Vaga' : 'Publicar Nova Vaga'}</h1>
      </S.Header>

      <S.Form onSubmit={handleSubmit}>
        <S.FormGroup>
          <label>Título da Vaga</label>
          <input required type="text" placeholder="Ex: Desenvolvedor(a) Front-End" value={title} onChange={e => setTitle(e.target.value)} />
        </S.FormGroup>

        <S.FormRow>
          <S.FormGroup>
            <label>Modalidade</label>
            <select required value={type} onChange={e => setType(e.target.value)}>
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
            <input type="text" placeholder="Ex: R$ 2.500,00" value={salary} onChange={e => setSalary(e.target.value)} />
          </S.FormGroup>
        </S.FormRow>

        <S.FormGroup>
          <label>Localização</label>
          <input required type="text" placeholder="Ex: Centro, Teodoro Sampaio" value={location} onChange={e => setLocation(e.target.value)} />
        </S.FormGroup>

        <S.FormGroup>
          <label>Descrição da Vaga</label>
          <textarea required rows={5} placeholder="Descreva o dia a dia e as responsabilidades da vaga..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
        </S.FormGroup>

        <S.FormGroup>
          <label>Requisitos</label>
          <textarea required rows={4} placeholder="Liste os requisitos separados por linha (ex: Ensino Médio Completo, Experiência na área...)" value={requirements} onChange={e => setRequirements(e.target.value)}></textarea>
        </S.FormGroup>

        <S.FormGroup>
          <label>Benefícios</label>
          <textarea rows={4} placeholder="Liste os benefícios separados por linha (ex: Vale Transporte, Plano de Saúde...)" value={benefits} onChange={e => setBenefits(e.target.value)}></textarea>
        </S.FormGroup>

        <S.SubmitButton type="submit" disabled={loading}>
          <Save size={20} />
          {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Publicar Vaga')}
        </S.SubmitButton>
      </S.Form>
    </S.Container>
  );
}
