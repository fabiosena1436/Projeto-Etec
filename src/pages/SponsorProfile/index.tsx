import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tag, ArrowLeft, Percent, Briefcase } from 'lucide-react';
import { apiService } from '../../services/api';
import type { Company } from '../../data/companies';
import type { Job } from '../../data/jobs';
import { CardJob } from '../../components/CardJob';
import * as S from './styles';

export function SponsorProfile() {
  const { id } = useParams();
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
          // O ideal seria um endpoint específico, mas usando mock:
          const allJobs = await apiService.getJobs();
          setCompanyJobs(allJobs.filter(job => job.companyId === fetchedCompany.id));
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
        <Link to="/">Voltar para o início</Link>
      </S.Container>
    );
  }

  // Limite de 6 promoções conforme solicitado
  const promotions = (company.promotions || []).slice(0, 6);

  return (
    <S.Container>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'inherit', textDecoration: 'none' }}>
        <ArrowLeft size={20} />
        Voltar
      </Link>
      
      <S.Header>
        <img src={company.logoUrl} alt={`Logo ${company.name}`} />
        <S.HeaderInfo>
          <h1>{company.name}</h1>
          {company.slogan && <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#2563eb' }}>"{company.slogan}"</p>}
          <p>{company.description}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Tag size={16} /> {company.industry}</span>
          </div>
        </S.HeaderInfo>
      </S.Header>

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

      <S.SectionTitle style={{ marginTop: '3rem' }}>
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
