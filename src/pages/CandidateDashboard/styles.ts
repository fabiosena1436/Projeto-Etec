import styled from 'styled-components';

export const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const WelcomeSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h1 {
    font-size: 1.75rem;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 700;
  }

  p {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

export const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  div.icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.primary}15;
    color: ${({ theme }) => theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  span.value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }

  span.label {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textLight};
    font-weight: 500;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.primary};
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const TabsContainer = styled.div`
  display: flex;
  gap: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 1rem;
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  padding: 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textLight};
  border-bottom: 3px solid ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: -1px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

/* ---------- Componentes de formulário reutilizáveis do painel ---------- */

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
`;

export const CardHeader = styled.div<{ $bordered?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: ${({ $bordered, theme }) => $bordered ? `1px solid ${theme.colors.border}` : 'none'};

  h4 {
    font-size: 1.125rem;
    color: ${({ theme }) => theme.colors.secondary};
    margin: 0;
  }
`;

export const CardBody = styled.div<{ $editing?: boolean }>`
  padding: ${({ $editing }) => $editing ? '1.5rem' : '0 1.25rem 1.25rem'};
  background: ${({ $editing, theme }) => $editing ? theme.colors.background : 'transparent'};
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const FieldRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
`;

export const Field = styled.div<{ $basis?: string }>`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1 1 ${({ $basis }) => $basis || '280px'};
  min-width: 0;

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }

  input, textarea, select {
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 0.95rem;
    font-family: inherit;
    background: white;
    width: 100%;
    &:focus { outline: 2px solid ${({ theme }) => theme.colors.primary}40; border-color: ${({ theme }) => theme.colors.primary}; }
  }

  textarea { resize: vertical; }

  small { font-size: 0.75rem; color: ${({ theme }) => theme.colors.textLight}; }
`;

export const ReadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
`;

export const ReadItem = styled.div`
  span {
    display: block;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textLight};
    margin-bottom: 0.25rem;
  }
  strong {
    color: ${({ theme }) => theme.colors.secondary};
    font-weight: 500;
    line-height: 1.5;
    word-break: break-word;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const Btn = styled.button<{ $variant?: 'primary' | 'success' | 'ghost' | 'danger' | 'soft' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'success': return `background:${theme.colors.success}; color:white; &:hover{filter:brightness(.95)}`;
      case 'danger': return `background:#fef2f2; color:${theme.colors.error}; border-color:#fee2e2; &:hover{background:#fee2e2}`;
      case 'ghost': return `background:transparent; color:${theme.colors.textLight}; border-color:#cbd5e1; &:hover{background:${theme.colors.background}}`;
      case 'soft': return `background:#eff6ff; color:${theme.colors.primary}; &:hover{background:#dbeafe}`;
      default: return `background:${theme.colors.primary}; color:white; &:hover{background:${theme.colors.primaryHover}}`;
    }
  }}

  &:disabled { opacity: .6; cursor: not-allowed; }
`;

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #eff6ff;
  color: ${({ theme }) => theme.colors.primary};

  button {
    background: none; border: none; cursor: pointer; color: inherit; display: flex; padding: 0;
    &:hover { color: ${({ theme }) => theme.colors.error}; }
  }
`;

export const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .02em;
  ${({ $status }) => {
    switch ($status) {
      case 'aprovada': return 'background:#dcfce7;color:#166534;';
      case 'pre_selecionado': return 'background:#ede9fe;color:#5b21b6;';
      case 'em_analise': return 'background:#fef3c7;color:#92400e;';
      case 'visualizada': return 'background:#e0f2fe;color:#075985;';
      case 'rejeitada': return 'background:#fee2e2;color:#991b1b;';
      case 'desistiu': return 'background:#f1f5f9;color:#475569;';
      default: return 'background:#f1f5f9;color:#334155;';
    }
  }}
`;

export const ApplicationRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  h4 {
    font-size: 1.05rem;
    margin-bottom: 0.25rem;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.secondary};
    &:hover { color: ${({ theme }) => theme.colors.primary}; }
  }
  p { color: ${({ theme }) => theme.colors.textLight}; font-size: 0.875rem; }
`;

export const ProgressBar = styled.div<{ $value: number }>`
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;
  margin-top: 0.5rem;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $value }) => Math.min(100, Math.max(0, $value))}%;
    background: ${({ theme }) => theme.colors.primary};
    transition: width .4s ease;
  }
`;
