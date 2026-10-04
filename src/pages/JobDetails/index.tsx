import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { applicationsService } from '../../services/supabase/applications.service';
import type { Job } from '../../data/jobs';
import type { Company } from '../../data/companies';
import { useAppliedJobs } from '../../hooks/useAppliedJobs';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../../components/PageLoader';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, Bookmark, BookmarkCheck, Share2, Eye, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import * as S from './styles';

const ghostBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%',
  padding: '0.75rem', background: 'white', color: '#334155', border: '1px solid #e2e8f0',
  borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
};

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasApplied, applyToJob } = useAppliedJobs();
  const { isAuthenticated, isCandidato, isEmpresa, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const fetchedJob = await apiService.getJobById(id);
        if (cancelled) return;
        if (fetchedJob) {
          setJob(fetchedJob);
          const fetchedCompany = await apiService.getCompanyById(fetchedJob.companyId);
          if (!cancelled) setCompany(fetchedCompany || null);
        }
      } catch (error) {
        console.error('Failed to fetch job details:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id || !isCandidato) return;
    applicationsService.isJobSaved(id).then(setSaved).catch(() => {});
  }, [id, isCandidato]);

  if (isLoading || authLoading) {
    return <S.Container><PageLoader label="Carregando vaga..." /></S.Container>;
  }

  if (!job) {
    return (
      <S.Container>
        <S.ErrorState>
          <h2>Vaga não encontrada</h2>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>Ela pode ter sido encerrada pela empresa.</p>
          <button onClick={() => navigate('/vagas')}>Voltar para vagas</button>
        </S.ErrorState>
      </S.Container>
    );
  }

  const applied = hasApplied(job.id);
  const isClosed = job.status !== 'Ativa';

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.info('Entre como candidato para se candidatar.');
      navigate('/login?type=candidato', { state: { from: `/vagas/${job.id}` } });
      return;
    }
    if (isEmpresa) {
      toast.error('Contas de empresa não podem se candidatar a vagas.');
      return;
    }
    if (!showCover) { setShowCover(true); return; }

    setApplying(true);
    try {
      await applyToJob(job.id, coverLetter.trim() || undefined);
      toast.success('Candidatura enviada com sucesso!', {
        description: 'A empresa receberá seu perfil e poderá entrar em contato.',
      });
      setShowCover(false);
    } catch (err: any) {
      toast.error(err.message || 'Não foi possível enviar a candidatura.');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login?type=candidato', { state: { from: `/vagas/${job.id}` } });
      return;
    }
    try {
      const next = await applicationsService.toggleSaved(job.id);
      setSaved(next);
      toast.success(next ? 'Vaga salva!' : 'Vaga removida das salvas.');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar vaga.');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${job.title} - ${company?.name || 'Conecta Sampaio'}`;
    try {
      if (navigator.share) await navigator.share({ title: text, url });
      else { await navigator.clipboard.writeText(url); toast.success('Link copiado!'); }
    } catch { /* usuário cancelou */ }
  };

  return (
    <S.Container>
      <S.BackButton onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Voltar
      </S.BackButton>

      <S.ContentWrapper>
        <S.MainInfo>
          <S.Header>
            <div className="title-section">
              <h1>{job.title}</h1>
              <span className="status" style={isClosed ? { background: '#fee2e2', color: '#991b1b' } : undefined}>{job.status}</span>
            </div>

            <S.Tags>
              <div className="tag"><Briefcase size={18} />{job.type}</div>
              <div className="tag"><MapPin size={18} />{job.location}</div>
              <div className="tag"><DollarSign size={18} />{job.salary}</div>
              <div className="tag"><Calendar size={18} />Publicada em {new Date(job.postedAt).toLocaleDateString('pt-BR')}</div>
              {typeof job.viewsCount === 'number' && <div className="tag"><Eye size={18} />{job.viewsCount} visualizações</div>}
              {typeof job.applicationsCount === 'number' && <div className="tag"><Users size={18} />{job.applicationsCount} candidato(s)</div>}
            </S.Tags>
          </S.Header>

          <S.Section>
            <h2>Descrição da Vaga</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
          </S.Section>

          {job.requirements.length > 0 && (
            <S.Section>
              <h2>Requisitos</h2>
              <ul>{job.requirements.map((req, index) => <li key={index}>{req}</li>)}</ul>
            </S.Section>
          )}

          {job.benefits.length > 0 && (
            <S.Section>
              <h2>Benefícios</h2>
              <ul>{job.benefits.map((ben, index) => <li key={index}>{ben}</li>)}</ul>
            </S.Section>
          )}
        </S.MainInfo>

        <S.Sidebar>
          <S.CompanyCard>
            {company?.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={36} />
              </div>
            )}
            <h3>{company?.name || job.companyName || 'Empresa'}</h3>
            <p>{company?.industry}</p>
            {company?.description && <p className="description">{company.description}</p>}
            {company && (
              <Link to={`/empresas/${company.id}`} style={{ display: 'inline-block', marginTop: '0.75rem', color: '#2563eb', fontSize: '0.85rem', fontWeight: 600 }}>
                Ver perfil e outras vagas →
              </Link>
            )}
          </S.CompanyCard>

          {!isEmpresa && (
            <>
              {applied ? (
                <S.ApplyButton onClick={() => navigate('/candidato/painel')} style={{ background: '#16a34a' }}>
                  ✓ Você já se candidatou a essa vaga
                </S.ApplyButton>
              ) : isClosed ? (
                <S.ApplyButton disabled style={{ background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}>
                  Vaga encerrada
                </S.ApplyButton>
              ) : (
                <>
                  {showCover && (
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                        Mensagem para a empresa (opcional)
                      </label>
                      <textarea
                        rows={4}
                        maxLength={2000}
                        value={coverLetter}
                        onChange={e => setCoverLetter(e.target.value)}
                        placeholder="Conte brevemente por que você é a pessoa certa para esta vaga..."
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit' }}
                      />
                      <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#94a3b8' }}>{coverLetter.length}/2000</div>
                    </div>
                  )}
                  <S.ApplyButton onClick={handleApply} disabled={applying}>
                    {applying ? 'Enviando...' : showCover ? 'Confirmar candidatura' : 'Candidatar-se a esta vaga'}
                  </S.ApplyButton>
                  {showCover && (
                    <button type="button" onClick={() => setShowCover(false)} style={{ ...ghostBtn, border: 'none', color: '#64748b' }}>Cancelar</button>
                  )}
                </>
              )}

              <button type="button" onClick={handleToggleSave} style={{ ...ghostBtn, color: saved ? '#2563eb' : '#334155', borderColor: saved ? '#bfdbfe' : '#e2e8f0' }}>
                {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                {saved ? 'Vaga salva' : 'Salvar vaga'}
              </button>
            </>
          )}

          <button type="button" onClick={handleShare} style={ghostBtn}>
            <Share2 size={18} />
            Compartilhar
          </button>
        </S.Sidebar>
      </S.ContentWrapper>
    </S.Container>
  );
}
