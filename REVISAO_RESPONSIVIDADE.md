# Revisão de responsividade — 06/10/2026

## Ajustes no projeto

- Grades de vagas, ofertas, formulários e perfis respeitam a largura disponível,
  incluindo telas de 320 px, sem depender de uma largura mínima fixa do cartão.
- Textos longos, links e nomes podem quebrar linha. Imagens e ícones mantêm suas
  dimensões sem empurrar as informações para fora dos cartões.
- O menu público passa para o formato recolhido até 1200 px e permite rolagem
  interna em telas com pouca altura.
- A comunidade tem três colunas acima de 1100 px, duas entre 701 e 1100 px e uma
  até 700 px. No formato de duas colunas, novidades ficam abaixo dos atalhos,
  enquanto o feed ocupa a outra coluna.
- Os detalhes de vaga usam uma coluna até 960 px. A lateral fixa fica abaixo do
  cabeçalho e é desativada em telas com até 700 px de altura.
- A apresentação da página inicial usa uma coluna até 850 px. A busca separa o
  botão do campo até 480 px. Links podem ocupar mais de uma linha.
- Painéis permitem quebrar cabeçalhos e ações em linhas. Nomes extensos na barra
  superior são abreviados visualmente; a navegação inferior preserva a área segura.
- O rodapé usa duas colunas até 800 px e uma até 380 px. Login e cartões de perfil
  usam menos espaço interno em telas pequenas.

## Verificação realizada

- `npm run build`: passou (TypeScript e build de produção).
- `npm run test:auth`: passou (políticas de senha e acesso continuam válidas).
- `git diff --check`: passou.
- Revisão do código dos layouts públicos, formulários, perfis, painéis e comunidade.

## Verificação visual pendente

A conexão do navegador não respondeu. Os resultados acima não substituem testes
de layout renderizado. A atualização também precisa ser publicada antes de ser
avaliada no site online.

Quando o navegador estiver disponível, conferir 320, 375, 390, 430, 768, 820,
1024, 1280, 1440 e 1920 px, além de orientação horizontal e zoom de 200%.
Nas páginas públicas e nos painéis de candidato, empresa e administrador:

- Confirmar que a página inteira não tem rolagem horizontal; carrosséis e abas
  podem rolar dentro de seus próprios limites.
- Conferir nomes, e-mails, títulos de vagas e publicações extensos.
- Abrir o menu, comentários, notificações e edição de perfil; conferir que ações
  continuam visíveis e utilizáveis sem sobreposição.
- Rolar os detalhes de vaga para conferir a lateral e o cabeçalho fixo.
- Conferir teclado virtual e navegação inferior no celular.
