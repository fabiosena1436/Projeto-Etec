import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import styled from 'styled-components';
import { normalizeCnpj } from '../../utils/cnpj';

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  a, button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 10px 16px;
    border: 1px solid #dbe3eb;
    border-radius: 10px;
    font: inherit;
    font-weight: 600;
    text-decoration: none;
  }
  a { background: #175cda; color: white; border-color: #175cda; }
  a:hover { background: #124bb4; }
  a:focus-visible, button:focus-visible { outline: 3px solid #102a43; outline-offset: 3px; }
  svg { flex-shrink: 0; }
`;

export function CnpjLookupActions({ cnpj }: { cnpj: string | null }) {
  const normalized = normalizeCnpj(cnpj);
  async function copyCnpj() {
    if (!normalized) return;
    try {
      await navigator.clipboard.writeText(normalized);
      toast.success('CNPJ copiado. Cole no campo de consulta da Receita Federal.');
    } catch {
      toast.error('Não foi possível copiar. Selecione o CNPJ exibido e copie manualmente.');
    }
  }
  return <Actions>
    <a href="https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_S.aspx" target="_blank" rel="noopener noreferrer" title="Abrir consulta da Receita Federal em uma nova aba">
      <ExternalLink size={18} aria-hidden="true"/> Consultar CNPJ na Receita
    </a>
    {normalized && <button type="button" onClick={()=>void copyCnpj()}><Copy size={18} aria-hidden="true"/> Copiar CNPJ</button>}
  </Actions>;
}
