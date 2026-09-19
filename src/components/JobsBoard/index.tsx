import { useState, useEffect } from 'react';
import type { Job } from '../../data/jobs';
import { apiService } from '../../services/api';
import { CardJob } from '../CardJob';
import { CardJobSkeleton } from '../CardJobSkeleton';
import { Search, X } from 'lucide-react';
import * as S from './styles';

interface JobsBoardProps {
  maxItems?: number;
  hideSearch?: boolean;
}

const CATEGORIES = ['Todos', 'Presencial', 'Remoto', 'Híbrido', 'Estágio', 'Jovem Aprendiz', 'Freelancer', 'Temporário'];

function useDebounce<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function JobsBoard({ maxItems, hideSearch = false }: JobsBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchTerm.trim());

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const fetched = await apiService.getJobs({
          search: debouncedSearch || undefined,
          type: selectedCategory === 'Todos' ? undefined : selectedCategory,
          limit: maxItems && !debouncedSearch && selectedCategory === 'Todos' ? maxItems : 100,
        });
        if (!cancelled) setJobs(fetched);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        if (!cancelled) setError('Não foi possível carregar as vagas. Tente novamente.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [debouncedSearch, selectedCategory, maxItems]);

  const visible = maxItems && !debouncedSearch && selectedCategory === 'Todos' ? jobs.slice(0, maxItems) : jobs;

  return (
    <S.BoardContainer>
      {!hideSearch && (
        <S.SearchContainer>
          <S.SearchInputWrapper>
            <Search size={20} color="#64748b" />
            <input
              type="search"
              aria-label="Buscar vagas"
              placeholder="Buscar por cargo, palavra-chave ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button type="button" aria-label="Limpar busca" onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                <X size={18} />
              </button>
            )}
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
          Array.from({ length: maxItems || 6 }).map((_, index) => <CardJobSkeleton key={index} />)
        ) : error ? (
          <S.EmptyState><p>{error}</p></S.EmptyState>
        ) : visible.length > 0 ? (
          visible.map(job => <CardJob key={job.id} job={job} />)
        ) : (
          <S.EmptyState>
            <p>
              {debouncedSearch || selectedCategory !== 'Todos'
                ? 'Nenhuma vaga encontrada com os filtros atuais.'
                : 'Ainda não há vagas publicadas. Volte em breve!'}
            </p>
          </S.EmptyState>
        )}
      </S.JobsGrid>
    </S.BoardContainer>
  );
}
