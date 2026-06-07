import { useState, useEffect } from 'react';
import type { Job } from '../../data/jobs';
import type { Company } from '../../data/companies';
import { apiService } from '../../services/api';
import { CardJob } from '../CardJob';
import { CardJobSkeleton } from '../CardJobSkeleton';
import { Search } from 'lucide-react';
import * as S from './styles';

interface JobsBoardProps {
  maxItems?: number;
  hideSearch?: boolean;
}

const CATEGORIES = ['Todos', 'Presencial', 'Remoto', 'Estágio', 'Jovem Aprendiz', 'Freelancer'];

export function JobsBoard({ maxItems, hideSearch = false }: JobsBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [fetchedJobs, fetchedCompanies] = await Promise.all([
          apiService.getJobs(),
          apiService.getCompanies()
        ]);
        setJobs(fetchedJobs);
        setCompanies(fetchedCompanies);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  let filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || job.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort so that sponsored jobs appear first
  filteredJobs.sort((a, b) => {
    const companyA = companies.find(c => c.id === a.companyId);
    const companyB = companies.find(c => c.id === b.companyId);
    const isSponsorA = companyA?.isSponsor ? 1 : 0;
    const isSponsorB = companyB?.isSponsor ? 1 : 0;
    return isSponsorB - isSponsorA;
  });

  if (maxItems && !searchTerm && selectedCategory === 'Todos') {
    filteredJobs = filteredJobs.slice(0, maxItems);
  }

  return (
    <S.BoardContainer>
      {!hideSearch && (
        <S.SearchContainer>
          <S.SearchInputWrapper>
            <Search size={20} color="#64748b" />
            <input 
              type="text" 
              placeholder="Buscar por cargo, palavra-chave ou empresa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </S.SearchInputWrapper>
          
          <S.FilterContainer>
            {CATEGORIES.map(category => (
              <S.FilterButton
                key={category}
                $active={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </S.FilterButton>
            ))}
          </S.FilterContainer>
        </S.SearchContainer>
      )}

      <S.JobsGrid>
        {isLoading ? (
          Array.from({ length: maxItems || 6 }).map((_, index) => (
            <CardJobSkeleton key={index} />
          ))
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <CardJob key={job.id} job={job} />
          ))
        ) : (
          <S.EmptyState>
            <p>Nenhuma vaga encontrada com os filtros atuais.</p>
          </S.EmptyState>
        )}
      </S.JobsGrid>
    </S.BoardContainer>
  );
}
