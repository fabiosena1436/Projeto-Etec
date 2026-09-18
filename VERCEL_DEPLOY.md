# 🚀 Deploy na Vercel + Supabase - Passo a Passo (5 minutos)

Seu front já está na Vercel em modo mock. Para ativar banco real sem quebrar nada:

## 1️⃣ Criar Supabase (2 min)

1. Acesse https://supabase.com/dashboard → New Project
   - Name: `conecta-teodoro`
   - Password: gere forte e salve
   - Region: **South America (São Paulo)** → menor latência para Teodoro Sampaio
   - Free tier

2. Espere 1-2 min provisionar

## 2️⃣ Rodar Migrations (1 min)

1. No Supabase Dashboard → **SQL Editor** → New Query
2. Copie e cole **TODO** conteúdo de `supabase/migrations/001_initial_schema.sql` → Run (deve aparecer Success)
3. Nova Query → cole `002_seed.sql` → Run
4. Nova Query → cole `003_storage_and_functions.sql` → Run
5. Vá em **Table Editor** → deve ver 15 tabelas: profiles, candidates, companies, jobs, etc
6. **Storage** → deve ver 4 buckets: avatars, company-logos, resumes, promotions

## 3️⃣ Pegar Credenciais (30s)

1. **Project Settings → API**
   - Copie `Project URL`: `https://xxxx.supabase.co`
   - Copie `anon public` key: `eyJ...` (longa)

## 4️⃣ Configurar Vercel (1 min)

1. Acesse https://vercel.com/dashboard → seu projeto `Projeto-Etec`
2. **Settings → Environment Variables** → Add:
   - `VITE_SUPABASE_URL` = `https://xxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJ...`
3. **Save** → Vá em **Deployments** → último deploy → **Redeploy** (para pegar envs)
4. Pronto! Seu site agora usa banco real. Na Home deve aparecer "Supabase Conectado - Live" ao invés de "Modo Mock"

## 5️⃣ Testar Fluxo Real

### Criar primeiro usuário empresa
1. No seu site na Vercel → Cadastre-se → Sou Empresa → preencha → Cadastrar
2. No Supabase → **Authentication → Users** → deve aparecer novo usuário
3. **IMPORTANTE**: Vá em **SQL Editor** e confirme email manualmente (dev):
```sql
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'seu-email@empresa.com';
-- Ou desative confirmação em Auth → Providers → Email → desmarque "Confirm email"
```
Para produção, deixe confirmação ativa (usuário recebe email)

### Criar empresa e vaga (via SQL por enquanto, depois via painel)
```sql
-- Pegue seu profile id
SELECT id, email, role FROM profiles;

-- Crie empresa (substitua owner_profile_id)
INSERT INTO companies (owner_profile_id, name, slug, industry, description, location, contact_email, is_verified, is_sponsor)
VALUES (
  'SEU_PROFILE_ID_AQUI',
  'Supermercado Central',
  'supermercado-central',
  'Varejo',
  'Supermercado tradicional de Teodoro Sampaio',
  'Centro, Teodoro Sampaio',
  'rh@central.com',
  true,
  true
) RETURNING id;

-- Crie vaga (substitua company_id retornado)
INSERT INTO jobs (company_id, title, slug, description, location, type, salary_text, requirements, benefits, status)
VALUES (
  'COMPANY_ID_AQUI',
  'Vendedor(a) de Loja',
  'vendedor-loja-1',
  'Buscamos vendedor proativo...',
  'Centro, Teodoro Sampaio',
  'Presencial',
  'R$ 1.600 + Comissão',
  ARRAY['Ensino Médio', 'Boa comunicação'],
  ARRAY['Vale Transporte', 'Vale Alimentação'],
  'Ativa'
);
```

Agora recarregue seu site na Vercel → vagas devem aparecer do banco real!

### Criar candidato e candidatar-se
1. Cadastre-se como candidato no site
2. Faça login → busque vaga → candidatar-se
3. No Supabase → **Table Editor → applications** → deve ver candidatura
4. Login como empresa → painel deve mostrar candidatura (futuro: já está preparado RLS)

## 6️⃣ O que já funciona automaticamente quando ativar Supabase?

✅ **Já funciona sem mudar código**:
- `JobsBoard`, `JobsList`, `JobDetails`, `CompaniesList`, `SponsorProfile` → buscam do Supabase, fallback mock se falhar
- `Login`/`Register` → tenta Supabase Auth real, fallback mock para apresentação
- `DatabaseStatus` na Home → mostra Live vs Mock
- Busca full-text, views count, etc

⚠️ **Ainda usa mock (próxima fase de migração, mas não quebra)**:
- `CandidateDashboard` usa `usersMock[0]` → precisa migrar para `candidatesService.getMyProfile()` (já existe service, só trocar)
- `CompanyDashboard` usa `companiesMock` → migrar para `companiesService.getByOwner()`
- `CreateJob` simula criação → migrar para `jobsService.create()`
- `useAppliedJobs` ainda localStorage → migrar para `applicationsService.apply()`

Mesmo com essas páginas ainda mock, o site **não quebra** e vagas/empresas já são reais. Você pode apresentar assim e migrar o resto gradualmente.

## 7️⃣ Popular com dados da cidade (seed real)

Crie um arquivo `seed-real.sql` com empresas reais de Teodoro Sampaio e rode no SQL Editor. Exemplo:

```sql
-- Exemplo para popular rápido (após criar um usuário empresa genérico)
INSERT INTO companies (owner_profile_id, name, slug, industry, location, contact_email, is_verified)
SELECT 
  (SELECT id FROM profiles WHERE role='empresa' LIMIT 1),
  'Farmácia Saúde Total',
  'farmacia-saude-total',
  'Saúde',
  'Vila Moreno, Teodoro Sampaio',
  'contato@saudetotal.com.br',
  true
WHERE EXISTS (SELECT 1 FROM profiles WHERE role='empresa');
```

Ou use dashboard: **Table Editor → companies → Insert row**

## 8️⃣ Monitorar uso (importante para cidade)

Supabase Dashboard → **Reports**:
- Database size (free 500MB)
- Storage (free 1GB)
- Auth MAU (free 50k)
- API requests

Se chegar perto do limite, considere:
- Limpar `job_views` antigos: `DELETE FROM job_views WHERE viewed_at < NOW() - INTERVAL '30 days';`
- Ou upgrade Pro $25/mês (barato para prefeitura)

## 9️⃣ Troubleshooting Vercel

**"Modo Mock" ainda aparece após configurar envs?**
- Verifique se envs começam com `VITE_` (Vite exige)
- Redeploy após adicionar envs (Vercel não pega automático)
- Veja build logs: deve ter `@supabase/supabase-js` instalado (já está no package.json)

**RLS bloqueando tudo (0 vagas aparecem)?**
- Desabilite RLS temporariamente para teste: `ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;` (só dev!)
- Verifique se está logado: `SELECT auth.uid();` no SQL Editor deve retornar UUID se logado
- Políticas já estão criadas, mas se criou empresa via SQL sem owner correto, pode bloquear

**Erro "new row violates row-level security" ao criar vaga?**
- Você só pode criar vaga se `company.owner_profile_id = auth.uid()` → verifique owner

## 🔟 Próximos passos recomendados

1. [ ] Configurar Google Auth (Auth → Providers → Google) para reduzir fricção cadastro na cidade
2. [ ] Migrar `CandidateDashboard` e `CompanyDashboard` para usar services reais (já existem, só trocar 10 linhas)
3. [ ] Ativar Realtime: vagas novas aparecem sem F5
4. [ ] Criar Edge Function para envio email quando candidatura recebida
5. [ ] Adicionar Stripe para empresas pagarem patrocínio

---

**Resumo**: Seu front na Vercel já funciona. Só adicionar 2 envs e rodar 3 SQLs e ele vira app com banco real, seguro, escalável, gratuito, pronto para cidade toda usar. Sem precisar reescrever nada!
