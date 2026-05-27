import { useState } from 'react';
import { jobsMock } from '../../data/jobs';
import { CardJob } from '../../components/CardJob';
import { Search } from 'lucide-react';
import * as S from './styles';

export function JobsList() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = jobsMock.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <S.Container>
      <S.Header>
        <h1>Vagas Disponíveis</h1>
        <p>Encontre a oportunidade ideal para sua carreira em Teodoro Sampaio</p>
      </S.Header>

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
      </S.SearchContainer>

      <S.JobsGrid>
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <CardJob key={job.id} job={job} />
          ))
        ) : (
          <S.EmptyState>
            <p>Nenhuma vaga encontrada com esse termo.</p>
          </S.EmptyState>
        )}
      </S.JobsGrid>
    </S.Container>
  );
}
