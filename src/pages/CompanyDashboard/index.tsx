import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, Eye, Users, Briefcase, Tag, Trash2, Edit2, Star, ChevronDown, ChevronUp, User, Ban,
  RefreshCw, LogOut, LayoutDashboard, Building2, Save, Camera, Phone, FileText, Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { companiesService } from '../../services/supabase/companies.service';
import { jobsService } from '../../services/supabase/jobs.service';
import { applicationsService } from '../../services/supabase/applications.service';
import { metricsService, type CompanyMetrics } from '../../services/supabase/metrics.service';
import { candidatesService } from '../../services/supabase/candidates.service';
import { PageLoader } from '../../components/PageLoader';
import { openDocument } from '../../utils/openDocument';
import { commercialLink } from '../../config/business';
import { INDUSTRIES } from '../Register';
import { APPLICATION_STATUS_LABEL } from '../CandidateDashboard';
import * as F from '../CandidateDashboard/styles';
import type { Company, Job, Application, ApplicationStatus, Promotion } from '../../types/database';
import * as S from './styles';
import { SponsorReport } from '../../components/SponsorReport';
import { ImagePicker } from '../../components/ImagePicker';
import { uploadImage } from '../../services/supabase/images.service';

type AppWithCandidate = Application & {
  candidate?: { id: string; full_name: string; avatar_url: string | null; city: string; phone: string | null; email: string };
  candidate_details?: { profession: string | null; resume_url: string | null; skills?: { skill: { name: string } }[] };
};

const STATUS_OPTIONS: ApplicationStatus[] = ['enviada', 'visualizada', 'em_analise', 'pre_selecionado', 'aprovada', 'rejeitada'];
const MAX_PROMOTIONS = 6;

export function CompanyDashboard() {
  const navigate = useNavigate();
  const { logout, profile, isMock } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<AppWithCandidate[]>([]);
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'profile'>('overview');

  const [profileData, setProfileData] = useState({ name: '', description: '', website: '', slogan: '', industry: '', location: '', phone: '', contact_email: '', banner_url: '', logo_url: '' });
  const [promoImage,setPromoImage] = useState<File|null>(null);
  const [bannerImage,setBannerImage] = useState<File|null>(null);
  const [promoPreparing,setPromoPreparing] = useState(false);
  const [bannerPreparing,setBannerPreparing] = useState(false);
  const [promoForm, setPromoForm] = useState<{ open: boolean; editing: Promotion | null; title: string; description: string; price: string; discount_price: string; valid_until: string; image_url: string }>({ open: false, editing: null, title: '', description: '', price: '', discount_price: '', valid_until: '', image_url: '' });

  const load = useCallback(async () => {
    try {
      const c = await companiesService.getMyCompany();
      setCompany(c);
      if (c) {
        setProfileData({
          name: c.name, description: c.description || '', website: c.website || '', slogan: c.slogan || '',
          industry: c.industry || '', location: c.location || '', phone: c.phone || '', contact_email: c.contact_email || '',
          banner_url: c.banner_url || '',
          logo_url: c.logo_url || '',
        });
        const [j, apps, m] = await Promise.all([
          jobsService.getByCompany(c.id),
          applicationsService.getCompanyApplications(c.id),
          metricsService.getCompany(c.id),
        ]);
        setJobs(j);
        setApplications(apps as AppWithCandidate[]);
        setMetrics(m);
      }
    } catch (e: any) {
      console.error(e);
      toast.error('Erro ao carregar painel da empresa.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const appsByJob = useMemo(() => {
    const map: Record<string, AppWithCandidate[]> = {};
    for (const a of applications) (map[a.job_id] ||= []).push(a);
    return map;
  }, [applications]);

  const promotions: Promotion[] = (company as any)?.promotions || [];
  const newApplications = applications.filter(a => a.status === 'enviada').length;

  // ------------------------------------------------------------------ handlers
  const handleLogout = async () => { await logout(); navigate('/'); };

  const handleToggleJobStatus = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    const newStatus = job.status === 'Ativa' ? 'Encerrada' : 'Ativa';
    if (isMock) { setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j)); toast.success(`Vaga ${newStatus === 'Ativa' ? 'reaberta' : 'encerrada'}! (demo)`); return; }
    try {
      const updated = await jobsService.update(job.id, { status: newStatus });
      setJobs(prev => prev.map(j => j.id === job.id ? updated : j));
      toast.success(newStatus === 'Ativa' ? 'Vaga reaberta com sucesso!' : 'Vaga encerrada com sucesso!');
      metricsService.getCompany(company!.id).then(setMetrics).catch(() => toast.error('Não foi possível atualizar os indicadores. Atualize o painel.'));
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar status.');
    }
  };

  const handleDeleteJob = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    if (!window.confirm(`Excluir a vaga "${job.title}"? Todas as candidaturas serão removidas.`)) return;
    if (isMock) { setJobs(prev => prev.filter(j => j.id !== job.id)); toast.success('Vaga excluída (demo)'); return; }
    try {
      await jobsService.delete(job.id);
      setJobs(prev => prev.filter(j => j.id !== job.id));
      toast.success('Vaga excluída.');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir.');
    }
  };

  const handleStatusChange = async (app: AppWithCandidate, status: ApplicationStatus) => {
    if (isMock) { setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status } : a)); toast.success('Status atualizado (demo)'); return; }
    try {
      await applicationsService.updateStatus(app.id, status);
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status } : a));
      toast.success(`Candidato marcado como "${APPLICATION_STATUS_LABEL[status]}".`);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar status.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || bannerPreparing) return;
    if (!company) return;
    if (isMock) { toast.success('Perfil da empresa atualizado! (demo)'); return; }
    let website = profileData.website.trim();
    if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;
    if (profileData.banner_url.trim() && !/^https:\/\//i.test(profileData.banner_url.trim())) return toast.error('A imagem de capa deve usar um endereço HTTPS.');
    if (profileData.logo_url.trim() && !/^https:\/\//i.test(profileData.logo_url.trim())) return toast.error('A logo deve usar um endereço HTTPS.');
    setSaving(true);
    try {
      const banner = bannerImage ? await uploadImage('company-logos', company.id, bannerImage) : profileData.banner_url.trim();
      const updated = await companiesService.update(company.id, {
        name: profileData.name.trim(),
        description: profileData.description.trim() || null,
        website: website || null,
        slogan: profileData.slogan.trim() || null,
        industry: profileData.industry || 'Geral',
        location: profileData.location.trim() || company.location,
        phone: profileData.phone.replace(/\D/g, '') || null,
        contact_email: profileData.contact_email.trim() || company.contact_email,
        banner_url: banner || null,
        logo_url: profileData.logo_url.trim() || null,
      });
      setCompany(prev => ({ ...(prev as Company), ...updated }));
      setProfileData(prev => ({...prev,banner_url:banner}));
      setBannerImage(null);
      toast.success('Perfil da empresa atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    if (isMock) { toast.success('Logo atualizada! (demo)'); return; }
    setSaving(true);
    try {
      const url = await companiesService.uploadLogo(company.id, file);
      setCompany(prev => prev ? { ...prev, logo_url: url } : prev);
      setProfileData(prev => ({ ...prev, logo_url: url }));
      toast.success('Logo atualizada!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar logo.');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const openPromoForm = (promo?: Promotion) => { setPromoImage(null); setPromoForm({
    open: true, editing: promo || null,
    title: promo?.title || '', description: promo?.description || '',
    price: promo?.price != null ? String(promo.price) : '', discount_price: promo?.discount_price != null ? String(promo.discount_price) : '',
    valid_until: promo?.valid_until || '',
    image_url: promo?.image_url || '',
  }); };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || promoPreparing) return;
    if (!company) return;
    if (isMock) { toast.success('Promoção salva! (demo)'); setPromoForm(p => ({ ...p, open: false })); return; }
    const payload = {
      image_url: promoForm.image_url.trim() || null,
      title: promoForm.title.trim(),
      description: promoForm.description.trim(),
      price: promoForm.price ? Number(promoForm.price.replace(',', '.')) : null,
      discount_price: promoForm.discount_price ? Number(promoForm.discount_price.replace(',', '.')) : null,
      valid_until: promoForm.valid_until || null,
    };
    if (payload.price != null && payload.discount_price != null && payload.discount_price > payload.price) return toast.error('O preço promocional deve ser menor que o preço original.');
    if (payload.image_url && !/^https:\/\//i.test(payload.image_url)) return toast.error('A imagem da oferta deve usar um endereço HTTPS.');
    setSaving(true);
    try {
      if (promoImage) payload.image_url = await uploadImage('promotions',company.id,promoImage);
      if (promoForm.editing) await companiesService.updatePromotion(promoForm.editing.id, payload);
      else await companiesService.createPromotion({ ...payload, company_id: company.id });
      toast.success(promoForm.editing ? 'Promoção atualizada!' : 'Promoção publicada!');
      setPromoForm(p => ({ ...p, open: false }));
      setPromoImage(null);
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar promoção.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromo = async (promo: Promotion) => {
    if (!window.confirm(`Excluir a promoção "${promo.title}"?`)) return;
    if (isMock) return toast.success('Promoção excluída (demo)');
    try {
      await companiesService.deletePromotion(promo.id);
      toast.success('Promoção excluída.');
      await load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSponsorContact = () => {
    window.open(commercialLink(company?.name), '_blank', 'noopener,noreferrer');
  };

  const openResume = async (path: string | null | undefined) => {
    if (!path) return;
    try { await openDocument(() => candidatesService.getResumeSignedUrl(path)); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível abrir o currículo.'); }
  };

  // ------------------------------------------------------------------ render
  if (loading) return <PageLoader label="Carregando painel da empresa..." />;

  if (!company) {
    return (
      <S.DashboardContainer>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
          <Building2 size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Empresa não encontrada</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Não encontramos uma empresa vinculada à sua conta ({profile?.email}). Tente novamente ou entre em contato com o suporte em fabiosena1436@gmail.com.
          </p>
          <F.Btn onClick={() => load()}><RefreshCw size={16} /> Tentar novamente</F.Btn>
        </div>
      </S.DashboardContainer>
    );
  }

  const renderCandidateRow = (app: AppWithCandidate, showJob = false) => {
    const cand = app.candidate;
    const details = app.candidate_details;
    const skills = (details?.skills || []).map(s => s.skill?.name).filter(Boolean);
    const job = jobs.find(j => j.id === app.job_id);
    return (
      <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', padding: '1rem', background: 'white', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: '1 1 240px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: cand?.avatar_url ? `url(${cand.avatar_url}) center/cover` : '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            {!cand?.avatar_url && (cand?.full_name || '?').charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', margin: 0 }}>
              {cand?.full_name || 'Candidato'}
              <F.StatusBadge $status={app.status}>{APPLICATION_STATUS_LABEL[app.status]}</F.StatusBadge>
            </p>
            <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0.1rem 0 0' }}>
              {details?.profession || 'Profissão não informada'}{cand?.city ? ` • ${cand.city}` : ''}
            </p>
            {showJob && job && <p style={{ fontSize: '0.75rem', color: '#2563eb', margin: '0.15rem 0 0' }}>Vaga: {job.title}</p>}
            {skills.length > 0 && <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0' }}>Habilidades: {skills.slice(0, 4).join(', ')}{skills.length > 4 ? '…' : ''}</p>}
            {app.cover_letter && <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.4rem 0 0', fontStyle: 'italic' }}>“{app.cover_letter.slice(0, 160)}{app.cover_letter.length > 160 ? '…' : ''}”</p>}
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>Candidatura em {new Date(app.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            disabled={app.status === 'desistiu'}
            value={app.status}
            onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
            aria-label="Status da candidatura"
            style={{ padding: '0.45rem 0.6rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '1rem', background: 'white' }}
          >
            {app.status === 'desistiu' && <option value="desistiu">Desistiu</option>}
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</option>)}
          </select>
          {cand?.phone && (
            <a href={`https://wa.me/${(cand.phone.startsWith('55') ? '' : '55') + cand.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{ display: 'flex', padding: '0.5rem', borderRadius: 6, background: '#25D366', color: 'white' }}>
              <Phone size={16} />
            </a>
          )}
          {details?.resume_url && (
            <button onClick={() => openResume(details.resume_url)} title="Currículo" style={{ display: 'flex', padding: '0.5rem', borderRadius: 6, background: '#eff6ff', color: '#2563eb', border: 'none', cursor: 'pointer' }}>
              <FileText size={16} />
            </button>
          )}
          <F.Btn disabled={app.status === 'desistiu'} onClick={() => navigate(`/candidato/${app.candidate_id}?app=${app.id}`)} style={{ padding: '0.5rem 0.9rem' }}>
            <User size={16} /> Perfil
          </F.Btn>
        </div>
      </div>
    );
  };

  return (
    <S.DashboardContainer>
      <S.Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label title="Alterar logo" style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, background: company.logo_url ? `url(${company.logo_url}) center/cover` : '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!company.logo_url && <Building2 size={28} />}
            </div>
            <span style={{ position: 'absolute', bottom: -4, right: -4, background: 'white', borderRadius: '50%', padding: 4, boxShadow: '0 1px 3px rgba(0,0,0,.2)', display: 'flex' }}><Camera size={14} color="#2563eb" /></span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} aria-label="Alterar imagem do perfil" style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'pointer' }} disabled={saving} />
          </label>
          <div>
            <S.Greeting style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {company.name}
              {company.is_sponsor && <Star size={20} fill="#fbbf24" color="#fbbf24" aria-label="Patrocinador" />}
            </S.Greeting>
            <p>Acompanhe o desempenho das suas vagas e o seu perfil.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <S.CreateJobButton onClick={() => navigate('/empresa/vaga/nova')}>
            <PlusCircle size={20} />
            <span>Nova Vaga</span>
          </S.CreateJobButton>
          <F.Btn $variant="danger" onClick={handleLogout}><LogOut size={18} /> Sair</F.Btn>
        </div>
      </S.Header>

      <S.TabsContainer>
        <S.TabButton aria-pressed={activeTab === 'overview'} $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}><LayoutDashboard size={20} /> Visão Geral</S.TabButton>
        <S.TabButton aria-pressed={activeTab === 'candidates'} $active={activeTab === 'candidates'} onClick={() => setActiveTab('candidates')}>
          <Inbox size={20} /> Candidatos
          {newApplications > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: 999, fontSize: '0.7rem', padding: '0.1rem 0.45rem' }}>{newApplications}</span>}
        </S.TabButton>
        <S.TabButton aria-pressed={activeTab === 'profile'} $active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}><Building2 size={20} /> Perfil da Empresa</S.TabButton>
      </S.TabsContainer>

      {/* ------------------------------ VISÃO GERAL ------------------------------ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <S.MetricsGrid>
            <S.MetricCard>
              <div className="icon"><Briefcase size={24} color="#2563eb" /></div>
              <div className="info"><h3>{jobs.filter(j => j.status === 'Ativa').length}</h3><p>Vagas Ativas</p></div>
            </S.MetricCard>
            <S.MetricCard>
              <div className="icon"><Eye size={24} color="#10b981" /></div>
              <div className="info"><h3>{(metrics?.total_views ?? jobs.reduce((s, j) => s + (j.views_count || 0), 0)).toLocaleString('pt-BR')}</h3><p>Visualizações de vagas</p></div>
            </S.MetricCard>
            <S.MetricCard>
              <div className="icon"><Users size={24} color="#f59e0b" /></div>
              <div className="info"><h3>{metrics?.total_applications ?? applications.length}</h3><p>Candidatos{metrics?.applications_last_7d ? ` (+${metrics.applications_last_7d} na semana)` : ''}</p></div>
            </S.MetricCard>
          </S.MetricsGrid>

          <SponsorReport companyId={company.id}/>

          {company.is_sponsor && (
            <S.Section style={{ marginTop: 0 }}>
              <S.PromoHeader>
                <div>
                  <S.SectionTitle style={{ marginBottom: 0 }}>Produtos, serviços e ofertas</S.SectionTitle>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>Você está usando {promotions.length} de {MAX_PROMOTIONS} espaços de promoções.</p>
                </div>
                <S.AddPromoButton disabled={promotions.length >= MAX_PROMOTIONS} onClick={() => openPromoForm()}>
                  <Tag size={18} /> Nova Promoção
                </S.AddPromoButton>
              </S.PromoHeader>

              {promoForm.open && (
                <form onSubmit={handleSavePromo} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <F.FieldRow>
                    <F.Field><label htmlFor="company-field-1">Título</label><input id="company-field-1" required minLength={3} maxLength={120} value={promoForm.title} onChange={e => setPromoForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Arroz 5kg" /></F.Field>
                    <F.Field $basis="160px"><label htmlFor="company-field-2">Válido até</label><input id="company-field-2" type="date" value={promoForm.valid_until} onChange={e => setPromoForm(p => ({ ...p, valid_until: e.target.value }))} /></F.Field>
                  </F.FieldRow>
                  <F.Field><label htmlFor="company-field-3">Descrição</label><textarea id="company-field-3" required rows={2} value={promoForm.description} onChange={e => setPromoForm(p => ({ ...p, description: e.target.value }))} /></F.Field>
                  <ImagePicker id="offer-image" label="Foto da oferta (opcional)" url={promoForm.image_url} file={promoImage} onChange={(url,file)=>{setPromoForm(p=>({...p,image_url:url}));setPromoImage(file);}} disabled={saving} onPreparing={setPromoPreparing}/>
                  <F.FieldRow>
                    <F.Field $basis="160px"><label htmlFor="company-field-4">Preço original (R$)</label><input id="company-field-4" inputMode="decimal" value={promoForm.price} onChange={e => setPromoForm(p => ({ ...p, price: e.target.value }))} placeholder="25,90" /></F.Field>
                    <F.Field $basis="160px"><label htmlFor="company-field-5">Preço promocional (R$)</label><input id="company-field-5" inputMode="decimal" value={promoForm.discount_price} onChange={e => setPromoForm(p => ({ ...p, discount_price: e.target.value }))} placeholder="19,90" /></F.Field>
                  </F.FieldRow>
                  <F.Actions>
                    <F.Btn type="submit" $variant="success" disabled={saving||promoPreparing}><Save size={16} /> {promoForm.editing ? 'Salvar' : 'Publicar'}</F.Btn>
                    <F.Btn type="button" $variant="ghost" disabled={saving||promoPreparing} onClick={() => {setPromoForm(p => ({ ...p, open: false }));setPromoImage(null);}}>Cancelar</F.Btn>
                  </F.Actions>
                </form>
              )}

              {promotions.length > 0 ? (
                <S.PromoList>
                  {promotions.map(promo => (
                    <S.PromoItem key={promo.id}>
                      <div>
                        <h4>{promo.title}</h4>
                        <p>{promo.description}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', marginTop: '0.5rem' }}>
                          {promo.price != null && <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.8rem' }}>R$ {Number(promo.price).toFixed(2)}</span>}
                          {promo.discount_price != null && <strong style={{ color: '#16a34a' }}>R$ {Number(promo.discount_price).toFixed(2)}</strong>}
                        </div>
                        {promo.valid_until && <small style={{ color: '#94a3b8' }}>Até {new Date(promo.valid_until + 'T00:00:00').toLocaleDateString('pt-BR')}</small>}
                      </div>
                      <div className="actions" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button aria-label={`Editar oferta ${promo.title}`} disabled={saving} onClick={() => openPromoForm(promo)} style={{ flex: 1, padding: '0.4rem', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}><Edit2 size={16} style={{ margin: '0 auto' }} /></button>
                        <button aria-label={`Excluir oferta ${promo.title}`} disabled={saving} onClick={() => handleDeletePromo(promo)} style={{ flex: 1, padding: '0.4rem', borderRadius: 6, border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} style={{ margin: '0 auto' }} /></button>
                      </div>
                    </S.PromoItem>
                  ))}
                </S.PromoList>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #cbd5e1', borderRadius: 12 }}>
                  <p style={{ color: '#64748b' }}>Nenhuma promoção cadastrada. Publique ofertas para atrair clientes!</p>
                </div>
              )}
            </S.Section>
          )}

          <S.Section style={{ marginTop: 0 }}>
            <S.SectionTitle>Suas Vagas ({jobs.length})</S.SectionTitle>
            {jobs.length === 0 ? (
              <div style={{ background: 'white', padding: '2rem', textAlign: 'center', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                <Briefcase size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>Você ainda não publicou nenhuma vaga.</p>
                <F.Btn onClick={() => navigate('/empresa/vaga/nova')}><PlusCircle size={18} /> Publicar primeira vaga</F.Btn>
              </div>
            ) : (
              <S.JobList>
                {jobs.map(job => {
                  const jobApps = appsByJob[job.id] || [];
                  const isOpen = expandedJob === job.id;
                  const isActive = job.status === 'Ativa';
                  return (
                    <div key={job.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', opacity: isActive ? 1 : 0.75 }}>
                      <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button type="button" aria-expanded={isOpen} aria-controls={`applications-${job.id}`} onClick={() => setExpandedJob(isOpen ? null : job.id)} style={{ color: 'inherit', font: 'inherit', fontWeight: 600, textAlign: 'left' }}>{job.title}</button>
                            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: isActive ? '#dcfce7' : '#fee2e2', color: isActive ? '#166534' : '#991b1b', fontWeight: 600 }}>{job.status.toUpperCase()}</span>
                          </h4>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#64748b' }}>
                            <span style={{ background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: 4 }}>{job.type}</span>
                            <span style={{ background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: 4 }}>{job.salary_text}</span>
                            <span style={{ background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: 4 }}>Publicada em {new Date(job.posted_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}><Eye size={16} /> {job.views_count || 0}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}><Users size={16} /> {jobApps.length || job.applications_count || 0}</span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button disabled={job.status === 'Rascunho'} onClick={(e) => { e.stopPropagation(); navigate(`/vagas/${job.id}`); }} title={job.status === 'Rascunho' ? 'Publique para ver a página pública' : 'Ver vaga pública'} style={{ padding: '0.4rem', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex' }}><Eye size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/empresa/vaga/${job.id}/editar`); }} title="Editar" style={{ padding: '0.4rem', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex' }}><Edit2 size={16} /></button>
                            <button onClick={(e) => handleToggleJobStatus(e, job)} title={isActive ? 'Encerrar' : job.status === 'Rascunho' ? 'Publicar' : 'Reabrir'} style={{ padding: '0.4rem', borderRadius: 6, border: `1px solid ${isActive ? '#fee2e2' : '#dcfce7'}`, background: isActive ? '#fef2f2' : '#f0fdf4', color: isActive ? '#ef4444' : '#10b981', cursor: 'pointer', display: 'flex' }}>{isActive ? <Ban size={16} /> : <RefreshCw size={16} />}</button>
                            <button onClick={(e) => handleDeleteJob(e, job)} title="Excluir" style={{ padding: '0.4rem', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}><Trash2 size={16} /></button>
                          </div>
                          {isOpen ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                        </div>
                      </div>

                      {isOpen && (
                        <div id={`applications-${job.id}`} style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                          <h5 style={{ fontSize: '0.875rem', color: '#64748b', margin: '1rem 0' }}>Candidatos que aplicaram ({jobApps.length}):</h5>
                          {jobApps.length === 0 ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Nenhuma candidatura ainda. Compartilhe o link da vaga para alcançar mais pessoas!</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{jobApps.map(a => renderCandidateRow(a))}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </S.JobList>
            )}
          </S.Section>
          {!company.is_sponsor && <S.UpsellBanner>
            <h3><Star size={20} /> Divulgue sua empresa</h3>
            <p>Conheça as opções de destaque e divulgação de promoções no Conecta Jovens.</p>
            <button onClick={handleSponsorContact}>Falar com a equipe</button>
          </S.UpsellBanner>}
        </div>
      )}

      {/* ------------------------------ CANDIDATOS ------------------------------ */}
      {activeTab === 'candidates' && (
        <S.Section style={{ marginTop: 0 }}>
          <S.SectionTitle>Todas as candidaturas ({applications.length})</S.SectionTitle>
          {applications.length === 0 ? (
            <div style={{ background: 'white', padding: '2rem', textAlign: 'center', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
              <Inbox size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: '#64748b' }}>Nenhuma candidatura recebida até o momento.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{applications.map(a => renderCandidateRow(a, true))}</div>
          )}
        </S.Section>
      )}

      {/* ------------------------------ PERFIL ------------------------------ */}
      {activeTab === 'profile' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <S.SectionTitle style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building2 size={24} /> Editar Perfil da Empresa</S.SectionTitle>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Mantenha as informações da sua empresa atualizadas para atrair os melhores talentos.{' '}
              <button onClick={() => navigate(`/empresas/${company.id}`)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, font: 'inherit' }}>Ver página pública →</button>
            </p>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <F.FieldRow>
              <F.Field><label htmlFor="company-field-6">Nome da Empresa</label><input id="company-field-6" required minLength={2} value={profileData.name} onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))} /></F.Field>
              <F.Field $basis="220px">
                <label htmlFor="company-field-7">Ramo de atuação</label>
                <select id="company-field-7" value={profileData.industry} onChange={e => setProfileData(p => ({ ...p, industry: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {[...INDUSTRIES, ...(profileData.industry && !INDUSTRIES.includes(profileData.industry) ? [profileData.industry] : [])].map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </F.Field>
            </F.FieldRow>
            <F.Field><label htmlFor="company-field-8">Slogan</label><input id="company-field-8" maxLength={200} value={profileData.slogan} onChange={e => setProfileData(p => ({ ...p, slogan: e.target.value }))} placeholder="Ex: Qualidade e preço baixo para a sua família." /></F.Field>
            <F.Field><label htmlFor="company-logo-url">Logo (URL HTTPS)</label><input id="company-logo-url" type="url" value={profileData.logo_url} onChange={e=>setProfileData(p=>({...p,logo_url:e.target.value}))} placeholder="https://.../logo.png"/><small>Você também pode enviar uma imagem pelo botão de foto no topo do painel.</small></F.Field>
            {company.is_sponsor&&<ImagePicker id="company-banner" label="Foto de capa (opcional)" url={profileData.banner_url} file={bannerImage} onChange={(url,file)=>{setProfileData(p=>({...p,banner_url:url}));setBannerImage(file);}} disabled={saving} onPreparing={setBannerPreparing}/>}
            <F.FieldRow>
              <F.Field><label htmlFor="company-field-9">Endereço / Bairro</label><input id="company-field-9" value={profileData.location} onChange={e => setProfileData(p => ({ ...p, location: e.target.value }))} placeholder="Ex: Centro, Teodoro Sampaio" /></F.Field>
              <F.Field><label htmlFor="company-field-10">Site ou Rede Social</label><input id="company-field-10" value={profileData.website} onChange={e => setProfileData(p => ({ ...p, website: e.target.value }))} placeholder="https://suaempresa.com.br" /></F.Field>
            </F.FieldRow>
            <F.FieldRow>
              <F.Field><label htmlFor="company-field-11">E-mail de contato (RH)</label><input id="company-field-11" type="email" required value={profileData.contact_email} onChange={e => setProfileData(p => ({ ...p, contact_email: e.target.value }))} /></F.Field>
              <F.Field><label htmlFor="company-field-12">WhatsApp da empresa</label><input id="company-field-12" type="tel" value={profileData.phone} onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))} placeholder="(18) 99999-9999" /></F.Field>
            </F.FieldRow>
            <F.Field>
              <label htmlFor="company-field-13">Descrição da Empresa</label>
              <textarea id="company-field-13" rows={5} maxLength={5000} value={profileData.description} onChange={e => setProfileData(p => ({ ...p, description: e.target.value }))} placeholder="Conte um pouco sobre a história e os valores da empresa..." />
              <small>{profileData.description.length}/5000</small>
            </F.Field>
            <F.Actions>
              <F.Btn type="submit" disabled={saving||bannerPreparing}><Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}</F.Btn>
            </F.Actions>
          </form>
        </section>
      )}
    </S.DashboardContainer>
  );
}
