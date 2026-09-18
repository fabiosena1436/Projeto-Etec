# 📘 Guia Completo para Leigos - Conectar Supabase ao seu projeto na Vercel

> **Você nunca usou backend? Perfeito, esse guia é pra você. Vou explicar cada clique, sem pular nada, como se fosse a primeira vez.**

Seu front já está na Vercel funcionando em modo demonstração (com dados falsos). Agora vamos colocar um banco de dados de verdade, gratuito, seguro e que aguenta a cidade toda. Quando terminar, seu site vai continuar no mesmo link da Vercel, mas usando banco real.

Tempo total: **15 minutos**

---

## 🧠 O que é cada coisa (explicação super simples)

- **Supabase**: É como um "Google Sheets super poderoso" que guarda vagas, empresas, candidaturas, mas com segurança e que aguenta muita gente. É gratuito.
- **Vercel**: Onde seu site já está hospedado. É a vitrine.
- **Banco de dados**: Onde as informações ficam guardadas de verdade. Hoje seu site usa dados falsos que estão dentro do código. Vamos trocar por dados reais no Supabase.
- **.env**: Arquivo com senhas/chaves para conectar seu site ao banco. É como a chave da porta.
- **Migration (SQL)**: Arquivo com instruções para criar as tabelas no banco. É como a planta da casa.

---

## PARTE 1: Criar conta e projeto no Supabase (3 minutos)

### Passo 1 - Criar conta
1. Abra https://supabase.com no navegador
2. Clique no botão verde **"Start your project"** no canto superior direito
3. Clique em **"Continue with GitHub"** (use o mesmo GitHub do seu projeto, é mais fácil)
4. Autorize o Supabase a acessar seu GitHub (clique em Authorize)
5. Você vai cair no Dashboard do Supabase (tela com seus projetos)

### Passo 2 - Criar projeto
1. No Dashboard, clique no botão verde **"New Project"**
2. Vai abrir um formulário:
   - **Organization**: selecione a que apareceu (ou crie uma com seu nome)
   - **Project Name**: digite `conecta-teodoro` (sem acento, sem espaço)
   - **Database Password**: clique em **"Generate a password"** (gera senha forte). **COPIE ESSA SENHA E GUARDE EM UM BLOCO DE NOTAS**, você pode precisar depois. É a senha do banco.
   - **Region**: **MUITO IMPORTANTE** → selecione **"South America (São Paulo)"** → isso deixa o site mais rápido para Teodoro Sampaio
   - **Pricing Plan**: deixe **Free** (gratuito)
3. Clique em **"Create new project"**
4. Agora vai aparecer uma tela com uma barra carregando "Setting up your project..." → **espere 1 a 2 minutos**, não feche. Quando terminar, você cai dentro do projeto.

> ✅ Se deu certo: você está dentro do projeto, no menu lateral esquerdo tem ícones como Table Editor, SQL Editor, etc.

---

## PARTE 2: Criar as tabelas no banco (rodar migrations) (4 minutos)

Essa é a parte mais importante. Vamos criar 15 tabelas (vagas, empresas, candidatos, etc) com segurança.

### Onde estão os arquivos SQL?
No seu projeto no GitHub, na pasta `supabase/migrations/` tem 4 arquivos:
- `001_initial_schema.sql` (o mais importante, 30KB)
- `002_seed.sql`
- `003_storage_and_functions.sql`
- `004_demo_seed_real.sql` (vamos usar depois)

Você precisa copiar o conteúdo de cada um e colar no Supabase.

### Passo 3 - Rodar o primeiro arquivo (cria tabelas)
1. No Supabase, no menu lateral esquerdo, clique em **"SQL Editor"** (ícone de `</>` ou "SQL")
2. Clique no botão verde **"New Query"** no topo
3. Agora vá no seu GitHub:
   - Abra https://github.com/fabiosena1436/Projeto-Etec
   - Se seu código ainda não está no `main`, vá na branch `arena/01a0b37d-projeto-etec` (no GitHub, clique em "main" no topo e selecione sua branch)
   - Entre na pasta `supabase` → `migrations` → clique em `001_initial_schema.sql`
   - Clique no botão de copiar (ícone de dois quadradinhos) ou selecione todo o texto (Ctrl+A) e copie (Ctrl+C)
4. Volte no Supabase, na área grande branca onde está escrito "Enter SQL query...", **cole** todo o conteúdo (Ctrl+V). Vai ser um texto gigante, normal.
5. Clique no botão verde **"Run"** no canto inferior direito
6. Espere 5-10 segundos. Embaixo deve aparecer **"Success. No rows returned"** em verde. Se aparecer vermelho com erro, me avise, mas normalmente vai verde.
7. Se deu verde, deu certo! As 15 tabelas foram criadas.

### Passo 4 - Rodar o segundo arquivo
1. Ainda no SQL Editor, clique de novo em **"New Query"**
2. No GitHub, copie o conteúdo de `002_seed.sql`
3. Cole no Supabase e clique **Run** → deve dar Success

### Passo 5 - Rodar o terceiro arquivo
1. **New Query** de novo
2. Copie `003_storage_and_functions.sql`
3. Cole e **Run** → Success

### Passo 6 - Verificar se deu certo
1. No menu lateral esquerdo, clique em **"Table Editor"** (ícone de tabela)
2. No lado esquerdo, deve aparecer uma lista com tabelas: `profiles`, `candidates`, `companies`, `jobs`, `applications`, `promotions`, etc. Se aparecer, **deu certo!** 🎉
3. Clique em **"Storage"** no menu lateral (ícone de pasta). Deve aparecer 4 buckets: `avatars`, `company-logos`, `resumes`, `promotions`. Se aparecer, perfeito.

> Se não aparecer tabelas: volte no Passo 3 e veja se deu erro vermelho. Copie o erro e me envie.

---

## PARTE 3: Pegar as chaves de conexão (1 minuto)

### Passo 7 - Copiar URL e Chave
1. No Supabase, no menu lateral esquerdo, clique em **"Project Settings"** (ícone de engrenagem, lá embaixo)
2. Clique em **"API"** no submenu
3. Vai abrir uma página com:
   - **Project URL**: algo como `https://abcdefgh.supabase.co` → clique no ícone de copiar ao lado
   - **Project API keys** → **anon public**: uma chave gigante começando com `eyJ...` → clique em copiar
4. **Guarde essas duas informações em um bloco de notas**. Vamos usar na Vercel.

> ⚠️ **NUNCA copie a `service_role` key** (ela é secreta e perigosa). Use só a `anon public`.

---

## PARTE 4: Conectar seu site na Vercel ao Supabase (3 minutos)

Seu site já está na Vercel. Agora vamos dizer a ele: "Ei, use o banco real!"

### Passo 8 - Adicionar variáveis na Vercel
1. Abra https://vercel.com/dashboard e faça login (mesmo GitHub)
2. Clique no seu projeto **Projeto-Etec** (ou nome que você deu)
3. No topo do projeto, clique em **"Settings"**
4. No menu lateral de Settings, clique em **"Environment Variables"**
5. Vai ter um formulário para adicionar variável:
   - **Key**: digite exatamente `VITE_SUPABASE_URL` (com underline, tudo maiúsculo, com VITE_ na frente, isso é obrigatório)
   - **Value**: cole a **Project URL** que copiou do Supabase (`https://...supabase.co`)
   - **Environment**: deixe marcado **Production, Preview e Development** (os 3)
   - Clique **Save**
6. Clique em **"Add Another"** e adicione a segunda:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: cole a chave `eyJ...` gigante
   - Marque os 3 ambientes de novo
   - **Save**

### Passo 9 - Fazer Redeploy (muito importante!)
Só adicionar as variáveis não atualiza o site automaticamente. Precisa mandar a Vercel construir de novo.

1. Ainda na Vercel, no topo, clique em **"Deployments"**
2. Vai ver lista de deploys. No primeiro da lista (o mais recente), clique nos **3 pontinhos** no canto direito → **"Redeploy"**
3. Na janela que abrir, **DESMARQUE** a opção "Use existing Build Cache" (deixe desmarcado) e clique **"Redeploy"**
4. Vai começar a construir de novo (leva 1-2 minutos). Espere ficar com status **"Ready"** com bolinha verde.

### Passo 10 - Verificar se funcionou
1. Abra seu site na Vercel (o link que você já usava para apresentar)
2. Na página inicial (Home), logo abaixo dos botões "Sou Candidato" e "Sou Empresa", deve aparecer um card:
   - Se aparecer **"Supabase Conectado - Live"** verde → **DEU CERTO!** 🎉 Está usando banco real!
   - Se ainda aparecer **"Modo Mock"** amarelo → as variáveis não foram lidas. Volte no Passo 8 e veja se escreveu exatamente `VITE_SUPABASE_URL` e se fez Redeploy sem cache.

---

## PARTE 5: Criar primeiro usuário e popular com dados (4 minutos)

Agora seu banco está vazio (sem vagas, sem empresas). Vamos criar o primeiro usuário e popular com dados de demonstração da cidade.

### Passo 11 - Criar usuário empresa no seu site
1. No seu site na Vercel, clique em **"Cadastre-se"** → **"Sou uma Empresa / Loja"**
2. Preencha:
   - Nome da Empresa: `Prefeitura Teste` (ou sua empresa)
   - CNPJ: pode inventar `00.000.000/0000-00` (por enquanto)
   - E-mail: use um email real seu, ex: `teste@empresa.com`
   - WhatsApp: seu número
   - Senha: `123456` (mínimo 6 caracteres, use algo fácil para teste)
   - Confirmar senha: mesma
3. Clique **"Concluir Cadastro"**
4. Se aparecer "Cadastro realizado! Verifique seu email" → é porque o Supabase está exigindo confirmação de email. Vamos resolver no próximo passo.

### Passo 12 - Confirmar email manualmente (para facilitar teste)
Por padrão, Supabase exige que usuário confirme email clicando em link. Para teste, vamos confirmar manualmente ou desativar.

**Opção A - Desativar confirmação (mais fácil para cidade no início):**
1. No Supabase → menu lateral → **"Authentication"** → **"Providers"** → clique em **"Email"**
2. Role para baixo e **DESMARQUE** a opção **"Confirm email"**
3. Clique **Save**
4. Agora novos cadastros não precisam confirmar email

**Opção B - Confirmar manualmente o usuário que você criou:**
1. No Supabase → **SQL Editor** → **New Query**
2. Cole isso (troque o email pelo que você usou):
```sql
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'teste@empresa.com';
```
3. **Run** → Success
4. Agora você pode fazer login com esse email e senha

### Passo 13 - Fazer login
1. No seu site → **Login** → **Sou Empresa** → digite email e senha que cadastrou
2. Clique Entrar → deve ir para `/empresa/painel`
3. Se der erro "Credenciais inválidas": volte no Passo 12 e confirme email

### Passo 14 - Popular com empresas e vagas demo (1 clique)
Agora que você tem um usuário empresa, vamos criar 3 empresas e 5 vagas de exemplo de Teodoro Sampaio automaticamente.

1. No Supabase → **SQL Editor** → **New Query**
2. No GitHub, copie conteúdo de `004_demo_seed_real.sql`
3. Cole no Supabase e **Run** → deve aparecer "Seed demo criado com sucesso!" no log (embaixo, na aba "Messages")
4. Vá em **Table Editor** → **companies** → deve aparecer 3 empresas
5. **Table Editor** → **jobs** → deve aparecer 5 vagas

**Volte no seu site na Vercel e recarregue a página inicial** → agora as vagas que aparecem são do banco real, não mais mock! 🎉

---

## PARTE 6: Testar fluxo completo de candidato

1. No seu site, **saia da conta** (botão Sair no painel empresa)
2. Cadastre-se como **Candidato**: nome, email diferente, senha
3. Confirme email (mesmo processo Passo 12) se necessário
4. Faça login como candidato → deve ir para `/candidato/painel`
5. Clique em **Vagas** → escolha uma vaga → **Candidatar-se**
6. Deve aparecer "Candidatura enviada com sucesso!"
7. No Supabase → **Table Editor** → **applications** → deve aparecer sua candidatura com status `enviada`
8. Faça login como empresa novamente → no futuro, o painel da empresa mostrará candidaturas (já está preparado com RLS, só falta migrar a tela que hoje ainda usa mock)

---

## PARTE 7: O que fazer se der erro (troubleshooting)

### Erro "Supabase não configurado" ainda aparece
- Você esqueceu de adicionar `VITE_` na frente. Tem que ser exatamente `VITE_SUPABASE_URL`, não `SUPABASE_URL`
- Você não fez Redeploy sem cache na Vercel
- Veja os logs na Vercel: Deployments → clique no deploy → View Logs → procure por erro

### Erro "Invalid API key"
- Você copiou a chave errada. Tem que ser `anon public`, não `service_role`
- Copie de novo em Project Settings → API → anon public

### Erro "new row violates row-level security" ao criar vaga
- Você está tentando criar vaga para empresa que não é sua. Verifique se `owner_profile_id` da empresa é igual ao seu `id` em `profiles`
- Para teste, desabilite RLS temporariamente (só para teste!): SQL Editor → `ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;` → Run. Depois habilite de novo: `ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;`

### Site na Vercel ficou em branco após Redeploy
- Abra o console do navegador (F12) → aba Console → veja erro
- Provavelmente erro de build. Vá na Vercel → Deployments → clique no deploy com erro → View Logs → copie erro e me envie

### Quero voltar para modo mock (desfazer)
- Na Vercel → Settings → Environment Variables → delete as duas variáveis `VITE_SUPABASE_*` → Redeploy → volta para mock

---

## ✅ Checklist final - Como saber que deu tudo certo?

- [ ] Supabase projeto criado em São Paulo, Free tier
- [ ] 3 migrations rodadas com Success (Table Editor mostra 15 tabelas, Storage mostra 4 buckets)
- [ ] Copiou URL e anon key
- [ ] Adicionou 2 envs na Vercel com `VITE_` e fez Redeploy sem cache
- [ ] Site na Vercel mostra "Supabase Conectado - Live" verde na Home
- [ ] Conseguiu cadastrar usuário empresa e fazer login
- [ ] Rodou `004_demo_seed_real.sql` e Table Editor → companies e jobs têm dados
- [ ] Recarregou site e vagas aparecem do banco real
- [ ] Cadastrou candidato e conseguiu se candidatar, aparece em applications no Supabase

Se marcou tudo, **parabéns!** Seu projeto saiu de estático para um sistema real, seguro, gratuito e pronto para a cidade toda usar! 🎉

---

## 📞 Próximos passos recomendados

1. **Google Login**: Supabase → Auth → Providers → Google → habilite (precisa criar projeto no Google Cloud, mas reduz fricção para moradores)
2. **Popular com empresas reais**: Table Editor → companies → Insert row, preencha com empresas reais de Teodoro Sampaio
3. **Migrar dashboards**: Me avise quando quiser que eu migre `CandidateDashboard` e `CompanyDashboard` para usar dados reais (já tenho services prontos, é 10 minutos)
4. **Backup**: Supabase faz backup automático no free tier, mas você pode exportar em Database → Backups

Qualquer erro, copie a mensagem de erro exata e me envie que eu te ajudo!
