import { useState } from 'react';
import { toast } from 'sonner';
import type { Company } from '../../types/database';
import { adminService } from '../../services/supabase/admin.service';
import { isValidCnpj } from '../../utils/cnpj';

export function CompanyReview({ company, representative, onDone, onCancel }: {
  company: Company; representative: string; onDone: () => Promise<void>; onCancel: () => void;
}) {
  const [legalName, setLegalName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidCnpj(company.cnpj)) { toast.error('A empresa precisa informar um CNPJ válido.'); return; }
    setSaving(true);
    try {
      await adminService.reviewCompany(company.id, company.cnpj!, legalName, notes);
      await onDone();
      toast.success('Empresa aprovada após análise.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível aprovar.'); }
    finally { setSaving(false); }
  }
  return <section>
    <h2>Analisar empresa: {company.name}</h2>
    <p>CNPJ: {company.cnpj || 'Não informado'} · Responsável: {representative}</p>
    <p>Contato informado: {company.contact_email} · {company.phone || 'Sem telefone'}</p>
    <p><a href="https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_S.aspx" target="_blank" rel="noopener noreferrer">Consultar situação cadastral na Receita Federal</a></p>
    <p>Compare razão social, endereço e situação ATIVA. Confirme a autorização do responsável por um canal da empresa obtido de fonte independente. O CNPJ e os contatos preenchidos pelo solicitante não comprovam esse vínculo.</p>
    <form onSubmit={submit}>
      <label>Razão social consultada<input required minLength={3} maxLength={200} value={legalName} onChange={event=>setLegalName(event.target.value)} disabled={saving}/></label>
      <label className="wide">Registro da análise (privado)<textarea required minLength={20} maxLength={2000} rows={4} value={notes} onChange={event=>setNotes(event.target.value)} disabled={saving} placeholder="Data e fonte da consulta, situação cadastral e como o vínculo do responsável foi confirmado. Não inclua senhas ou documentos pessoais completos."/></label>
      <label className="wide"><input type="checkbox" required disabled={saving}/> Consultei a situação ATIVA e confirmei que o responsável pode representar esta empresa.</label>
      <div className="actions wide"><button type="submit" disabled={saving || !isValidCnpj(company.cnpj)}>{saving?'Aprovando...':'Aprovar empresa'}</button><button type="button" disabled={saving} onClick={onCancel}>Cancelar análise</button></div>
    </form>
  </section>;
}
