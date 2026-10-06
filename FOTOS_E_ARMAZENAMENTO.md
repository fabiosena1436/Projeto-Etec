# Fotos da plataforma

## Experiência implementada

- Comunidade: escolher uma foto da galeria, ver a prévia, remover ou usar um link HTTPS. Funciona ao publicar e editar, como pessoa ou empresa.
- Ofertas e capa da empresa: o mesmo seletor de foto e link.
- Avatar e logo: seleção de arquivo existente passa a comprimir imagens raster antes do envio. SVG da logo continua permitido até 2 MB.
- Uma imagem por publicação, com texto obrigatório. Não há upload de vídeo nem álbum nesta entrega.
- Selecionar não envia o arquivo ao servidor. O envio ocorre ao publicar/salvar (avatar/logo são salvos pelo seletor existente).

## Limites

Foto original JPG/PNG/WebP: até 10 MiB. Reencode no dispositivo, até 1.600 pixels no maior lado (512 para avatar/logo), procurando um resultado de até 512 KiB e recusando resultados acima de 1 MiB. A prévia mostra o tamanho final. HEIC deve ser exportado como JPG. Reencode remove metadados embutidos e evita contratar transformações de imagem no Supabase.

`community-images` tem limite de 1 MiB por arquivo aplicado pelo Storage e aceita somente JPEG/PNG/WebP. Objetos têm nomes aleatórios e não são sobrescritos. Upload exige uma conta ativa e a pasta do próprio usuário. Leitura é pública, como as publicações. Outros usuários não podem enviar, modificar ou excluir a foto do autor.

Os buckets antigos mantêm seus limites no servidor: avatars 2 MiB, company-logos 2 MiB, promotions 3 MiB; o fluxo novo de fotos raster envia no máximo 1 MiB. A capa usa company-logos, com a mesma verificação de propriedade da empresa. As ofertas usam promotions, com as permissões existentes de patrocinador.

O limite existente de dez publicações por hora continua vigente. Ele não é uma cota de Storage: não foi criado um limite total de arquivos por conta nem por organização. Um cliente modificado pode tentar fazer mais uploads dentro das permissões do Storage; acompanhe uso e adicione cotas no servidor antes de escalar acesso público.

## Consumo e custos

Referências verificadas em 06/10/2026:

- [Preço do Storage](https://supabase.com/docs/guides/storage/pricing): Free inclui 1 GB, compartilhado por todos os arquivos; Pro inclui 100 GB e o armazenamento excedente custa US$ 0,0213/GB/mês, além da assinatura e demais itens do plano.
- [Tráfego](https://supabase.com/docs/guides/storage/serving/bandwidth): Free inclui 5 GB com cache e 5 GB sem cache; as cotas são separadas e incluem dados de outros serviços do Supabase.

Exemplo aproximado: 2.000 imagens de 500 KB ocupam 1 GB, antes de considerar avatares, logos e currículos. Dez mil downloads de 500 KB transferem aproximadamente 5 GB. Fotos menores, cache do navegador e carregamento sob demanda reduzem consumo. URLs externas não ocupam Storage do projeto, mas dependem da disponibilidade e das regras do site externo; não são comprimidas por este fluxo.

Não foi consultado o consumo real nem alterado o plano de cobrança. Verificar Storage e Usage no painel para saber quanto resta.

Fotos substituídas, uploads cujo salvamento falhou e fotos de posts retirados não são apagados automaticamente nesta entrega. Uma tentativa de salvar novamente com o mesmo arquivo na mesma tela reutiliza o upload, evitando duplicação. Definir retenção e limpeza administrativa de arquivos sem uso antes de aumentar o volume; apagar o arquivo pelo Storage pode quebrar links compartilhados em outros posts. Imagens públicas podem continuar acessíveis pelo endereço direto depois de retirar a publicação.

## Ativação e verificação

1. Aplicar `supabase/migrations/012_community_images.sql` no SQL Editor do projeto correto, depois de 011. A migration é reaplicável.
2. Publicar o frontend atualizado.
3. Testar em desktop, Android e iPhone: galeria, prévia, cancelar, remover, link, postar/editar, ofertas, capa, avatar e logo. Conferir imagem orientada corretamente, transparência de logo e mensagens para arquivo inválido/grande.
4. Conferir o arquivo no Storage e a foto no feed após atualizar a página. Testar tentativa de salvar novamente após uma falha de conexão.

Build, testes de autorização e testes das migrations/permissões passaram localmente. O teste SQL usa PGlite; confirma configuração do bucket e RLS, não executa o serviço HTTP de Storage nem o encoder do navegador. A automação do navegador expirou nesta sessão, portanto a migration não foi aplicada em produção e os testes visuais/compressão real ainda estão pendentes.
