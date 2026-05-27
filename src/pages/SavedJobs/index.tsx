import { useNavigate } from 'react-router-dom';
import { Bookmark, Search } from 'lucide-react';
import * as S from './styles';

export function SavedJobs() {
  const navigate = useNavigate();

  return (
    <S.Container>
      <S.Header>
        <h1>Vagas Salvas</h1>
        <p>Acompanhe as oportunidades que você marcou para ver depois.</p>
      </S.Header>

      <S.EmptyState>
        <Bookmark size={48} strokeWidth={1.5} />
        <h2>Nenhuma vaga salva ainda</h2>
        <p>Explore as vagas disponíveis na região e salve as que mais combinam com o seu perfil.</p>
        <button onClick={() => navigate('/vagas')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={20} />
          Explorar Vagas
        </button>
      </S.EmptyState>
    </S.Container>
  );
}