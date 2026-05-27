# Conecta Teodoro Sampaio - Plataforma de Empregabilidade Local

## 📌 Visão Geral do Projeto
O **Conecta Teodoro Sampaio** é um protótipo premium de uma plataforma de empregabilidade voltada exclusivamente para o desenvolvimento econômico do município de Teodoro Sampaio. O objetivo é atuar como uma rede profissional local ("LinkedIn local"), conectando empresas, trabalhadores, estudantes em busca do primeiro emprego e oportunidades da região.

Este projeto está sendo construído como um **Protótipo Funcional Estático (MVP Visual)**. Ele não possui um back-end real ou banco de dados no momento, mas simula uma experiência completa de ponta a ponta utilizando dados mockados (fictícios) e rotas dinâmicas. Isso é perfeito para apresentações institucionais e validação da ideia com a prefeitura, comércio local e sindicatos.

---

## 🛠️ Stack Tecnológica e Arquitetura
A arquitetura do projeto foi desenhada para ser moderna, responsiva ("Mobile First" com sensação de App) e escalável:

*   **Core:** React.js com TypeScript e Vite.
*   **Estilização:** Styled Components (CSS-in-JS).
*   **Roteamento:** React Router DOM (Múltiplos layouts controlando fluxo público vs. logado).
*   **Design Pattern:** Componentização estrita (separação entre Lógica `index.tsx` e Estilos `styles.ts`).
*   **UX / UI (Mobile First):** Uso intensivo de `100dvh` para telas limpas, *Bottom Navigation Bar* exclusiva para mobile, omitindo componentes desnecessários em telas pequenas para simular um App nativo.
*   **Ícones:** Lucide React.
*   **Hospedagem (Planejado):** Vercel.

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
- [ ] **Tela de Detalhes da Vaga (`/vagas/:id`):** Construir a visão completa da vaga contendo botão de "Candidatar-se".
- [ ] **Ação de Candidatura:** Implementar biblioteca de notificação (ex: `sonner`) para disparar um "Toast" avisando: "Candidatura enviada para a empresa com sucesso!" ao clicar no botão.

### 🗓️ Fase 3: Área da Empresa (Fluxo Empresarial)
- [ ] **Company Dashboard (`/empresa/painel`):** Painel da empresa (usando o `DashboardLayout`) listando vagas que ela publicou, número de visualizações e candidatos aplicados.
- [ ] **Simulação de Criação de Vaga:** Formulário limpo de cadastro de vaga que não salva de verdade, mas que dispara notificação de sucesso e redireciona de volta para o Dashboard.

### 🗓️ Fase 4: Experiência Premium (Generative UI & UX)
- [ ] Refinar as páginas para garantir que em todas elas (especialmente detalhes da vaga e perfil do candidato) não existam rolagens excessivas ou vazamentos horizontais.
- [ ] Adicionar suporte a Toasts globais na raiz (`App.tsx`).

### 🗓️ Fase 5: Deploy e Apresentação
- [ ] Criar arquivo `vercel.json` na raiz para configurar o *rewrite* das rotas do React Router (`/*` -> `/index.html`) para evitar erro 404 ao atualizar a página na Vercel.
- [ ] Rodar o build do projeto (`npm run build`) para auditar possíveis erros do TypeScript.
- [ ] Deploy na **Vercel**.
- [ ] Gerar QR Code final com o link de produção para usar no dia da apresentação em Teodoro Sampaio.
