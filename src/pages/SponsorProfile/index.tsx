import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Tag, ArrowLeft, Percent, Briefcase, MapPin, Globe, Mail, Building2 } from 'lucide-react';
import { apiService } from '../../services/api';
import type { Company } from '../../data/companies';
import type { Job } from '../../data/jobs';
import { CardJob } from '../../components/CardJob';
import * as S from './styles';

export function SponsorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const fetchedCompany = await apiService.getCompanyById(id);
        if (fetchedCompany) {
          setCompany(fetchedCompany);
          const jobs = await apiService.getJobsByCompany(fetchedCompany.id);
          setCompanyJobs(jobs.filter(j => j.status === 'Ativa').map(j => ({ ...j, companyName: fetchedCompany.name, companyLogoUrl: fetchedCompany.logoUrl, companyIsSponsor: fetchedCompany.isSponsor })));
        }
      } catch (error) {
        console.error("Failed to fetch sponsor details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <S.Container>
        <p>Carregando perfil do patrocinador...</p>
      </S.Container>
    );
  }

  if (!company) {
    return (
      <S.Container>
        <h2>Patrocinador não encontrado.</h2>
        <Link to="/empresas">Voltar para empresas</Link>
      </S.Container>
    );
  }

  // Limite de 6 promoções conforme solicitado
  const promotions = (company.promotions || []).slice(0, 6);

  return (
    <S.Container>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
        <ArrowLeft size={20} />
        Voltar
      </button>
      
      <S.Header>
        {company.logoUrl ? (
          <img src={company.logoUrl} alt={`Logo ${company.name}`} />
        ) : (
          <div style={{ width: 120, height: 120, borderRadius: 16, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={48} />
          </div>
        )}
        <S.HeaderInfo>
          <h1>{company.name}</h1>
          {company.slogan && <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#2563eb' }}>"{company.slogan}"</p>}
          {company.description && <p>{company.description}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem', color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Tag size={16} /> {company.industry}</span>
            {company.location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={16} /> {company.location}</span>}
            {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2563eb' }}><Globe size={16} /> Site</a>}
            {company.contactEmail && <a href={`mailto:${company.contactEmail}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2563eb' }}><Mail size={16} /> Contato</a>}
          </div>
        </S.HeaderInfo>
      </S.Header>

      {company.isSponsor && (
        <>
          <S.SectionTitle>
            <Percent color="#2563eb" /> Promoções do Dia
          </S.SectionTitle>

          {promotions.length > 0 ? (
        <S.PromoGrid>
          {promotions.map(promo => (
            <S.PromoCard key={promo.id}>
              <h3>{promo.title}</h3>
              <p>{promo.description}</p>
              
              <S.PriceContainer>
                {promo.price && <span className="old-price">R$ {promo.price.toFixed(2)}</span>}
                {promo.discountPrice && <span className="new-price">R$ {promo.discountPrice.toFixed(2)}</span>}
              </S.PriceContainer>
              
              {promo.validUntil && (
                <small style={{ marginTop: '0.5rem', color: '#64748b' }}>
                  Válido até: {new Date(promo.validUntil).toLocaleDateString('pt-BR')}
                </small>
              )}
            </S.PromoCard>
          ))}
        </S.PromoGrid>
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem 0', marginBottom: '2rem' }}>
              Este patrocinador não possui promoções cadastradas no momento.
            </p>
          )}
        </>
      )}

      <S.SectionTitle style={{ marginTop: company.isSponsor ? '3rem' : '1rem' }}>
        <Briefcase color="#2563eb" /> Vagas Abertas
      </S.SectionTitle>
      
      {companyJobs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {companyJobs.map(job => (
            <CardJob key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
          Esta empresa não possui vagas abertas no momento.
        </p>
      )}
    </S.Container>
  );
}
