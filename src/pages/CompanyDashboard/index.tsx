import { useNavigate } from 'react-router-dom';
import { PlusCircle, Eye, Users, Briefcase, Tag, Trash2, Edit2, Star, CheckCircle2 } from 'lucide-react';
import { jobsMock } from '../../data/jobs';
import { companiesMock } from '../../data/companies';
import * as S from './styles';

export function CompanyDashboard() {
  const navigate = useNavigate();
  // Simula a empresa logada (empresa 3 no mock - Não Patrocinadora)
  const company = companiesMock.find(c => c.id === 'comp-3')!;
  const myJobs = jobsMock.filter(j => j.companyId === company.id);
  const promotions = company.promotions || [];
  const maxPromotions = 6;
  const canAddMorePromos = promotions.length < maxPromotions;

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
            <h3>{myJobs.length}</h3>
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
        <S.JobList>
          {myJobs.map(job => (
            <div key={job.id} style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} onClick={() => navigate(`/vagas/${job.id}`)}>
              <div className="job-info">
                <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem' }}>{job.title}</h4>
                <span className="type" style={{ fontSize: '0.75rem', background: '#f8fafc', color: '#64748b', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>{job.type}</span>
              </div>
              <div className="job-stats" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}><Users size={16} /> 12 candidatos</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}><Eye size={16} /> 340 vis.</span>
              </div>
            </div>
          ))}
        </S.JobList>
      </S.Section>
    </S.DashboardContainer>
  );
}
