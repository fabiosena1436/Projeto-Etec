# Verificação dos painéis — 05/10/2026

## Verificado no navegador com contas reais

- Candidato: abertura do painel e das seções do perfil; carregamento dos dados do Supabase; salvamento das informações básicas após corrigir o erro do gatilho de preenchimento.
- Empresa: login, carregamento do painel, edição do perfil, salvamento com confirmação de sucesso e persistência após recarregar. O slogan usado no teste foi restaurado ao valor original vazio.
- Empresa: criação da vaga **TESTE TÉCNICO — NÃO SE CANDIDATAR** como **Rascunho**, reabertura no formulário e salvamento da edição. O rascunho permanece privado na conta para revisão, sem publicação ou exclusão.
- Empresa: painel em viewport de 390 × 844, sem transbordamento horizontal (largura do documento e conteúdo: 382 px). Console sem erros ou avisos durante essa inspeção.
- A sessão do candidato precisou de novo login antes de terminar a revisão responsiva; a página de acesso ficou preparada.

## Verificado automaticamente em PostgreSQL local

`npm run test:database` executa as migrações 001, 003 e 005–008 em PGlite. Verifica criação de perfis, bloqueio de cadastro como administrador, edição de vagas pelo proprietário, isolamento entre empresas, candidatura e rejeição de duplicatas, todos os status da seleção, notificações, favoritos privados, currículo restrito, histórico de vaga encerrada e revogação de acesso após desistência. Também impede que a empresa reative a candidatura retirada.

Os testes novos reproduzem o problema do preenchimento do perfil e verificam inserção/remoção de habilidades e experiências. Esse teste local não valida os serviços reais de Auth, Storage ou SMTP.

`npm run build` passou. `npm audit --omit=dev` retornou zero vulnerabilidades nas dependências de produção.

## Correções de interface e comportamento

- Marca consistente e navegação do painel também no computador.
- Rótulos associados aos campos, abas com estado selecionado e envio de imagem acessível pelo teclado.
- Cancelamento da edição restaura os dados salvos; currículo privado abre sem depender de popup depois de uma requisição assíncrona.
- Edição de vaga encerrada preserva o status; rascunhos têm ação explícita de publicar e não oferecem página pública antes disso.
- Vagas aparecem antes da divulgação de patrocínio; indicadores da empresa ficam compactos no celular.
- Validação de formato de arquivos e ordem das datas; idade vazia pode ser removida do perfil.
- Erros de carregamento não são tratados como sucesso silencioso e mensagens internas de configuração foram removidas da interface.

## Ainda pendente no navegador

- Upload e abertura de currículo fictício, avatar e logo.
- Publicação temporária da vaga de teste, favorito, candidatura, visualização pela empresa, mudança de status pelo painel, desistência e encerramento da vaga. Publicação e upload aguardam a resposta do usuário para o teste específico.
- Revisão visual final da versão atualizada dentro das duas contas em computador e celular; o candidato requer novo login, e a empresa estava conectada numa URL de implantação anterior.
- Cadastro de novas contas, confirmação e recuperação de senha por e-mail. SMTP personalizado permanece sem configuração; recuperação para usuários externos não está validada.
- Promoções de patrocinadores: a conta de empresa existente não é patrocinadora. Não se alterou esse privilégio para executar testes.

Não considerar a suíte local ou o build como comprovação de todos os fluxos reais. Esta lista registra exatamente o que foi executado e o que falta.
