# Empresas de demonstração

Cinco perfis fictícios foram adicionados para apresentar o Conecta Jovens: Padaria Pão da Praça, Restaurante Sabor do Bairro, Escola Trilhas do Futuro, Ateliê Flor de Algodão e Oficina Pedal Livre. Cada perfil tem duas publicações; a primeira inclui uma ilustração própria. Padaria, restaurante e escola também mostram duas ofertas ilustrativas cada.

Os exemplos aparecem na listagem de empresas, nos próprios perfis e no feed geral. Os exemplos de parceria completam somente os espaços disponíveis da divulgação: continuam os limites de três cards na página inicial e um na comunidade. As empresas reais têm prioridade nesses espaços.

Todos os perfis, publicações e ofertas trazem identificação de demonstração. Não possuem conta de acesso, CNPJ, selo de empresa verificada, telefone, e-mail comercial, vagas ou cobrança. Os exemplos não recebem curtidas, comentários, denúncias nem seguidores; as interações continuam disponíveis nas publicações reais. Não são enviados eventos de patrocínio referentes aos exemplos. Não há contadores inventados.

Os dados ficam em `src/data/presentationDemo.ts` e as ilustrações em `public/demos/`. São exemplos do frontend, separados dos registros reais do Supabase. Não houve inserção de empresas no banco. Para aparecerem no site publicado, é necessário publicar esta versão do frontend; não há migração de banco nesta alteração.

Para remover os exemplos depois da apresentação, configure `VITE_PRESENTATION_DEMOS=false` no ambiente de compilação e publique novamente. Essa opção esconde os cinco perfis, as dez publicações e as ofertas de exemplo em conjunto.

Sugestão de apresentação: abra **Empresas**, pesquise por “Demonstração”, entre na padaria, mostre as publicações com **Ver mais**, as ofertas e depois volte à **Comunidade** para apresentar o feed. Use uma conta real para demonstrar a criação de publicações e as interações.

Validação: `npm run test:presentation` verifica integridade dos exemplos, arquivos das imagens, filtros e paginação conjunta com publicações reais. `npm run build` valida TypeScript e compilação. A interface publicada não foi alterada nesta etapa.
