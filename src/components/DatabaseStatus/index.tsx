import { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { Database, CheckCircle, AlertCircle, Wifi } from 'lucide-react';
import styled from 'styled-components';

const StatusContainer = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: ${props => props.$connected ? '#f0fdf4' : '#fffbeb'};
  border: 1px solid ${props => props.$connected ? '#bbf7d0' : '#fde68a'};
  font-size: 0.875rem;
  margin: 1rem 0;

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => props.$connected ? '#10b981' : '#f59e0b'};
    color: white;
  }

  .info {
    flex: 1;
    h4 {
      font-weight: 600;
      color: ${props => props.$connected ? '#065f46' : '#92400e'};
      margin: 0;
      font-size: 0.875rem;
    }
    p {
      color: ${props => props.$connected ? '#047857' : '#b45309'};
      margin: 0.125rem 0 0 0;
      font-size: 0.75rem;
    }
  }

  .badge {
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    background: ${props => props.$connected ? '#10b981' : '#f59e0b'};
    color: white;
    text-transform: uppercase;
  }
`;

export function DatabaseStatus() {
  const [dbStats, setDbStats] = useState<{ jobs: number; companies: number } | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    setChecking(true);
    Promise.all([
      supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'Ativa'),
      supabase.from('companies').select('id', { count: 'exact', head: true }),
    ])
      .then(([jobsRes, companiesRes]) => {
        setDbStats({
          jobs: jobsRes.count || 0,
          companies: companiesRes.count || 0,
        });
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <StatusContainer $connected={false}>
        <div className="icon">
          <AlertCircle size={18} />
        </div>
        <div className="info">
          <h4>Modo Mock (Desenvolvimento)</h4>
          <p>Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env para usar banco real. Veja DATABASE_ARCHITECTURE.md</p>
        </div>
        <span className="badge">Mock</span>
      </StatusContainer>
    );
  }

  return (
    <StatusContainer $connected={true}>
      <div className="icon">
        {checking ? <Wifi size={18} className="animate-pulse" /> : <CheckCircle size={18} />}
      </div>
      <div className="info">
        <h4>Supabase Conectado - PostgreSQL</h4>
        <p>
          {dbStats
            ? `${dbStats.jobs} vagas ativas • ${dbStats.companies} empresas • RLS ativo • Alta performance`
            : 'Banco pronto para alto fluxo da cidade • RLS • Full-text search • Gratuito'}
        </p>
      </div>
      <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Database size={12} /> Live
      </span>
    </StatusContainer>
  );
}
