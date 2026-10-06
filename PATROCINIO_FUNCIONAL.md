# Divulgação dos parceiros — operação e ativação

## Entregas no código

- Home: até três empresas distintas, logo, oferta/foto/preço/validade e link para a vitrine, após as oportunidades. Substitui a faixa antiga de apoiadores.
- Comunidade: um cartão lateral em telas acima de 700 px; abaixo disso, um cartão após o sexto post. Não aparece em feed compacto, filtro de uma empresa ou feed móvel com menos de seis posts. Não se repete na paginação.
- Listagem e vitrine: selo textual de parceiro; a empresa patrocinadora abre sua vitrine pela listagem.
- Link de oferta abre a vitrine e rola para o produto específico. Pode abrir WhatsApp; sem oferta ativa, a empresa recebe um cartão institucional.
- Painel da empresa: relatório dos últimos 30 dias por espaço, exibições, cliques, acessos à vitrine, cliques no WhatsApp e taxa de cliques. O contador antigo foi identificado como visualizações de vagas.
- A página de parcerias descreve o pacote e os espaços compartilhados. Contratação continua pelo WhatsApp e controle manual do administrador; não foi adicionado pagamento automático.

## Rodízio e medição

`sponsor_placements` distribui três posições na Home e uma na comunidade, priorizando empresas com menos exibições medidas, depois menos seleções recentes. Cada empresa participa com uma oferta, escolhida entre as ativas/válidas com menos seleções recentes. Cadastro de seis ofertas não equivale a seis posições. Parceiros sem oferta recebem um cartão institucional.

A sessão é um UUID aleatório por aba, guardado em sessionStorage (fallback em memória). A seleção é estável durante o dia do servidor e compartilhada entre remontagens da mesma aba. Pausas/vencimento/inativação são conferidos no servidor a cada seleção. A distribuição considera quantidade, não garante igualdade de alcance: posição, interesse do público, disponibilidade e tamanho de tela influenciam a exposição real.

Cada cartão recebe um token aleatório emitido pelo banco, ligado à empresa e ao espaço. A exibição só é enviada após pelo menos 50% do cartão permanecer no viewport por um segundo com a aba visível. Não conta apenas por carregar a página. Eventos repetidos são deduplicados por token; isso resulta em uma contagem por seleção/sessão/dia, não em pessoas únicas nem em todas as visualizações repetidas. A nova aba ou dia pode gerar nova seleção.

Cliques na oferta, abertura da vitrine pelo link atribuído e cliques no WhatsApp são eventos separados. A atribuição depende do parâmetro `divulgacao` e dura até sete dias. Acesso direto à loja sem esse parâmetro não conta como visita originada no patrocínio. Abrir WhatsApp não comprova envio de mensagem/venda. O proprietário conectado e administradores ativos são excluídos dos resultados; testes desconectados não podem ser identificados como administrativos.

As contagens são agregadas no relatório; sessões/tokens não são expostos. Apenas dono da empresa e superadministrador podem consultar o relatório. Leitura/escrita direta na tabela fica bloqueada por RLS e privilégios. Eventos precisam de token emitido e empresa correspondente; parâmetros inválidos não criam registros. A medição é feita no cliente e pode ser perdida por conexão, bloqueadores ou abandono; não é certificação antifraude nem comprovação independente de tráfego.

Proteção de volume: no máximo 20 seleções emitidas por sessão/hora e 10.000 registros novos por dia em toda a plataforma. Atingido o orçamento global, sessões novas ficam sem novos cartões; seleções existentes continuam disponíveis. Registros com mais de 45 dias são removidos durante uma próxima solicitação de seleção. Isso limita os registros, mas não substitui monitoramento do tráfego/RPC contra automação abusiva. Não ativar billing adicional automaticamente.

## Ativação em produção

1. Aplicar `supabase/migrations/012_community_images.sql`, pendente da entrega anterior, para habilitar fotos de posts.
2. Aplicar `supabase/migrations/013_sponsor_visibility.sql`, após as migrations anteriores. É reaplicável.
3. Publicar o frontend deste commit. A migration deve preceder a divulgação comercial dos relatórios.
4. Como administrador, ativar parceria com recebimento confirmado e datas corretas; como empresa, cadastrar uma oferta ativa com validade futura. Não há alteração de patrocínio real nem criação de anúncios fictícios nesta implementação.
5. Como visitante desconectado ou outra conta, abrir Home/comunidade, visualizar o cartão por um segundo, clicar na oferta e abrir WhatsApp. Depois consultar o painel da empresa e atualizar o relatório. Testar pausa/vencimento e atualizações de página.

Compatibilidade: se o banco ainda não tiver os RPCs novos, o frontend consegue apresentar empresas/ofertas públicas existentes com seleção simples e estável no navegador, sem métricas inventadas. O painel explica que o relatório precisa da atualização. Esse fallback não oferece o rodízio do servidor nem comprovação de exposição.

## Verificação desta entrega

- Build TypeScript/Vite e testes de autenticação/imagens passaram.
- PGlite executou as migrations, reaplicação, seleção anônima, três empresas/uma posição por empresa, estabilidade, rodízio, fallback institucional, exclusão de oferta expirada, pausa/vencimento/inatividade, eventos deduplicados, exclusão de testes do dono/admin, privacidade de relatório e limite global de registros.
- O navegador retornou timeout ao iniciar a automação. A aplicação da migration em produção e a validação visual/HTTP de ponta a ponta ainda estão pendentes. Os testes SQL locais não substituem a verificação de IntersectionObserver, rolagem por âncora ou clique real no navegador.

Validação visual pendente: larguras 375, 700, 768, 1024 e 1440 px; conferir que existe só um espaço comercial na comunidade, nenhum cartão antes do sexto post móvel, preço zero aparece corretamente, links abrem a oferta certa e o layout não transborda.
