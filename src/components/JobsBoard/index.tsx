import { useState } from 'react';
import { jobsMock } from '../../data/jobs';
import { companiesMock } from '../../data/companies';
import { CardJob } from '../CardJob';
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

  let filteredJobs = jobsMock.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || job.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort so that sponsored jobs appear first
  filteredJobs.sort((a, b) => {
    const companyA = companiesMock.find(c => c.id === a.companyId);
    const companyB = companiesMock.find(c => c.id === b.companyId);
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
        {filteredJobs.length > 0 ? (
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
