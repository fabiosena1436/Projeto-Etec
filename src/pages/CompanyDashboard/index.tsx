import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Eye, Users, Briefcase, Tag, Trash2, Edit2, Star, CheckCircle2, ChevronDown, ChevronUp, User, Ban, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { jobsMock } from '../../data/jobs';
import { companiesMock } from '../../data/companies';
import { usersMock } from '../../data/users';
import * as S from './styles';

export function CompanyDashboard() {
  const navigate = useNavigate();
  // Simula a empresa logada (empresa 3 no mock - Não Patrocinadora)
  const company = companiesMock.find(c => c.id === 'comp-3')!;
  
  // Usar state para podermos simular a alteração de status da vaga
  const [myJobs, setMyJobs] = useState(jobsMock.filter(j => j.companyId === company.id));
  
  const promotions = company.promotions || [];
  const maxPromotions = 6;
  const canAddMorePromos = promotions.length < maxPromotions;

  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const toggleJob = (jobId: string) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
    } else {
      setExpandedJob(jobId);
    }
  };

  const handleToggleJobStatus = (e: React.MouseEvent, jobId: string, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'Ativa' ? 'Encerrada' : 'Ativa';
    
    setMyJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: newStatus as 'Ativa' | 'Encerrada' } : job
    ));

    toast.success(newStatus === 'Ativa' ? 'Vaga reaberta com sucesso!' : 'Vaga encerrada com sucesso!');
  };

  const handleEditJob = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    navigate(`/empresa/vaga/${jobId}/editar`);
  };

  return (
    <S.DashboardContainer>
      <S.Header>
        <div>
          <S.Greeting>Olá, {company.name}</S.Greeting>
          <p>Acompanhe o desempenho das suas vagas.</p>
        </div>
        <S.CreateJobButton onClick={() => navigate('/empresa/vaga/nova')}>
          <PlusCircle size={20} />
          <span>Nova Vaga</span>
        </S.CreateJobButton>
      </S.Header>

      <S.MetricsGrid>
        <S.MetricCard>
          <div className="icon"><Briefcase size={24} color="#2563eb" /></div>
          <div className="info">
            <h3>{myJobs.filter(j => j.status === 'Ativa').length}</h3>
            <p>Vagas Ativas</p>
          </div>
        </S.MetricCard>
        <S.MetricCard>
          <div className="icon"><Eye size={24} color="#10b981" /></div>
          <div className="info">
            <h3>1.245</h3>
            <p>Visualizações</p>
          </div>
        </S.MetricCard>
        <S.MetricCard>
          <div className="icon"><Users size={24} color="#f59e0b" /></div>
          <div className="info">
            <h3>48</h3>
            <p>Candidatos</p>
          </div>
        </S.MetricCard>
      </S.MetricsGrid>

      {/* Banner de Upsell para NÃO patrocinadores */}
      {!company.isSponsor && (
        <S.UpsellBanner>
          <h3><Star size={24} fill="#fbbf24" color="#fbbf24" /> Torne-se uma Empresa Patrocinadora!</h3>
          <p>
            Destaque sua marca e alcance milhares de candidatos e clientes na nossa página inicial. 
            Como Patrocinador Oficial, você ganha visibilidade premium e ferramentas exclusivas de vendas.
          </p>
          <ul>
            <li><CheckCircle2 size={18} color="#4ade80" /> Sua logo no Carrossel Principal da página inicial.</li>
            <li><CheckCircle2 size={18} color="#4ade80" /> Página de perfil exclusiva da sua loja.</li>
            <li><CheckCircle2 size={18} color="#4ade80" /> Cadastro de até 6 produtos em promoção para atrair clientes.</li>
            <li><CheckCircle2 size={18} color="#4ade80" /> Selo de "Empresa Parceira" nas suas vagas.</li>
          </ul>
          <button onClick={() => alert('Abriria o modal de contato com a equipe comercial')}>
            Quero ser Patrocinador
          </button>
        </S.UpsellBanner>
      )}

      {/* Seção Exclusiva para Patrocinadores */}
      {company.isSponsor && (
        <S.Section>
          <S.PromoHeader>
            <div>
              <S.SectionTitle style={{ marginBottom: 0 }}>Gerenciar Promoções</S.SectionTitle>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Você está usando {promotions.length} de {maxPromotions} vagas de promoções.
              </p>
            </div>
            <S.AddPromoButton disabled={!canAddMorePromos} onClick={() => alert('Abriria o modal de Nova Promoção')}>
              <Tag size={18} />
              Nova Promoção
            </S.AddPromoButton>
          </S.PromoHeader>

          {promotions.length > 0 ? (
            <S.PromoList>
              {promotions.map(promo => (
                <S.PromoItem key={promo.id}>
                  <div>
                    <h4>{promo.title}</h4>
                    <p>{promo.description}</p>
                    {promo.discountPrice && <div className="price">R$ {promo.discountPrice.toFixed(2)}</div>}
                  </div>
                  <div className="actions">
                    <button><Edit2 size={16} style={{ margin: '0 auto' }} /></button>
                    <button className="delete"><Trash2 size={16} style={{ margin: '0 auto' }} /></button>
                  </div>
                </S.PromoItem>
              ))}
            </S.PromoList>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
              <p style={{ color: '#64748b' }}>Nenhuma promoção cadastrada no momento.</p>
            </div>
          )}
        </S.Section>
      )}

      <S.Section>
        <S.SectionTitle>Suas Vagas Recentes</S.SectionTitle>
        <S.JobList style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myJobs.map(job => (
            <div key={job.id} style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.2s',
              opacity: job.status === 'Encerrada' ? 0.7 : 1
            }}>
              <div 
                style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => toggleJob(job.id)}
              >
                <div className="job-info">
                  <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {job.title}
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '0.1rem 0.4rem', 
                      borderRadius: '4px',
                      background: job.status === 'Ativa' ? '#dcfce7' : '#fee2e2',
                      color: job.status === 'Ativa' ? '#166534' : '#991b1b',
                      fontWeight: 600
                    }}>
                      {job.status.toUpperCase()}
                    </span>
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="type" style={{ fontSize: '0.75rem', background: '#f8fafc', color: '#64748b', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>{job.type}</span>
                  </div>
                </div>
                
                <div className="job-stats" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}><Users size={16} /> 2 candidatos</span>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button 
                      onClick={(e) => handleEditJob(e, job.id)}
                      style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Editar Vaga"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleToggleJobStatus(e, job.id, job.status)}
                      style={{ padding: '0.4rem', borderRadius: '6px', border: `1px solid ${job.status === 'Ativa' ? '#fee2e2' : '#dcfce7'}`, background: job.status === 'Ativa' ? '#fef2f2' : '#f0fdf4', color: job.status === 'Ativa' ? '#ef4444' : '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title={job.status === 'Ativa' ? 'Encerrar Vaga' : 'Reabrir Vaga'}
                    >
                      {job.status === 'Ativa' ? <Ban size={16} /> : <RefreshCw size={16} />}
                    </button>
                  </div>

                  {expandedJob === job.id ? <ChevronUp size={20} color="#64748b" style={{ marginLeft: '0.5rem' }} /> : <ChevronDown size={20} color="#64748b" style={{ marginLeft: '0.5rem' }} />}
                </div>
              </div>

              {expandedJob === job.id && (
                <div style={{ padding: '1.25rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <h5 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>Candidatos que aplicaram:</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Mock de candidatos usando usersMock (2 primeiros para exemplificar) */}
                    {usersMock.slice(0, 2).map((candidate) => (
                      <div key={candidate.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={candidate.avatarUrl} alt={candidate.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <p style={{ fontWeight: 500, color: '#0f172a' }}>{candidate.name}</p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{candidate.profession}</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/candidato/${candidate.id}?viewer=recruiter`);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontWeight: 500, fontSize: '0.875rem', padding: '0.5rem 1rem', background: '#eff6ff', borderRadius: '6px' }}
                        >
                          <User size={16} />
                          Ver Perfil Completo
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </S.JobList>
      </S.Section>
    </S.DashboardContainer>
  );
}
