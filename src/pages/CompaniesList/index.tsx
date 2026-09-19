import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { apiService } from '../../services/api';
import type { Company } from '../../data/companies';
import * as S from './styles';

export function CompaniesList() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchCompanies() {
      setIsLoading(true);
      try {
        const data = await apiService.getCompanies();
        setCompanies(data);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  const filtered = companies.filter(c => {
    const q = search.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q);
  });

  return (
    <S.Container>
      <S.Header>
        <h1>Empresas Parceiras</h1>
        <p>Conheça as empresas de Teodoro Sampaio que estão contratando.</p>
      </S.Header>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.6rem 0.9rem', marginBottom: '1.5rem', maxWidth: 480 }}>
        <Search size={18} color="#64748b" />
        <input
          type="search"
          aria-label="Buscar empresas"
          placeholder="Buscar por nome ou ramo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.95rem', background: 'transparent' }}
        />
      </div>

      <S.Grid>
        {isLoading ? (
          <p>Carregando empresas...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#64748b' }}>Nenhuma empresa encontrada.</p>
        ) : (
          filtered.map(company => (
            <S.CompanyCard key={company.id}>
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} loading="lazy" />
              ) : (
                <div className="placeholder">{company.name.charAt(0)}</div>
              )}
              <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                {company.name}
                {company.isSponsor && <Star size={14} fill="#fbbf24" color="#fbbf24" aria-label="Empresa parceira" />}
              </h3>
              <span className="industry">{company.industry}</span>
              <p className="desc">{company.description || company.location}</p>
              <button onClick={() => navigate(`/empresas/${company.id}`)}>
                Ver vagas da empresa
              </button>
            </S.CompanyCard>
          ))
        )}
      </S.Grid>
    </S.Container>
  );
}