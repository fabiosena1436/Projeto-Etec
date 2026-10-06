# Empresas de demonstração

Cinco perfis fictícios foram adicionados para apresentar o Conecta Jovens: Padaria Pão da Praça, Restaurante Sabor do Bairro, Escola Trilhas do Futuro, Ateliê Flor de Algodão e Oficina Pedal Livre. Cada perfil tem duas publicações; a primeira inclui uma fotografia de banco de imagens. Padaria, restaurante e escola também mostram duas ofertas ilustrativas cada.

Os exemplos aparecem na listagem de empresas, nos próprios perfis e no feed geral. Os exemplos de parceria completam somente os espaços disponíveis da divulgação: continuam os limites de três cards na página inicial e um na comunidade. As empresas reais têm prioridade nesses espaços.

Todos os perfis, publicações e ofertas trazem identificação de demonstração. Não possuem conta de acesso, CNPJ, selo de empresa verificada, telefone, e-mail comercial, vagas ou cobrança. Os exemplos não recebem curtidas, comentários, denúncias nem seguidores; as interações continuam disponíveis nas publicações reais. Não são enviados eventos de patrocínio referentes aos exemplos. Não há contadores inventados.

Os dados ficam em `src/data/presentationDemo.ts` e as fotos em `public/demos/`. São exemplos do frontend, separados dos registros reais do Supabase. Não houve inserção de empresas no banco. Para aparecerem no site publicado, é necessário publicar esta versão do frontend. As fontes e os créditos das fotografias estão em `public/demos/PHOTO_CREDITS.md`.

## Como remover os exemplos

No painel de superadministrador, abra **Empresas e patrocínios → Exemplos para apresentação → Remover exemplos do site**. Isso oculta globalmente os cinco perfis, as dez publicações e as seis ofertas. O mesmo controle permite reativá-los. Atualize as páginas já abertas para ver a alteração; o cache da configuração dura até 30 segundos. Esse controle afeta somente os cinco exemplos adicionados nesta etapa, preservando cadastros e publicações reais e eventuais exemplos antigos que já existiam no banco.

Para ativar o botão, aplique `supabase/migrations/015_presentation_visibility.sql`, depois das migrações anteriores, e publique o frontend. A migração guarda somente uma configuração global, protegida por RLS; a alteração exige um superadministrador confirmado pelo banco e fica no histórico administrativo. Não foi aplicada ao banco remoto nesta etapa. Reaplicar a migração preserva a escolha de ocultar os exemplos.

Também é possível desativá-los sem usar o botão: configure `VITE_PRESENTATION_DEMOS=false` no ambiente de compilação e publique novamente. Essa opção tem prioridade sobre a configuração do painel. Para reativar nessa situação, publique uma versão com a variável habilitada.

## Fotografias

Os exemplos usam fotos reais de banco de imagens, identificadas como ilustrativas. Para trocar uma dessas fotos, substitua o respectivo arquivo JPEG em `public/demos/` e publique novamente. Para uma publicação real da sua conta, use **Criar publicação → Escolher da galeria**; também permanece disponível a opção de link. Publicações reais próprias podem ser retiradas pelo botão **Retirar publicação**.

Sugestão de apresentação: abra **Empresas**, pesquise por “Demonstração”, entre na padaria, mostre as publicações com **Ver mais**, as ofertas e depois volte à **Comunidade** para apresentar o feed. Use uma conta real para demonstrar a criação de publicações e as interações.

Validação: `npm run test:presentation` verifica integridade dos exemplos, arquivos das imagens, filtros e paginação conjunta com publicações reais. `npm run test:database` verifica as permissões e a persistência do controle global. `npm run build` valida TypeScript e compilação. A interface publicada não foi alterada nesta etapa.
