import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Job } from '../../data/jobs';
import { apiService } from '../../services/api';
import { CardJob } from '../CardJob';
import { CardJobSkeleton } from '../CardJobSkeleton';
import { Search, X, BriefcaseBusiness, RefreshCw } from 'lucide-react';
import * as S from './styles';
import { useAuth } from '../../hooks/useAuth';

interface JobsBoardProps { maxItems?: number; hideSearch?: boolean; }
const CATEGORIES = ['Todos', 'Presencial', 'Remoto', 'Híbrido', 'Estágio', 'Jovem Aprendiz', 'Freelancer', 'Temporário'];
function useDebounce<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}
export function JobsBoard({ maxItems, hideSearch = false }: JobsBoardProps) {
  const { isAuthenticated, isEmpresa } = useAuth();
  const [params, setParams] = useSearchParams();
  const searchTerm = params.get('busca') || '';
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const debouncedSearch = useDebounce(searchTerm.trim());
  function updateSearch(value: string) {
    const next = new URLSearchParams(params);
    if(value) next.set('busca',value); else next.delete('busca');
    setParams(next,{replace:true,preventScrollReset:true});
  }
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true); setError(null);
    apiService.getJobs({search: debouncedSearch || undefined, type:selectedCategory === 'Todos' ? undefined : selectedCategory, limit:maxItems && !debouncedSearch && selectedCategory === 'Todos' ? maxItems : 100})
      .then(value => { if(!cancelled) setJobs(value); })
      .catch(() => { if(!cancelled) setError('Não foi possível carregar as vagas. Verifique sua conexão e tente novamente.'); })
      .finally(() => { if(!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedSearch,selectedCategory,maxItems,retry]);
  const filtered = Boolean(debouncedSearch || selectedCategory !== 'Todos');
  const visible = maxItems && !filtered ? jobs.slice(0,maxItems) : jobs;
  return <S.BoardContainer>
    {!hideSearch && <S.SearchContainer>
      <S.SearchInputWrapper><Search size={20} aria-hidden="true" />
        <input type="search" aria-label="Buscar vagas" placeholder="Buscar por cargo ou empresa" value={searchTerm} onChange={e => updateSearch(e.target.value)} />
        {searchTerm && <button type="button" aria-label="Limpar busca" onClick={() => updateSearch('')}><X size={18} /></button>}
      </S.SearchInputWrapper>
      <S.FilterContainer aria-label="Modalidade da vaga">{CATEGORIES.map(category => <S.FilterButton key={category} $active={selectedCategory === category} aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}>{category}</S.FilterButton>)}</S.FilterContainer>
    </S.SearchContainer>}
    <S.JobsGrid aria-busy={isLoading}>
      {isLoading ? Array.from({length:maxItems || 6},(_,i) => <CardJobSkeleton key={i} />) : error ?
        <S.EmptyState role="alert"><BriefcaseBusiness size={30} /><h3>Vamos tentar de novo?</h3><p>{error}</p><button onClick={() => setRetry(v => v+1)}><RefreshCw size={16} /> Tentar novamente</button></S.EmptyState>
        : visible.length ? visible.map(job => <CardJob key={job.id} job={job} />) :
        <S.EmptyState role="status"><BriefcaseBusiness size={30} />
          <h3>{filtered ? 'Nenhuma vaga com esses filtros' : 'As próximas oportunidades começam aqui'}</h3>
          <p>{filtered ? 'Experimente outro cargo ou veja todas as modalidades.' : 'Ainda não há vagas publicadas. Você já pode preparar seu perfil ou cadastrar sua empresa.'}</p>
          {filtered ? <button onClick={() => {updateSearch('');setSelectedCategory('Todos');}}>Limpar filtros</button> : <Link to={isAuthenticated ? (isEmpresa ? '/empresa/vaga/nova' : '/candidato/painel') : '/cadastro'}>{isAuthenticated ? (isEmpresa ? 'Publicar uma vaga' : 'Meu painel') : 'Criar minha conta'} <span aria-hidden="true">→</span></Link>}
        </S.EmptyState>}
    </S.JobsGrid>
  </S.BoardContainer>;
}
