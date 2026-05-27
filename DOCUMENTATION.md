# Conecta Teodoro Sampaio - Plataforma de Empregabilidade Local

## 📌 Visão Geral do Projeto
O **Conecta Teodoro Sampaio** é uma plataforma de empregabilidade avançada, projetada para impulsionar o desenvolvimento econômico de Teodoro Sampaio. Atuando como uma rede profissional hiperlocal ("LinkedIn local"), ela conecta empresas, trabalhadores, estudantes e oportunidades.

Nesta nova etapa de evolução, o projeto deixa de ser apenas um **Protótipo Funcional Estático (MVP Visual)** e passa a integrar uma **Arquitetura de Inteligência Artificial**. Utilizando o poder da **Generative UI**, o sistema é capaz de adaptar a interface em tempo real dependendo do usuário, oferecendo personalização sem precedentes. O backend está sendo estruturado para alavancar IA generativa na borda (Edge) e fluxos de pensamento complexos via Firebase.

---

## 🛠️ Stack Tecnológica e Arquitetura
A arquitetura do projeto evoluiu para um modelo de aplicação inteligente, serverless e de latência zero:

*   **Core Frontend:** React.js com TypeScript e Vite.
*   **Estilização & UX:** Styled Components, focando em "Mobile First" e **Generative UI** para adaptação de interface baseada em contexto.
*   **Inteligência Artificial:** Vercel AI SDK para criação de chats, agentes autônomos e geração aumentada por recuperação (RAG) direto na Edge.
*   **Backend & Cloud (Em Implementação):** Firebase (Firestore como banco de dados principal, Cloud Functions para executar lógica de Engenharia de Prompt e Chain-of-Thought). Integração futura com Bancos Vetoriais para memória de longo prazo da IA.
*   **Hospedagem & Edge Computing:** Vercel, entregando respostas instantâneas na borda global.

---

## ✅ O Que Já Foi Feito (Status Atual Consolidado)

O núcleo do projeto, o fluxo de visitantes e a estrutura da Área do Candidato já foram construídos.

### 1. Estrutura e Configuração Global
- [x] Diretórios separados em `/pages`, `/components`, `/layouts`, `/data`, `/styles` e `/routes`.
- [x] `theme.ts` implementado com paleta de cores consistente e tipado globalmente (`styled.d.ts`).
- [x] `global.ts` configurado para zerar margens e comportamentos padrão do navegador.

### 2. Roteamento e Layouts (Crucial para a sensação de sistema real)
- [x] **`DefaultLayout` (Fluxo Público):** Possui um Top Header profissional e Footer Institucional. Usado na Landing Page (`/`).
- [x] **`DashboardLayout` (Fluxo Logado):** Design inspirado em Apps. No Desktop, possui apenas um Header minimalista com menu de perfil. No Mobile, **possui uma Bottom Navigation Bar fixa** com ícones de navegação (Início, Vagas, Salvas, Perfil), igual a aplicativos como LinkedIn ou Instagram.
- [x] **Rota Full-screen:** Rota `/login` mapeada por fora de layouts para ocupar a tela 100% livre de distrações (`100dvh`).

### 3. Dados Mockados (Fake DB)
- [x] `users.ts`: Dados falsos de candidatos com nome, habilidades e experiências.
- [x] `companies.ts`: Dados de empresas locais de Teodoro Sampaio.
- [x] `jobs.ts`: Vagas ativas, salários, e requisitos.

### 4. Páginas Implementadas
- [x] **Landing Page (`/`):** Hero section impactante com CTAs, painel de "Métricas Falsas" (vagas abertas, currículos) e grade de Diferenciais/Impacto Social.
- [x] **Tela de Login (`/login`):** Modo "Demonstração" limpo, sem formulários cansativos. Com botões grandes para entrar como "Candidato" ou "Empresa".
- [x] **Painel do Candidato (`/candidato/painel`):** Dashboard pessoal saudando o usuário, exibindo Cards de Métricas (`Candidaturas`, `Visualizações no Perfil`) e listando as "Vagas Recomendadas" dinamicamente baseadas nas vagas ativas.

---

## 🚀 O Que Ainda Falta Fazer (Checklist de Próximos Passos)

Agora, o desenvolvimento entra nas fases de conclusão dos fluxos internos (Perfis, Tela da Empresa e Polimento de Interação).

### 🗓️ Fase 2: Área do Candidato (Restante)
- [x] **Candidate Profile (Perfil Público):** Tela `/candidato/:id` no formato "Currículo Digital", exibindo a foto mockada, experiências, sobre mim, e habilidades (usando o `users.ts`).
- [x] **Tela de Detalhes da Vaga (`/vagas/:id`):** Construir a visão completa da vaga contendo botão de "Candidatar-se".
- [x] **Ação de Candidatura:** Implementar biblioteca de notificação (ex: `sonner`) para disparar um "Toast" avisando: "Candidatura enviada para a empresa com sucesso!" ao clicar no botão.

### 🗓️ Fase 3: Área da Empresa (Fluxo Empresarial)
- [x] **Company Dashboard (`/empresa/painel`):** Painel da empresa (usando o `DashboardLayout`) listando vagas que ela publicou, número de visualizações e candidatos aplicados.
- [x] **Simulação de Criação de Vaga:** Formulário limpo de cadastro de vaga que não salva de verdade, mas que dispara notificação de sucesso e redireciona de volta para o Dashboard.

### 🗓️ Fase 4: Experiência Premium (Generative UI & UX)
- [x] Refinar as páginas para garantir que em todas elas (especialmente detalhes da vaga e perfil do candidato) não existam rolagens excessivas ou vazamentos horizontais.
- [x] Adicionar suporte a Toasts globais na raiz (`App.tsx`).
- [x] **Polimento Pré-Apresentação:** Conectar todos os botões primários aos fluxos corretos (Home -> Login, Login -> Painéis Direcionados, Layouts Dinâmicos por Tipo de Usuário).

### 🗓️ Fase 5: Deploy e Apresentação do MVP
- [x] Criar arquivo `vercel.json` na raiz para configurar o *rewrite* das rotas do React Router (`/*` -> `/index.html`) para evitar erro 404 ao atualizar a página na Vercel.
- [x] Rodar o build do projeto (`npm run build`) para auditar possíveis erros do TypeScript.
- [ ] Deploy na **Vercel**.
- [ ] Gerar QR Code final com o link de produção para usar no dia da apresentação em Teodoro Sampaio.

### 🧠 Fase 6: Evolução para IA e Backend Real (Próximos Passos)
- [ ] **Configuração do Firebase:** Inicializar o projeto no Firebase e estruturar as coleções do Firestore (Users, Jobs, Applications).
- [ ] **Integração Vercel AI SDK:** Criar endpoints na borda para assistência interativa e Generative UI.
- [ ] **Agentes e Cloud Functions:** Desenvolver fluxos de orquestração de IA via Firebase Cloud Functions utilizando técnicas de Chain-of-Thought e RAG para casar perfeitamente os candidatos às vagas sem alucinações.
- [ ] **Banco Vetorial:** Implementar memória persistente e buscas semânticas de alta precisão entre currículos e descrições de vagas.
