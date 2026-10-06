# Conecta Jovens — operação de parcerias

Responsável: Fabio V. Sena. Contato comercial: https://wa.me/5518981579318.

## Modelo escolhido

Candidatos acessam gratuitamente. Empresas podem cadastrar seu perfil, publicar vagas e acompanhar candidaturas gratuitamente. A receita vem da divulgação comercial opcional, negociada diretamente com Fabio pelo WhatsApp. Não haverá tabela pública de preços nem cobrança automática nesta primeira etapa.

O patrocínio tem início e fim registrados. Fabio confirma o recebimento ou uma cortesia, ativa a parceria e acompanha a renovação. Negociações pendentes, em atraso, pausadas ou canceladas não liberam o destaque. Ao vencer, o destaque e as ofertas deixam de aparecer; os dados permanecem para renovação. A renovação é manual.

## O espaço da patrocinadora no código atual

- Logo e nome no espaço de apoiadores da plataforma.
- Página da empresa com descrição, ramo, slogan, endereço, site, WhatsApp e vagas abertas.
- Imagem de capa na vitrine durante a vigência.
- Até seis produtos, serviços ou ofertas: foto da galeria ou URL HTTPS, descrição, valor original/opcional, valor promocional/opcional e validade. A melhoria de envio de fotos está no código; a ativação do bucket de posts e a publicação do frontend ainda estavam pendentes na revisão de 06/10/2026.
- Identificação de patrocinadora nos cartões e prioridade da empresa nas buscas de vagas.
- Empresa gerencia conteúdo no próprio painel; Fabio controla liberação e validade.

São espaços de divulgação, sem promessa de vendas, contratação, quantidade de visitas ou exclusividade territorial. Fotos devem ser próprias ou autorizadas. Vagas e ofertas fictícias de teste precisam continuar identificadas como exemplo.

## Painel do superadministrador

`/admin/painel`: contadores, pesquisa de empresas e usuários, verificação administrativa, gerenciamento de acordos e histórico de alterações. Acesso concedido por cadastro administrativo separado; ser empresa ou informar o e-mail de Fabio no cadastro não concede essa permissão. Senhas e currículos não são expostos pelo painel administrativo.

O valor exibido é o **valor mensal contratado**, não o saldo de uma conta nem comprovação bancária. O status de recebimento é um registro manual. Esta etapa não gera notas fiscais, não cobra Pix/cartão, não bloqueia usuários e não oferece exclusão de contas. Essas operações precisam de fluxos próprios antes de serem disponibilizadas.

## Formação de preço e controle

Negociar valor e período considerando a produção de material, atendimento, manutenção, domínio, hospedagem e e-mail. A mensalidade deve remunerar tanto o espaço quanto o trabalho de manter a divulgação atualizada. Registrar no acordo o que está incluído, a data de renovação e como funciona uma pausa.

Simulação para planejamento, não preço definido nem projeção de vendas: com valor hipotético de R$ 99 por empresa/mês, 5 patrocinadoras representam R$ 495, 10 representam R$ 990 e 20 representam R$ 1.980 de receita bruta mensal. Resultado operacional = recebimentos reais − custos e despesas. Reservar parte da receita para manutenção e crescimento; descontos e cortesias precisam de prazo.

Priorizar o lançamento com poucas empresas e acompanhar a procura real antes de criar vários planos. O primeiro pacote tem um conjunto único de benefícios; personalizações são combinadas por atendimento.

## Infraestrutura e custos verificados em 05/10/2026

O Supabase Free inclui 500 MB de banco e 1 GB de arquivos, com pausas por inatividade e sem backups automáticos do plano pago: https://supabase.com/pricing. Monitorar consumo, especialmente currículos e imagens, e prever rotina de backup.

O plano gratuito Vercel Hobby é restrito a uso pessoal não comercial: https://vercel.com/docs/plans/hobby. Antes de começar a cobrar patrocínios, usar uma hospedagem que permita a operação comercial ou um plano Vercel apropriado. A implementação não altera planos, contrata serviços ou faz pagamentos. SMTP para recuperação de senha de usuários externos continua pendente.

## Ativação do primeiro administrador

A migração 009 não concede acesso a ninguém. Depois da aprovação de Fabio, conceder apenas à conta existente `fabiosena1436@gmail.com`, cujo ID deve ser conferido no banco. Essa conta mantém seu perfil de empresa; o privilégio administrativo é separado. Não colocar chaves secretas no frontend e não criar uma opção pública de cadastro como administrador.

## Pesquisa de divulgação discreta — 06/10/2026

Esta seção registra a proposta pesquisada e suas regras. Em 06/10/2026, o primeiro conjunto de espaços, rodízio e relatório de 30 dias foi implementado no código. A ativação das migrations em produção e a publicação do frontend ainda estavam pendentes; não vender entregas como disponíveis antes dessa ativação. Veja PATROCINIO_FUNCIONAL.md para o estado efetivo.

### O que outras plataformas fazem

| Plataforma | Participação comercial descrita pela própria plataforma | Aplicação possível ao Conecta Jovens |
| --- | --- | --- |
| Nextdoor | Anúncios de ofertas e negócios locais aparecem no feed dos vizinhos; podem direcionar para site ou contato e têm um painel de desempenho. | Levar uma oferta até quem navega pela comunidade, antes de entrar na loja. |
| LinkedIn | Publicações patrocinadas aparecem no feed e são identificadas abaixo do nome da empresa como conteúdo promovido/patrocinado. | Cartão com aparência consistente com o site e identificação comercial visível. |
| Yelp | Resultados patrocinados podem aparecer antes dos resultados comuns e em áreas identificadas da busca. | Destaque comercial separado e relacionado à categoria buscada, sem substituir os resultados comuns. |

Fontes primárias: [Nextdoor Ads](https://business.nextdoor.com/en-us/local/localdealstransition), [formatos e identificação no LinkedIn](https://www.linkedin.com/help/linkedin/answer/a7162175), [ordenação de resultados do Yelp](https://www.yelp-support.com/article/How-does-Yelp-determine-its-search-results?l=en_US).

A pesquisa confirma formatos usados por essas plataformas; não demonstra que um espaço específico terá retorno no nosso site. Quantidade de anúncios, rodízio e desenho abaixo são recomendações próprias para a plataforma local, não limites copiados desses serviços.

### Diagnóstico do projeto

O código já apresenta logo/nome no bloco de apoiadores da Home, estrela na listagem de empresas e selo de parceira nas publicações da empresa. A vitrine e as ofertas estão dentro da página da patrocinadora. Logo, já existe identificação fora da loja, mas falta apresentar o produto/oferta antes do clique e medir essa exposição.

O contador atual de visualizações do painel soma visualizações de vagas. Não representa visualizações de anúncios, ofertas ou visitas à loja e não pode ser usado como comprovação de alcance de patrocínio.

### Pacote recomendado: Parceiro da cidade

Começar com um único pacote mensal de divulgação local, com valor negociado diretamente, mantendo candidatos e recrutamento gratuitos. Vender presença em espaços definidos, atualização da vitrine e relatório de divulgação. Não prometer vendas, clientes, posição permanente no topo ou alcance mínimo antes de haver dados.

| Local | Entrega proposta | Limite inicial para preservar a navegação |
| --- | --- | --- |
| Página inicial | Um bloco “Ofertas dos parceiros”, com logo/nome, uma foto, oferta, preço quando aplicável e “Ver oferta”. | Até três empresas diferentes por visita. Substitui o bloco atual de apoiadores, evitando dois blocos de patrocínio na mesma página. |
| Comunidade no computador | Um cartão compacto “Patrocinado · Parceiro da cidade” na coluna lateral, com uma oferta. | Um único cartão; sem repetição simultânea no feed. |
| Comunidade no celular/tablet sem coluna lateral | O mesmo espaço em um cartão após a sexta publicação comum, sem interromper o início da conversa. | No máximo uma inserção por visita; se houver menos de seis posts, omitir o espaço. Paginação não cria novas inserções. |
| Lista e página da empresa | Identificação textual “Parceiro da cidade”, além da vitrine, capa e até seis ofertas válidas. | Selo discreto; patrocínio não representa avaliação de qualidade nem verificação administrativa. |

Uma empresa pode ter seis ofertas cadastradas, mas participa do rodízio com uma oferta escolhida, para não receber seis vezes mais exposição. Mostrar apenas ofertas ativas, dentro da validade e de patrocínios vigentes, com imagem opcional e descrição legível. Quem não tiver oferta válida pode participar com um cartão institucional de negócio local, claramente identificado.

Recomendo começar sem outro espaço comercial na busca de vagas. O código já prevê prioridade de patrocinadoras nas vagas; na evolução, reavaliar essa regra para preservar a relevância da busca e usar os espaços comerciais próprios para promover o negócio.

### Rodízio e limites de exposição

- Manter participação equilibrada entre empresas elegíveis ao longo das visitas, com controle das exposições reais por posição. Ordem fixa ou somente sorteio no navegador não comprova distribuição equilibrada.
- Home: três empresas distintas; comunidade: uma empresa. Não repetir a mesma empresa dentro do mesmo conjunto de cartões.
- Manter a seleção estável enquanto a pessoa estiver na página. Não usar carrossel com troca automática nem anúncios que se expandem.
- Pausa, vencimento e oferta expirada retiram o conteúdo dos espaços comerciais; respeitar a elegibilidade também no servidor.
- Não preencher espaços vazios com anúncios duplicados. Com uma patrocinadora, mostrar somente um cartão.
- Não usar pop-ups, vídeo automático, banners piscando, patrocínio fixo cobrindo a tela ou notificações promocionais não solicitadas.
- O público pode ver as ofertas e a identificação das patrocinadoras. O convite para contratar patrocínio continua restrito às contas de empresa.

### O que a empresa recebe no relatório

Proposta de métricas novas: exibições dos cartões, cliques em “Ver oferta”, visitas à vitrine e cliques para abrir o WhatsApp, separados por espaço e período. Cliques de WhatsApp não comprovam mensagem enviada nem venda. Não somar essas métricas como se fossem pessoas únicas.

Definir “exibição” no produto: por exemplo, pelo menos metade do cartão visível por um segundo; carregar um cartão fora da tela não conta. Deduplicar eventos repetidos e excluir testes administrativos quando possível. Implementar registro e validação no servidor, relatório agregado e acesso restrito à própria empresa/administrador. Esses critérios são proposta de medição, não funcionalidade existente.

Relatório mensal: o que apareceu, quantas exibições válidas, quantos cliques, taxa de cliques quando houver exibições e comparação com o período anterior. Registrar quando não houver dados suficientes. Um relatório honesto também mostra zero.

### Validação comercial antes de ampliar

Fazer um piloto de 30 dias com poucas empresas e um pacote único. Combinar prazo, espaços compartilhados, materiais necessários, limite de ofertas e renovação manual. Valor de entrada deve considerar audiência real e trabalho de atendimento; a simulação de R$ 99 acima continua sendo apenas hipótese, não preço recomendado pela pesquisa.

Medir se as pessoas veem e clicam nas ofertas, colher retorno das patrocinadoras e observar se há reclamações ou abandono da comunidade. Sem tráfego real não dá para afirmar que a mensalidade compensa. Aumentar a quantidade de parceiros sem multiplicar os espaços reduz a exposição média por empresa; comunicar o rodízio e revisar a capacidade antes de vender mais participações.

Ordem proposta de implementação: bloco único na Home e selo textual; espaço único na comunidade adaptado ao dispositivo; coleta de métricas e relatório; piloto comercial. Atualizar a página de parcerias e as condições do acordo somente com as entregas efetivamente disponíveis.

## Implementação inicial — 06/10/2026

A Home agora substitui a faixa de logos por um bloco de até três ofertas após a seção de oportunidades. A comunidade apresenta um cartão lateral acima de 700 px ou uma inserção após o sexto post em telas menores; páginas compactas e feeds filtrados por empresa não recebem inserção comercial. Há identificação textual na listagem e vitrine das empresas e links para a oferta escolhida.

O rodízio do servidor considera exibições registradas e seleções recentes; cada empresa ocupa uma posição por espaço, independentemente de quantas ofertas tem. A seleção fica estável por sessão de navegador/dia, sem promessa de igualdade exata de alcance. O relatório implementado cobre 30 dias e discrimina os dois espaços; comparação com mês anterior e escolha manual da oferta ainda não estão implementadas.

O fluxo preserva a ordenação atual das vagas. A recomendação de reavaliar a prioridade por patrocínio permanece uma evolução separada. Ofertas são elegíveis conforme status ativo e validade; patrocínio pausado, vencido ou dono inativo não participa.
