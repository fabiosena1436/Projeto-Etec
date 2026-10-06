# Verificação dos painéis — 05/10/2026

## Verificado no navegador com contas reais

- Candidato: abertura do painel e das seções do perfil; carregamento dos dados do Supabase; salvamento das informações básicas após corrigir o erro do gatilho de preenchimento.
- Empresa: login, carregamento do painel, edição do perfil, salvamento com confirmação de sucesso e persistência após recarregar. O slogan usado no teste foi restaurado ao valor original vazio.
- Empresa: criação da vaga **TESTE TÉCNICO — NÃO SE CANDIDATAR** como **Rascunho**, reabertura no formulário e salvamento da edição. O rascunho permanece privado na conta para revisão, sem publicação ou exclusão.
- Empresa: painel em viewport de 390 × 844, sem transbordamento horizontal (largura do documento e conteúdo: 382 px). Console sem erros ou avisos durante essa inspeção.
- A sessão do candidato precisou de novo login antes de terminar a revisão responsiva; a página de acesso ficou preparada.

## Verificado automaticamente em PostgreSQL local

`npm run test:database` executa as migrações 001, 003 e 005–009 em PGlite. Verifica criação de perfis, bloqueio de cadastro como administrador, edição de vagas pelo proprietário, isolamento entre empresas, candidatura e rejeição de duplicatas, todos os status da seleção, notificações, favoritos privados, currículo restrito, histórico de vaga encerrada e revogação de acesso após desistência. Também impede que a empresa reative a candidatura retirada. Os testes administrativos verificam acesso restrito, revogação imediata, dados comerciais privados, limite de seis ofertas incluindo vencidas, suspensão da parceria e ativação condicionada a recebimento e período vigente.

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

Atualização de 05/10/2026: cinco vagas fictícias de exemplo foram publicadas a pedido do usuário e conferidas no painel de candidato e nas páginas públicas. O usuário enviou seu PDF e o painel exibiu `curriculo.pdf`; o conteúdo não foi aberto. A página `/parcerias` foi publicada e conferida visualmente no computador, com WhatsApp correto e sem erros de console. A conta de Fabio recebeu acesso administrativo mediante confirmação explícita; a verificação visual do painel depende do login nessa versão publicada.

- Upload e abertura de currículo fictício, avatar e logo.
- Publicação temporária da vaga de teste, favorito, candidatura, visualização pela empresa, mudança de status pelo painel, desistência e encerramento da vaga. Publicação e upload aguardam a resposta do usuário para o teste específico.
- Revisão visual final da versão atualizada dentro das duas contas em computador e celular; o candidato requer novo login, e a empresa estava conectada numa URL de implantação anterior.
- Cadastro de novas contas, confirmação e recuperação de senha por e-mail. SMTP personalizado permanece sem configuração; recuperação para usuários externos não está validada.
- Promoções de patrocinadores: a conta de empresa existente não é patrocinadora. Não se alterou esse privilégio para executar testes.

Não considerar a suíte local ou o build como comprovação de todos os fluxos reais. Esta lista registra exatamente o que foi executado e o que falta.


## Alterar senha dentro da conta — 06/10/2026

Disponível no código em Minha conta → Alterar senha, rota protegida /conta/alterar-senha para todos os tipos de conta. No menu móvel, a opção aparece junto dos atalhos da conta. Solicita senha atual, nova senha e confirmação; mostrar/ocultar senhas é opcional. A nova senha segue o mínimo de oito caracteres e os requisitos existentes. A senha antiga não precisa cumprir as regras novas.

O fluxo verifica a identidade autenticada pelo Supabase, reautentica com e-mail da própria conta e senha atual, confirma a sessão retornada e usa updateUser com password e current_password. Não imprime nem grava senhas em logs/localStorage. Não modifica papéis de conta nem utiliza credenciais administrativas. Contas de demonstração não simulam uma troca real.

A reautenticação verifica a senha atual mesmo sem a opção global do Auth estar ativada. A configuração global de exigir senha atual no Supabase continua uma proteção separada para chamadas fora desta tela; não foi alterada no painel nesta sessão. Referências: [senha e verificação atual](https://supabase.com/docs/guides/auth/passwords), [configuração de segurança](https://supabase.com/docs/guides/auth/password-security). O SDK instalado é 2.116.0; o mínimo declarado foi atualizado para 2.102.0, que suporta current_password.

O link Esqueci minha senha atual abre diretamente o formulário de recuperação em /login?recuperar=1, inclusive quando a conta ainda está conectada. A recuperação por e-mail depende da configuração SMTP já registrada como pendente.

Build e npm run test:auth passaram. Testes com um cliente de Auth simulado verificaram senha antiga fraca aceita, senha atual incorreta, sessão inválida/outra conta, ausência de sessão de reautenticação, senha nova fraca/igual e rejeição pelo servidor. Não foi alterada a senha de nenhuma conta real nem executado teste visual/HTTP no navegador. Esta funcionalidade não exige migration SQL; precisa publicar o frontend. Validação pendente: candidato/empresa/admin, menu desktop/móvel, troca em conta de teste e entrada com a nova senha.
