# Vercel + Supabase

O frontend usa React/Vite e o backend usa Supabase Auth, PostgreSQL e Storage. Em produção, a aplicação exige uma conexão válida; dados de demonstração só podem ser habilitados no desenvolvimento local.

## Ambiente

Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` na Vercel e em `.env.local`. A chave pública legada `VITE_SUPABASE_ANON_KEY` também é aceita. Use `VITE_ENABLE_DEMO=false`. Nunca use a chave `service_role` ou `sb_secret_` no frontend.

As variáveis VITE são incorporadas durante o build: publique novamente depois de alterá-las.

## Banco

Em um projeto vazio, aplique as migrações `001_initial_schema.sql`, `003_storage_and_functions.sql`, `005_production_ready.sql`, `006_security_hardening.sql`, `007_candidate_completion.sql` e `008_withdrawal_finality.sql`, nessa ordem. `002_seed.sql` contém habilidades iniciais opcionais. Não aplique `004_demo_seed_real.sql` em produção: ela cria dados de demonstração.

Em um projeto existente, inspecione as tabelas e funções antes de aplicar migrações. As correções 005, 006, 007 e 008 foram aplicadas ao projeto `conecta-teodoro` (`bqyuyxzlqjyismolbwvc`). Elas preservam os cadastros existentes. A 007 corrige o gatilho de preenchimento que impedia salvar perfil, habilidades e experiências; a 008 impede que a empresa reative uma candidatura retirada.

Os buckets são `avatars`, `company-logos`, `resumes` e `promotions`. Currículos são privados. Empresas recebem acesso ao currículo dos candidatos que se candidataram às suas vagas; a desistência revoga esse acesso. Cada usuário ou empresa só pode gravar arquivos na própria pasta.

## Autenticação e e-mail

Site URL: `https://projeto-etec-xi.vercel.app`.
Redirect permitido: `https://projeto-etec-xi.vercel.app/**`.

Configure SMTP personalizado para enviar confirmação e recuperação de senha a usuários externos. O SMTP padrão do Supabase só atende e-mails dos membros da organização; essa limitação não é resolvida alterando o plano do banco. A configuração existente deste projeto está com confirmação de e-mail desativada, portanto o cadastro não depende do envio. Para ativar a confirmação, configure primeiro o SMTP. A recuperação de senha para usuários externos também depende dele. O cadastro cria automaticamente o perfil e a linha de candidato ou empresa.

## Verificação

```sh
npm install
npm run test:database
npm run build
npm audit --omit=dev
```

O teste de banco executa as migrações em PostgreSQL local via PGlite e verifica cadastro, isolamento de dados, candidatura, permissões de arquivos, notificações e bloqueio de elevação de privilégios. Não acessa nem modifica o banco de produção.

Valide também na publicação: cadastro com e-mail controlado, confirmação, login, edição do perfil, currículo, publicação de vaga e candidatura. Banco e arquivos têm cotas gratuitas; confira o uso no painel Supabase antes de aumentá-lo.
