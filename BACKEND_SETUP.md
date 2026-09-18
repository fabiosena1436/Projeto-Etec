# 🚀 Guia de Setup Backend - Conecta Teodoro Sampaio

## 1. Instalar dependência Supabase

```bash
npm install @supabase/supabase-js
```

## 2. Configurar Supabase Cloud (2 minutos - Recomendado)

### Criar projeto
1. Acesse https://supabase.com/dashboard
2. New Project
   - Name: `conecta-teodoro`
   - Database Password: gere forte
   - Region: **South America (São Paulo)** - menor latência para Teodoro Sampaio
   - Free tier

### Rodar migrations
1. No dashboard, vá em **SQL Editor**
2. Cole conteúdo de `supabase/migrations/001_initial_schema.sql` -> Run
3. Cole `002_seed.sql` -> Run
4. Cole `003_storage_and_functions.sql` -> Run
5. Verifique em **Table Editor** se tabelas foram criadas (15 tabelas)

### Pegar credenciais
1. **Project Settings -> API**
   - `Project URL`: https://xxx.supabase.co
   - `anon public key`: eyJ...
2. Crie arquivo `.env` na raiz (copie de `.env.example`):
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Testar
```bash
npm run dev
```
Abra console: se aparecer "Supabase não configurado", envs não carregaram. Se não aparecer, está usando banco real!

## 3. Configurar Auth (Opcional mas recomendado)

### Email Auth (já ativo por padrão)
- Em **Authentication -> Providers -> Email**: habilitado

### Google Auth (reduz fricção para cidade)
1. https://console.cloud.google.com -> Crie projeto -> OAuth consent
2. Credentials -> Create OAuth client ID -> Web
   - Authorized redirect: `https://xxx.supabase.co/auth/v1/callback`
3. Copie Client ID e Secret
4. Supabase -> Auth -> Providers -> Google -> habilite e cole ID/Secret
5. No código, use `authService.signInWithGoogle()`

## 4. Configurar Storage (já criado via migration, mas verifique)

- Dashboard -> Storage -> deve ter 4 buckets: avatars, company-logos, resumes, promotions
- Se não tiver, rode manualmente:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars','avatars',true), ('company-logos','company-logos',true), ('resumes','resumes',false), ('promotions','promotions',true);
```

## 5. Testar Fluxo Completo

### Criar usuário candidato
```ts
import { authService } from './services/supabase/auth.service';

await authService.signUp({
  email: 'candidato@teste.com',
  password: '123456',
  full_name: 'João Silva',
  role: 'candidato',
  city: 'Teodoro Sampaio, SP'
});
```

### Criar empresa e vaga
```ts
import { companiesService } from './services/supabase/companies.service';
import { jobsService } from './services/supabase/jobs.service';

const company = await companiesService.create({
  name: 'Supermercado Central',
  industry: 'Varejo',
  location: 'Centro',
  contact_email: 'rh@central.com',
  owner_profile_id: user.id
});

const job = await jobsService.create({
  company_id: company.id,
  title: 'Vendedor',
  description: 'Vaga para vendedor...',
  location: 'Centro',
  salary_text: 'R$ 1.600 + comissão',
  type: 'Presencial'
});
```

### Buscar vagas com full-text
```ts
const vagas = await jobsService.getAll({ search: 'vendedor', limit: 10 });
```

## 6. Deploy na Vercel (com banco)

1. Vercel -> Import Project -> conecte repo
2. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy -> pronto! Frontend + Backend grátis.

## 7. Self-host Alternativo (100% grátis, sem limites Supabase Cloud)

Se prefeitura quiser hospedar tudo local:

```bash
# Instale Docker
# Clone supabase self-host
git clone https://github.com/supabase/supabase --depth 1
cd supabase/docker
cp .env.example .env
# Edite .env com senhas
docker compose up -d
# Acesse http://localhost:8000 (Studio)
# Rode migrations via SQL Editor
```

Hospede Docker em:
- **Coolify** (grátis, 1 clique, em qualquer VPS)
- **Railway** (free $5)
- **VPS da ETEC** (Ubuntu + Docker)

## 8. Monitoramento para Cidade

- **Supabase Dashboard -> Reports**: veja uso DB, storage, auth, queries lentas
- **Table Editor**: veja dados em tempo real
- **Logs**: veja erros RLS, auth
- **API Docs**: auto-gerado em https://xxx.supabase.co/rest/v1/

### Alertas de limite free tier:
- DB 500MB -> quando chegar 400MB, considere limpar job_views antigos ou upgrade $25
- Storage 1GB -> currículos antigos podem ir para cold storage
- 50k MAU -> cidade tem 30k, difícil estourar

## 9. Próximos Passos (Evolução)

- [ ] **Realtime**: vagas novas aparecem sem refresh
  ```ts
  supabase.channel('jobs').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, payload => console.log(payload)).subscribe()
  ```
- [ ] **Edge Functions**: matching IA candidato-vaga (usar pgvector)
- [ ] **pgvector**: busca semântica de currículos
- [ ] **PostGIS**: busca vagas por bairro/distância
- [ ] **Stripe**: pagamento patrocínio empresas
- [ ] **Cron**: refresh mv_city_metrics a cada hora via pg_cron

## 10. Troubleshooting

**"Supabase não configurado" no console**
- Verifique .env existe e tem VITE_ prefix (Vite exige)
- Reinicie `npm run dev`

**RLS bloqueando tudo**
- Verifique se está logado: `await supabase.auth.getUser()`
- Teste desabilitando RLS temporariamente: `ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;` (só dev!)

**Erro "new row violates row-level security"**
- Política RLS bloqueou INSERT. Verifique se `owner_profile_id = auth.uid()` ou similar.

**Storage upload falha**
- Verifique bucket existe e política permite `auth.uid()::text = foldername`
- Path deve ser `user-id/arquivo.pdf`

---

## 📞 Suporte

- Docs Supabase: https://supabase.com/docs
- Discord Supabase: https://discord.supabase.com (resposta rápida)
- Para este projeto: veja `DATABASE_ARCHITECTURE.md` para decisões técnicas
