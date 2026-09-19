import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Eye, CheckCircle, XCircle, Upload, Save, User, LayoutDashboard, Briefcase, LogOut, Edit2,
  Camera, Plus, X, Trash2, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppliedJobs } from '../../hooks/useAppliedJobs';
import { useAuth } from '../../hooks/useAuth';
import { candidatesService } from '../../services/supabase/candidates.service';
import { JobsBoard } from '../../components/JobsBoard';
import { SponsorCarousel } from '../../components/SponsorCarousel';
import { PageLoader } from '../../components/PageLoader';
import type { Candidate, Profile, ApplicationStatus } from '../../types/database';
import * as S from './styles';

type CandidateFull = Candidate & { profile: Profile };

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  enviada: 'Enviada',
  visualizada: 'Visualizada',
  em_analise: 'Em análise',
  pre_selecionado: 'Pré-selecionado',
  aprovada: 'Aprovada',
  rejeitada: 'Não selecionado',
  desistiu: 'Desistiu',
};

const emptyForm = {
  name: '', profession: '', city: '', age: '', phone: '', about: '', education: '', availability: '', is_open_to_work: true,
};

export function CandidateDashboard() {
  const navigate = useNavigate();
  const { profile, logout, isMock, refreshProfile } = useAuth();
  const { applications, withdrawFromJob, loading: appsLoading } = useAppliedJobs();

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'applications'>('overview');
  const [candidate, setCandidate] = useState<CandidateFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<'basic' | 'about' | 'contact' | 'skills' | 'experience' | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [expForm, setExpForm] = useState({ company_name: '', role: '', start_date: '', end_date: '', is_current: false });
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const loadCandidate = async () => {
    try {
      const data = isMock
        ? await candidatesService.getById('user-1')
        : await candidatesService.getMyProfile();
      if (data) {
        setCandidate(data as CandidateFull);
        setForm({
          name: data.profile?.full_name || profile?.full_name || '',
          profession: data.profession || '',
          city: data.city || data.profile?.city || 'Teodoro Sampaio, SP',
          age: data.age?.toString() || '',
          phone: data.profile?.phone || profile?.phone || '',
          about: data.about || '',
          education: data.education || '',
          availability: data.availability || '',
          is_open_to_work: data.is_open_to_work ?? true,
        });
        setSkills((data.skills || []).map(s => s.skill?.name).filter(Boolean) as string[]);
        setResumeUrl(data.resume_url || null);
      } else if (profile) {
        // Perfil criado antes da tabela candidates: começa em branco
        setForm({ ...emptyForm, name: profile.full_name, city: profile.city, phone: profile.phone || '' });
      }
    } catch (e) {
      console.error(e);
      toast.error('Não foi possível carregar seu perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCandidate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [profile?.id]);

  const completion = useMemo(() => {
    if (candidate?.completion_percent) return candidate.completion_percent;
    let filled = 0;
    if (form.about.length > 20) filled++;
    if (form.profession) filled++;
    if (form.education) filled++;
    if (resumeUrl) filled++;
    if (skills.length) filled++;
    if ((candidate?.experiences || []).length) filled++;
    if (form.city) filled++;
    return Math.round((filled * 100) / 7);
  }, [candidate, form, resumeUrl, skills]);

  const handleLogout = async () => {
    await logout();
    toast.success('Você saiu da sua conta.');
    navigate('/');
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMock) { toast.success('Perfil atualizado! (modo demonstração)'); setEditingSection(null); return; }
    setSaving(true);
    try {
      await candidatesService.updateMyProfile({
        full_name: form.name.trim(),
        phone: form.phone,
        profession: form.profession.trim() || null,
        city: form.city.trim(),
        age: form.age,
        about: form.about.trim() || null,
        education: form.education.trim() || null,
        availability: form.availability || null,
        is_open_to_work: form.is_open_to_work,
      });
      await refreshProfile();
      await loadCandidate();
      toast.success('Perfil atualizado com sucesso!');
      setEditingSection(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    if (skills.some(s => s.toLowerCase() === v.toLowerCase())) { setSkillInput(''); return; }
    if (skills.length >= 20) return toast.error('Máximo de 20 habilidades.');
    setSkills(prev => [...prev, v]);
    setSkillInput('');
  };

  const handleSaveSkills = async () => {
    if (isMock) { toast.success('Habilidades salvas! (demo)'); setEditingSection(null); return; }
    setSaving(true);
    try {
      await candidatesService.setMySkills(skills);
      await loadCandidate();
      toast.success('Habilidades atualizadas!');
      setEditingSection(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar habilidades.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMock) { toast.success('Experiência adicionada! (demo)'); return; }
    if (!expForm.company_name.trim() || !expForm.role.trim() || !expForm.start_date) return toast.error('Preencha empresa, cargo e data de início.');
    setSaving(true);
    try {
      await candidatesService.addExperience({
        company_name: expForm.company_name.trim(),
        role: expForm.role.trim(),
        start_date: expForm.start_date,
        end_date: expForm.is_current || !expForm.end_date ? null : expForm.end_date,
        is_current: expForm.is_current,
      });
      setExpForm({ company_name: '', role: '', start_date: '', end_date: '', is_current: false });
      await loadCandidate();
      toast.success('Experiência adicionada!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao adicionar experiência.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExperience = async (id: string) => {
    if (!window.confirm('Remover esta experiência?')) return;
    try {
      await candidatesService.removeExperience(id);
      await loadCandidate();
      toast.success('Experiência removida.');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isMock) { setResumeUrl(file.name); toast.success('Currículo anexado! (demo)'); return; }
    setSaving(true);
    try {
      const path = await candidatesService.uploadResume(file);
      setResumeUrl(path);
      toast.success('Currículo enviado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar currículo.');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isMock) { toast.success('Foto atualizada! (demo)'); return; }
    setSaving(true);
    try {
      await candidatesService.uploadAvatar(file);
      await refreshProfile();
      await loadCandidate();
      toast.success('Foto de perfil atualizada!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar foto.');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const openResume = async () => {
    if (!resumeUrl) return;
    const url = await candidatesService.getResumeSignedUrl(resumeUrl);
    if (url) window.open(url, '_blank', 'noopener');
    else toast.error('Não foi possível abrir o currículo.');
  };

  const handleWithdraw = async (jobId: string) => {
    if (!window.confirm('Tem certeza que deseja desistir desta vaga?')) return;
    try {
      await withdrawFromJob(jobId);
      toast.success('Você desistiu da vaga.');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao desistir.');
    }
  };

  if (loading) return <PageLoader label="Carregando seu painel..." />;

  const firstName = (form.name || profile?.full_name || 'Candidato').split(' ')[0];
  const avatarUrl = candidate?.profile?.avatar_url || profile?.avatar_url;
  const experiences = candidate?.experiences || [];
  const resumeLabel = resumeUrl ? (resumeUrl.split('/').pop() || 'curriculo.pdf') : '';

  return (
    <S.DashboardContainer>
      <S.WelcomeSection style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label title="Alterar foto" style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: avatarUrl ? `url(${avatarUrl}) center/cover` : '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
              {!avatarUrl && firstName.charAt(0).toUpperCase()}
            </div>
            <span style={{ position: 'absolute', bottom: -2, right: -2, background: 'white', borderRadius: '50%', padding: 4, boxShadow: '0 1px 3px rgba(0,0,0,.2)', display: 'flex' }}>
              <Camera size={14} color="#2563eb" />
            </span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={saving} />
          </label>
          <div>
            <h1>Olá, {firstName}!</h1>
            <p>Aqui está o resumo das suas atividades na plataforma.</p>
          </div>
        </div>
        <S.Btn $variant="danger" onClick={handleLogout}>
          <LogOut size={18} />
          Sair da Conta
        </S.Btn>
      </S.WelcomeSection>

      <S.TabsContainer style={{ overflowX: 'auto' }}>
        <S.TabButton $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          <LayoutDashboard size={20} /> Visão Geral
        </S.TabButton>
        <S.TabButton $active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
          <User size={20} /> Meu Perfil
        </S.TabButton>
        <S.TabButton $active={activeTab === 'applications'} onClick={() => setActiveTab('applications')}>
          <Briefcase size={20} /> Candidaturas {applications.length > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: 999, fontSize: '0.7rem', padding: '0.1rem 0.45rem' }}>{applications.length}</span>}
        </S.TabButton>
      </S.TabsContainer>

      {/* ------------------------------ VISÃO GERAL ------------------------------ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <S.StatsGrid>
            <S.StatCard>
              <div className="icon-wrapper"><CheckCircle size={20} /></div>
              <span className="value">{appsLoading ? '…' : applications.length}</span>
              <span className="label">Candidaturas</span>
            </S.StatCard>
            <S.StatCard>
              <div className="icon-wrapper"><Eye size={20} /></div>
              <span className="value">{candidate?.profile_views ?? 0}</span>
              <span className="label">Visualizações no Perfil</span>
            </S.StatCard>
            <S.StatCard>
              <div className="icon-wrapper"><FileText size={20} /></div>
              <span className="value">{completion}%</span>
              <span className="label">Perfil Completo</span>
              <S.ProgressBar $value={completion} />
            </S.StatCard>
          </S.StatsGrid>

          {completion < 70 && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <strong style={{ color: '#1e40af' }}>Complete seu perfil</strong>
                <p style={{ color: '#1e3a8a', fontSize: '0.875rem', margin: 0 }}>Perfis completos têm até 3x mais chances de serem chamados pelas empresas.</p>
              </div>
              <S.Btn onClick={() => setActiveTab('profile')}>Completar agora</S.Btn>
            </div>
          )}

          <SponsorCarousel />

          <section>
            <S.SectionTitle>
              Vagas Disponíveis
              <button onClick={() => navigate('/vagas')}>Ver todas</button>
            </S.SectionTitle>
            <JobsBoard maxItems={6} hideSearch />
          </section>
        </div>
      )}

      {/* ------------------------------ MEU PERFIL ------------------------------ */}
      {activeTab === 'profile' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <S.SectionTitle style={{ marginBottom: '0.25rem', justifyContent: 'flex-start', gap: '0.5rem' }}>
                <User size={24} /> Meu Perfil e Currículo
              </S.SectionTitle>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Mantenha seus dados atualizados para aumentar suas chances de ser contratado.</p>
            </div>
            {profile?.id && (
              <S.Btn $variant="soft" onClick={() => navigate(`/candidato/${profile.id}`)}>
                <ExternalLink size={16} /> Ver como as empresas veem
              </S.Btn>
            )}
          </div>

          {/* Informações básicas */}
          <form onSubmit={handleSaveProfile}>
            <S.Card>
              <S.CardHeader $bordered={editingSection === 'basic'}>
                <h4>Informações Básicas</h4>
                {editingSection !== 'basic' && <S.Btn type="button" $variant="soft" onClick={() => setEditingSection('basic')}><Edit2 size={16} /> Editar</S.Btn>}
              </S.CardHeader>
              {editingSection === 'basic' ? (
                <S.CardBody $editing>
                  <S.FieldRow>
                    <S.Field><label>Nome Completo</label><input required minLength={3} name="name" value={form.name} onChange={onChange} /></S.Field>
                    <S.Field><label>Profissão / Cargo Desejado</label><input name="profession" value={form.profession} onChange={onChange} placeholder="Ex: Vendedor, Auxiliar Administrativo" /></S.Field>
                  </S.FieldRow>
                  <S.FieldRow>
                    <S.Field $basis="140px"><label>Idade</label><input type="number" min={14} max={80} name="age" value={form.age} onChange={onChange} /></S.Field>
                    <S.Field><label>Cidade / Estado</label><input required name="city" value={form.city} onChange={onChange} /></S.Field>
                    <S.Field $basis="200px">
                      <label>Disponibilidade</label>
                      <select name="availability" value={form.availability} onChange={onChange}>
                        <option value="">Selecione...</option>
                        <option>Imediata</option><option>Manhã</option><option>Tarde</option><option>Noite</option><option>Fins de semana</option><option>Integral</option>
                      </select>
                    </S.Field>
                  </S.FieldRow>
                  <S.Field><label>Formação Acadêmica</label><input name="education" value={form.education} onChange={onChange} placeholder="Ex: Ensino Médio Completo, Técnico em Informática (ETEC)" /></S.Field>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" name="is_open_to_work" checked={form.is_open_to_work} onChange={onChange} style={{ width: 'auto' }} />
                    Estou disponível para novas oportunidades (visível para empresas)
                  </label>
                  <S.Actions>
                    <S.Btn type="submit" $variant="success" disabled={saving}><Save size={18} /> {saving ? 'Salvando...' : 'Salvar'}</S.Btn>
                    <S.Btn type="button" $variant="ghost" onClick={() => setEditingSection(null)}>Cancelar</S.Btn>
                  </S.Actions>
                </S.CardBody>
              ) : (
                <S.CardBody>
                  <S.ReadGrid>
                    <S.ReadItem><span>Nome:</span><strong>{form.name || '—'}</strong></S.ReadItem>
                    <S.ReadItem><span>Profissão:</span><strong>{form.profession || 'Não informada'}</strong></S.ReadItem>
                    <S.ReadItem><span>Idade:</span><strong>{form.age ? `${form.age} anos` : 'Não informada'}</strong></S.ReadItem>
                    <S.ReadItem><span>Cidade:</span><strong>{form.city || '—'}</strong></S.ReadItem>
                    <S.ReadItem><span>Formação:</span><strong>{form.education || 'Não informada'}</strong></S.ReadItem>
                    <S.ReadItem><span>Disponibilidade:</span><strong>{form.availability || 'Não informada'}</strong></S.ReadItem>
                  </S.ReadGrid>
                </S.CardBody>
              )}
            </S.Card>
          </form>

          {/* Sobre mim */}
          <form onSubmit={handleSaveProfile}>
            <S.Card>
              <S.CardHeader $bordered={editingSection === 'about'}>
                <h4>Sobre Mim</h4>
                {editingSection !== 'about' && <S.Btn type="button" $variant="soft" onClick={() => setEditingSection('about')}><Edit2 size={16} /> Editar</S.Btn>}
              </S.CardHeader>
              {editingSection === 'about' ? (
                <S.CardBody $editing>
                  <S.Field>
                    <label>Apresentação</label>
                    <textarea rows={5} maxLength={2000} name="about" value={form.about} onChange={onChange} placeholder="Fale sobre você, seus objetivos e o que você busca profissionalmente..." />
                    <small>{form.about.length}/2000</small>
                  </S.Field>
                  <S.Actions>
                    <S.Btn type="submit" $variant="success" disabled={saving}><Save size={18} /> {saving ? 'Salvando...' : 'Salvar'}</S.Btn>
                    <S.Btn type="button" $variant="ghost" onClick={() => setEditingSection(null)}>Cancelar</S.Btn>
                  </S.Actions>
                </S.CardBody>
              ) : (
                <S.CardBody>
                  <S.ReadItem><strong style={{ fontWeight: 400, whiteSpace: 'pre-line' }}>{form.about || 'Conte um pouco sobre você para as empresas.'}</strong></S.ReadItem>
                </S.CardBody>
              )}
            </S.Card>
          </form>

          {/* Habilidades */}
          <S.Card>
            <S.CardHeader $bordered={editingSection === 'skills'}>
              <h4>Habilidades</h4>
              {editingSection !== 'skills' && <S.Btn type="button" $variant="soft" onClick={() => setEditingSection('skills')}><Edit2 size={16} /> Editar</S.Btn>}
            </S.CardHeader>
            {editingSection === 'skills' ? (
              <S.CardBody $editing>
                <S.Field>
                  <label>Adicionar habilidade</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="Ex: Atendimento ao cliente, Excel, Vendas" />
                    <S.Btn type="button" onClick={addSkill}><Plus size={18} /></S.Btn>
                  </div>
                  <small>Pressione Enter para adicionar. Máximo 20.</small>
                </S.Field>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {skills.map(s => (
                    <S.Chip key={s}>{s}<button type="button" aria-label={`Remover ${s}`} onClick={() => setSkills(prev => prev.filter(x => x !== s))}><X size={14} /></button></S.Chip>
                  ))}
                  {skills.length === 0 && <small style={{ color: '#94a3b8' }}>Nenhuma habilidade adicionada.</small>}
                </div>
                <S.Actions>
                  <S.Btn type="button" $variant="success" disabled={saving} onClick={handleSaveSkills}><Save size={18} /> {saving ? 'Salvando...' : 'Salvar'}</S.Btn>
                  <S.Btn type="button" $variant="ghost" onClick={() => { setEditingSection(null); loadCandidate(); }}>Cancelar</S.Btn>
                </S.Actions>
              </S.CardBody>
            ) : (
              <S.CardBody>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {skills.length ? skills.map(s => <S.Chip key={s}>{s}</S.Chip>) : <small style={{ color: '#94a3b8' }}>Adicione suas habilidades para aparecer nas buscas das empresas.</small>}
                </div>
              </S.CardBody>
            )}
          </S.Card>

          {/* Experiências */}
          <S.Card>
            <S.CardHeader $bordered={editingSection === 'experience'}>
              <h4>Experiência Profissional</h4>
              {editingSection !== 'experience' && <S.Btn type="button" $variant="soft" onClick={() => setEditingSection('experience')}><Plus size={16} /> Adicionar</S.Btn>}
            </S.CardHeader>
            <S.CardBody $editing={editingSection === 'experience'}>
              {editingSection === 'experience' && (
                <form onSubmit={handleAddExperience} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  <S.FieldRow>
                    <S.Field><label>Empresa</label><input required value={expForm.company_name} onChange={e => setExpForm(p => ({ ...p, company_name: e.target.value }))} /></S.Field>
                    <S.Field><label>Cargo</label><input required value={expForm.role} onChange={e => setExpForm(p => ({ ...p, role: e.target.value }))} /></S.Field>
                  </S.FieldRow>
                  <S.FieldRow>
                    <S.Field $basis="180px"><label>Início</label><input required type="date" value={expForm.start_date} onChange={e => setExpForm(p => ({ ...p, start_date: e.target.value }))} /></S.Field>
                    <S.Field $basis="180px"><label>Fim</label><input type="date" disabled={expForm.is_current} value={expForm.end_date} onChange={e => setExpForm(p => ({ ...p, end_date: e.target.value }))} /></S.Field>
                    <S.Field $basis="180px" style={{ justifyContent: 'flex-end' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={expForm.is_current} onChange={e => setExpForm(p => ({ ...p, is_current: e.target.checked }))} style={{ width: 'auto' }} /> Trabalho atual
                      </label>
                    </S.Field>
                  </S.FieldRow>
                  <S.Actions>
                    <S.Btn type="submit" $variant="success" disabled={saving}><Plus size={18} /> Adicionar</S.Btn>
                    <S.Btn type="button" $variant="ghost" onClick={() => setEditingSection(null)}>Fechar</S.Btn>
                  </S.Actions>
                </form>
              )}
              {experiences.length === 0 ? (
                <small style={{ color: '#94a3b8' }}>Nenhuma experiência cadastrada. Primeiro emprego? Sem problemas — muitas vagas aceitam!</small>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {experiences.map(exp => (
                    <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 8 }}>
                      <div>
                        <strong style={{ color: '#0f172a' }}>{exp.role}</strong>
                        <p style={{ margin: 0, color: '#475569', fontSize: '0.875rem' }}>{exp.company_name}</p>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem' }}>
                          {new Date(exp.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} — {exp.is_current || !exp.end_date ? 'Atual' : new Date(exp.end_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {!isMock && <button type="button" onClick={() => handleRemoveExperience(exp.id)} aria-label="Remover" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}><Trash2 size={16} /></button>}
                    </div>
                  ))}
                </div>
              )}
            </S.CardBody>
          </S.Card>

          {/* Contato e Currículo */}
          <form onSubmit={handleSaveProfile}>
            <S.Card>
              <S.CardHeader $bordered={editingSection === 'contact'}>
                <h4>Contato e Currículo</h4>
                {editingSection !== 'contact' && <S.Btn type="button" $variant="soft" onClick={() => setEditingSection('contact')}><Edit2 size={16} /> Editar</S.Btn>}
              </S.CardHeader>
              {editingSection === 'contact' ? (
                <S.CardBody $editing>
                  <S.FieldRow>
                    <S.Field>
                      <label>Telefone / WhatsApp</label>
                      <input type="tel" name="phone" value={form.phone} onChange={onChange} placeholder="(18) 99999-9999" />
                      <small>Visível apenas para empresas em que você se candidatou.</small>
                    </S.Field>
                    <S.Field>
                      <label>Currículo (PDF ou Word, até 5MB)</label>
                      <div style={{ position: 'relative' }}>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={saving} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'white', border: '1px dashed #cbd5e1', borderRadius: 8, color: '#475569' }}>
                          <Upload size={18} /> {resumeLabel || 'Clique para enviar seu currículo'}
                        </div>
                      </div>
                    </S.Field>
                  </S.FieldRow>
                  <S.Actions>
                    <S.Btn type="submit" $variant="success" disabled={saving}><Save size={18} /> {saving ? 'Salvando...' : 'Salvar'}</S.Btn>
                    <S.Btn type="button" $variant="ghost" onClick={() => setEditingSection(null)}>Cancelar</S.Btn>
                  </S.Actions>
                </S.CardBody>
              ) : (
                <S.CardBody>
                  <S.ReadGrid>
                    <S.ReadItem><span>E-mail:</span><strong>{profile?.email || candidate?.profile?.email || '—'}</strong></S.ReadItem>
                    <S.ReadItem><span>WhatsApp:</span><strong>{form.phone || 'Não informado'}</strong></S.ReadItem>
                    <S.ReadItem>
                      <span>Currículo:</span>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {resumeUrl ? (
                          <button type="button" onClick={openResume} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: 0, font: 'inherit', fontWeight: 600 }}>
                            <FileText size={16} /> {resumeLabel}
                          </button>
                        ) : 'Nenhum currículo'}
                      </strong>
                    </S.ReadItem>
                  </S.ReadGrid>
                </S.CardBody>
              )}
            </S.Card>
          </form>
        </section>
      )}

      {/* ------------------------------ CANDIDATURAS ------------------------------ */}
      {activeTab === 'applications' && (
        <section>
          <S.SectionTitle>Minhas Candidaturas</S.SectionTitle>
          {appsLoading ? (
            <PageLoader label="Carregando candidaturas..." />
          ) : applications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map(app => {
                const job = app.job;
                const title = job?.title || 'Vaga';
                const companyName = (job as any)?.company?.name;
                return (
                  <S.ApplicationRow key={app.id}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h4 onClick={() => navigate(`/vagas/${app.job_id}`)}>{title}</h4>
                        <S.StatusBadge $status={app.status}>{APPLICATION_STATUS_LABEL[app.status] || app.status}</S.StatusBadge>
                      </div>
                      <p>
                        {companyName ? `${companyName} • ` : ''}{job?.type ? `${job.type} • ` : ''}{job?.location || ''}
                        {' • '}Enviada em {new Date(app.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <S.Actions>
                      <S.Btn $variant="soft" onClick={() => navigate(`/vagas/${app.job_id}`)}><Eye size={18} /> Ver Vaga</S.Btn>
                      {!['aprovada', 'rejeitada'].includes(app.status) && (
                        <S.Btn $variant="danger" onClick={() => handleWithdraw(app.job_id)}><XCircle size={18} /> Desistir</S.Btn>
                      )}
                    </S.Actions>
                  </S.ApplicationRow>
                );
              })}
            </div>
          ) : (
            <div style={{ background: 'white', padding: '2rem', textAlign: 'center', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <Briefcase size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>Você ainda não se candidatou a nenhuma vaga.</p>
              <S.Btn onClick={() => navigate('/vagas')}>Buscar Vagas</S.Btn>
            </div>
          )}
        </section>
      )}
    </S.DashboardContainer>
  );
}
