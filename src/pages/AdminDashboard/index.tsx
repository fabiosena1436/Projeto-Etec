import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminService, type AdminSnapshot, type Sponsorship } from '../../services/supabase/admin.service';
import { PageLoader } from '../../components/PageLoader';
import { CommunityModeration } from '../../components/CommunityModeration';
import * as S from './styles';
const currency = (value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
const today = ()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
export function AdminDashboard() {
  const [data,setData]=useState<AdminSnapshot|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [tab,setTab]=useState<'companies'|'users'|'finance'|'community'>('companies');
  const [search,setSearch]=useState('');
  const [form,setForm]=useState<Sponsorship|null>(null);
  const [saving,setSaving]=useState(false);
  const load=useCallback(async()=>{
    setError('');setLoading(true);
    try{setData(await adminService.getDashboard());}catch(e){setError(e instanceof Error?e.message:'Não foi possível carregar.');}finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);
  async function verify(kind:'company'|'user',id:string,value:boolean){
    setSaving(true);try{await adminService.verify(kind,id,value);await load();toast.success('Verificação atualizada.');}catch(e){toast.error(e instanceof Error?e.message:'Não foi possível atualizar.');}finally{setSaving(false);}
  }
  async function save(e:React.FormEvent){
    e.preventDefault();if(!form)return;setSaving(true);
    try{await adminService.saveSponsorship(form);await load();setForm(null);toast.success('Parceria registrada.');}catch(e){toast.error(e instanceof Error?e.message:'Não foi possível salvar.');}finally{setSaving(false);}
  }
  function edit(id:string){setForm(data?.sponsorships.find(s=>s.company_id===id)||{company_id:id,status:'pendente',payment_status:'pendente',monthly_amount:0,starts_at:today(),expires_at:null,internal_notes:''});}
  if(loading&&!data)return <PageLoader label="Carregando administração..."/>;
  if(!data)return <S.Container><h1>Administração</h1><p role="alert">{error}</p><button onClick={load}>Tentar novamente</button></S.Container>;
  const match=(text:string)=>text.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'));
  return <S.Container>
    <header><div><p>GESTÃO DO CONECTA JOVENS</p><h1>Superadministrador</h1><p>Empresas, cadastros e parcerias sob seu controle.</p></div><button onClick={load} disabled={loading}>Atualizar painel</button></header>
    {error&&<p role="alert">{error}</p>}
    <S.Metrics><article><strong>{data.totals.users}</strong><span>Usuários</span></article><article><strong>{data.totals.companies}</strong><span>Empresas</span></article><article><strong>{data.totals.sponsors}</strong><span>Patrocínios vigentes</span></article><article><strong>{currency(Number(data.totals.monthly_revenue))}</strong><span>Valor mensal contratado</span></article></S.Metrics>
    <nav aria-label="Seções administrativas">{([['companies','Empresas e patrocínios'],['users','Usuários'],['finance','Financeiro e histórico'],['community','Comunidade e denúncias']] as const).map(([key,label])=><button key={key} aria-pressed={tab===key} onClick={()=>{setTab(key);setSearch('');}}>{label}</button>)}</nav>
    {tab==='community'&&<CommunityModeration/>}
    {(tab==='companies'||tab==='users')&&<label>Buscar {tab==='users'?'usuário':'empresa'}<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nome ou e-mail"/></label>}
    {form&&<section><h2>Parceria: {data.companies.find(c=>c.id===form.company_id)?.name}</h2><p>Registro privado de negociação e recebimento. Não realiza cobrança ou transferência de dinheiro.</p><form onSubmit={save}>
      <label>Situação<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as Sponsorship['status']})}><option value="pendente">Pendente</option><option value="ativo">Ativo</option><option value="pausado">Pausado</option><option value="cancelado">Cancelado</option></select></label>
      <label>Recebimento<select value={form.payment_status} onChange={e=>setForm({...form,payment_status:e.target.value as Sponsorship['payment_status']})}><option value="pendente">Pendente</option><option value="recebido">Recebido / cortesia confirmada</option><option value="atrasado">Em atraso</option></select></label>
      <label>Valor mensal combinado (R$)<input required type="number" min="0" max="100000" step="0.01" value={form.monthly_amount} onChange={e=>setForm({...form,monthly_amount:Number(e.target.value)})}/></label>
      <label>Início<input required type="date" value={form.starts_at} onChange={e=>setForm({...form,starts_at:e.target.value})}/></label>
      <label>Válido até<input required={form.status==='ativo'} type="date" min={form.starts_at} value={form.expires_at||''} onChange={e=>setForm({...form,expires_at:e.target.value||null})}/></label>
      <label className="wide">Observações internas<textarea rows={3} maxLength={2000} value={form.internal_notes} onChange={e=>setForm({...form,internal_notes:e.target.value})}/></label>
      <div className="actions wide"><button disabled={saving} type="submit">{saving?'Salvando...':'Salvar parceria'}</button><button disabled={saving} type="button" onClick={()=>setForm(null)}>Cancelar</button></div>
    </form></section>}
    {tab==='companies'&&<section><h2>Empresas cadastradas</h2><small>Até 500 cadastros mais recentes. A liberação exige recebimento registrado e período vigente.</small>{data.companies.filter(c=>match(c.name+' '+c.contact_email)).map(c=>{const s=data.sponsorships.find(s=>s.company_id===c.id);return <div className="row" key={c.id}><div><h3>{c.name}</h3><span>{c.industry} · {c.city}</span><span>{c.contact_email}</span><span>{s?`${s.status} · ${s.payment_status} · validade: ${s.expires_at||'não definida'}`:'Sem parceria registrada'}{c.sponsor_expires_at&&new Date(c.sponsor_expires_at)<=new Date()?' · vencido':''}</span></div><div className="actions"><button onClick={()=>edit(c.id)}>Gerenciar parceria</button><button disabled={saving} onClick={()=>verify('company',c.id,!c.is_verified)}>{c.is_verified?'Remover verificação':'Verificar empresa'}</button></div></div>;})}</section>}
    {tab==='users'&&<section><h2>Usuários cadastrados</h2><small>Até 500 cadastros mais recentes. Verificação administrativa não altera senha, papel ou confirmação de e-mail.</small>{data.users.filter(p=>match(p.full_name+' '+p.email)).map(p=><div className="row" key={p.id}><div><h3>{p.full_name}</h3><span>{p.email} · {p.role}</span><span>{p.is_active?'Cadastro ativo':'Cadastro inativo'}</span></div><button disabled={saving} onClick={()=>verify('user',p.id,!p.is_verified)}>{p.is_verified?'Remover verificação':'Verificar cadastro'}</button></div>)}</section>}
    {tab==='finance'&&<><section><h2>Acordos comerciais</h2><p>Valores são o cadastro dos acordos, não um extrato de pagamentos. Não há renovação ou cobrança automática.</p>{data.sponsorships.map(s=><div className="row" key={s.company_id}><div><h3>{data.companies.find(c=>c.id===s.company_id)?.name||'Empresa'}</h3><span>{s.status} · {s.payment_status} · {currency(Number(s.monthly_amount))}/mês</span><span>{s.starts_at} até {s.expires_at||'não definido'}</span><p>{s.internal_notes}</p></div><button onClick={()=>edit(s.company_id)}>Editar acordo</button></div>)}</section><section><h2>Últimas ações administrativas</h2>{data.audit.length?data.audit.map((a,i)=><div className="row" key={`${a.created_at}-${i}`}><span>{a.action} · {a.entity_type}</span><small>{new Date(a.created_at).toLocaleString('pt-BR')}</small></div>):<p>Nenhuma alteração registrada.</p>}</section></>}
  </S.Container>;
}
