import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { jobsService } from '../../services/supabase/jobs.service';
import { companiesService } from '../../services/supabase/companies.service';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../../components/PageLoader';
import type { JobType } from '../../types/database';
import * as S from './styles';

const JOB_TYPES: JobType[] = ['Presencial', 'Remoto', 'Híbrido', 'Estágio', 'Jovem Aprendiz', 'Freelancer', 'Temporário'];
const LEVELS = ['Sem experiência', 'Júnior', 'Pleno', 'Sênior', 'Estágio', 'Aprendiz'];

const splitLines = (t: string) => t.split('\n').map(s => s.trim()).filter(Boolean);

export function CreateJob() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isMock } = useAuth();

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<JobType | ''>('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [vacancies, setVacancies] = useState('1');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [educationRequired, setEducationRequired] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<'Ativa' | 'Rascunho'>('Ativa');

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const company = await companiesService.getMyCompany();
        if (cancelled) return;
        if (!company) {
          toast.error('Empresa não encontrada para sua conta.');
          navigate('/empresa/painel');
          return;
        }
        setCompanyId(company.id);
        if (!location) setLocation(company.location || 'Teodoro Sampaio, SP');

        if (id) {
          const job = await jobsService.getOwnById(id);
          if (cancelled) return;
          if (!job || job.company_id !== company.id) {
            toast.error('Vaga não encontrada ou não pertence à sua empresa.');
            navigate('/empresa/painel');
            return;
          }
          setTitle(job.title);
          setType(job.type);
          setSalary(job.salary_text || '');
          setLocation(job.location);
          setDescription(job.description);
          setRequirements((job.requirements || []).join('\n'));
          setBenefits((job.benefits || []).join('\n'));
          setVacancies(String(job.vacancies || 1));
          setExperienceLevel(job.experience_level || '');
          setEducationRequired(job.education_required || '');
          setExpiresAt(job.expires_at ? job.expires_at.slice(0, 10) : '');
          setStatus(job.status === 'Rascunho' ? 'Rascunho' : 'Ativa');
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }
    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return toast.error('Selecione a modalidade.');
    if (title.trim().length < 5) return toast.error('O título deve ter pelo menos 5 caracteres.');
    if (description.trim().length < 20) return toast.error('Descreva melhor a vaga (mínimo 20 caracteres).');
    if (!companyId) return toast.error('Empresa não carregada.');

    setLoading(true);
    const payload = {
      company_id: companyId,
      title: title.trim(),
      type,
      salary_text: salary.trim() || 'A combinar',
      location: location.trim(),
      description: description.trim(),
      requirements: splitLines(requirements),
      benefits: splitLines(benefits),
      vacancies: Math.max(1, Math.min(100, Number(vacancies) || 1)),
      experience_level: experienceLevel || null,
      education_required: educationRequired.trim() || null,
      expires_at: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
      status,
    };

    try {
      if (isMock) {
        await new Promise(r => setTimeout(r, 800));
      } else if (isEditing && id) {
        await jobsService.update(id, payload as any);
      } else {
        await jobsService.create(payload);
      }
      toast.success(isEditing ? 'Vaga atualizada com sucesso!' : status === 'Rascunho' ? 'Rascunho salvo!' : 'Vaga publicada com sucesso!', {
        description: isEditing ? 'As alterações foram salvas.' : status === 'Rascunho' ? 'Publique quando estiver pronta.' : 'Sua vaga já está visível para os candidatos.',
      });
      navigate('/empresa/painel');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar vaga.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Excluir esta vaga permanentemente? As candidaturas também serão removidas.')) return;
    setLoading(true);
    try {
      if (!isMock) await jobsService.delete(id);
      toast.success('Vaga excluída.');
      navigate('/empresa/painel');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) return <PageLoader label="Preparando formulário..." />;

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
          <label>Título da Vaga *</label>
          <input required minLength={5} maxLength={120} type="text" placeholder="Ex: Vendedor(a) de Loja" value={title} onChange={e => setTitle(e.target.value)} />
        </S.FormGroup>

        <S.FormRow>
          <S.FormGroup>
            <label>Modalidade *</label>
            <select required value={type} onChange={e => setType(e.target.value as JobType)}>
              <option value="">Selecione...</option>
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </S.FormGroup>
          <S.FormGroup>
            <label>Salário</label>
            <input type="text" placeholder="Ex: R$ 1.600,00 + Comissão" value={salary} onChange={e => setSalary(e.target.value)} />
          </S.FormGroup>
        </S.FormRow>

        <S.FormRow>
          <S.FormGroup>
            <label>Localização *</label>
            <input required type="text" placeholder="Ex: Centro, Teodoro Sampaio" value={location} onChange={e => setLocation(e.target.value)} />
          </S.FormGroup>
          <S.FormGroup>
            <label>Nº de vagas</label>
            <input type="number" min={1} max={100} value={vacancies} onChange={e => setVacancies(e.target.value)} />
          </S.FormGroup>
        </S.FormRow>

        <S.FormRow>
          <S.FormGroup>
            <label>Nível de experiência</label>
            <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}>
              <option value="">Não especificado</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </S.FormGroup>
          <S.FormGroup>
            <label>Escolaridade mínima</label>
            <input type="text" placeholder="Ex: Ensino Médio Completo" value={educationRequired} onChange={e => setEducationRequired(e.target.value)} />
          </S.FormGroup>
        </S.FormRow>

        <S.FormGroup>
          <label>Descrição da Vaga *</label>
          <textarea required minLength={20} rows={5} placeholder="Descreva o dia a dia e as responsabilidades da vaga..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
        </S.FormGroup>

        <S.FormGroup>
          <label>Requisitos (um por linha)</label>
          <textarea rows={4} placeholder={'Ensino Médio Completo\nBoa comunicação\nExperiência em vendas (diferencial)'} value={requirements} onChange={e => setRequirements(e.target.value)}></textarea>
        </S.FormGroup>

        <S.FormGroup>
          <label>Benefícios (um por linha)</label>
          <textarea rows={4} placeholder={'Vale Transporte\nVale Alimentação\nPlano de Saúde'} value={benefits} onChange={e => setBenefits(e.target.value)}></textarea>
        </S.FormGroup>

        <S.FormRow>
          <S.FormGroup>
            <label>Encerrar automaticamente em</label>
            <input type="date" min={new Date().toISOString().slice(0, 10)} value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
          </S.FormGroup>
          <S.FormGroup>
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as 'Ativa' | 'Rascunho')}>
              <option value="Ativa">Publicada (visível para candidatos)</option>
              <option value="Rascunho">Rascunho (somente você vê)</option>
            </select>
          </S.FormGroup>
        </S.FormRow>

        <S.SubmitButton type="submit" disabled={loading}>
          <Save size={20} />
          {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : status === 'Rascunho' ? 'Salvar Rascunho' : 'Publicar Vaga')}
        </S.SubmitButton>

        {isEditing && (
          <button type="button" onClick={handleDelete} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', background: 'transparent', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>
            <Trash2 size={18} /> Excluir vaga
          </button>
        )}
      </S.Form>
    </S.Container>
  );
}
