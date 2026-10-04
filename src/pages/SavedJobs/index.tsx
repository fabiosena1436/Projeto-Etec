import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { applicationsService } from '../../services/supabase/applications.service';
import { mapJob } from '../../services/api';
import type { Job } from '../../data/jobs';
import { CardJob } from '../../components/CardJob';
import { CardJobSkeleton } from '../../components/CardJobSkeleton';
import * as S from './styles';

export function SavedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const saved = await applicationsService.getSavedJobs();
      setJobs(saved.filter(s => s.job).map(s => mapJob(s.job!)));
    } catch (e) {
      console.error(e);
      toast.error('Não foi possível carregar suas vagas salvas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (jobId: string) => {
    try {
      await applicationsService.unsaveJob(jobId);
      // modo mock usa toggle
      if (await applicationsService.isJobSaved(jobId)) await applicationsService.toggleSaved(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      toast.success('Vaga removida das salvas.');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao remover.');
    }
  };

  return (
    <S.Container>
      <S.Header>
        <h1>Vagas Salvas</h1>
        <p>Acompanhe as oportunidades que você marcou para ver depois.</p>
      </S.Header>

      {loading ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Array.from({ length: 3 }).map((_, i) => <CardJobSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <S.EmptyState>
          <Bookmark size={48} strokeWidth={1.5} />
          <h2>Nenhuma vaga salva ainda</h2>
          <p>Explore as vagas disponíveis na região e salve as que mais combinam com o seu perfil.</p>
          <button onClick={() => navigate('/vagas')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={20} />
            Explorar Vagas
          </button>
        </S.EmptyState>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {jobs.map(job => (
            <div key={job.id} style={{ position: 'relative' }}>
              <CardJob job={job} />
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(job.id); }}
                title="Remover das salvas"
                aria-label="Remover das salvas"
                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </S.Container>
  );
}
