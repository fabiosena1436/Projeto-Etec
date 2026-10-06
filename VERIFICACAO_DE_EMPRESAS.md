# Verificação de empresas

Implementado no código; ativação em produção depende da publicação do frontend e da aplicação de `supabase/migrations/014_company_verification.sql`, depois das migrações anteriores. Nenhuma migração remota foi executada nesta alteração.

O cadastro de empresa exige CNPJ e nome do responsável. O navegador e o banco validam formato e dígitos verificadores; há suporte aos CNPJs numéricos e alfanuméricos. O banco mantém a unicidade do CNPJ e uma tentativa duplicada não cria uma conta órfã. Validar os dígitos não comprova existência, situação ativa ou autorização do solicitante.

## Aprovação administrativa

1. No painel administrativo, abra **Analisar empresa**. Empresas pendentes aparecem primeiro.
2. Consulte o CNPJ no serviço oficial da Receita Federal, pelo link do formulário. Compare razão social, endereço e situação cadastral ATIVA.
3. Confirme a autorização do responsável por um canal da empresa obtido de fonte independente. Não use apenas telefone/e-mail fornecidos pelo solicitante como prova. Não solicite senhas.
4. Registre razão social, data/fonte da consulta e como confirmou o vínculo, marque a confirmação e aprove. Não registre documentos pessoais completos nas observações.
5. Se a verificação falhar, deixe o cadastro pendente. Uma aprovação pode ser suspensa no painel; isso revoga a liberação da empresa. Não existe rejeição automática nem garantia absoluta contra fraude.

A consulta cadastral e a confirmação do representante são manuais nesta implementação. Não foi contratada API paga nem implementada consulta automática à Receita. O administrador precisa efetivamente realizar a análise, e deve rever a aprovação quando receber denúncias ou identificar mudança cadastral. Não há monitoramento automático da situação na Receita.

## Controles no banco

- Empresas sem aprovação não aparecem nas listagens públicas, na busca de vagas, nas divulgações de patrocinadores ou nas publicações empresariais do feed.
- RLS e RPCs bloqueiam publicação/alteração de vagas, participação empresarial na comunidade e acesso a candidaturas, dados de candidatos e novas leituras de currículos antes da aprovação. Chamadas diretas à API também estão sujeitas a esses controles.
- O candidato conserva o histórico das vagas às quais se candidatou. O proprietário conserva acesso aos dados da própria empresa para corrigir o cadastro.
- As análises e observações ficam na tabela privada `company_verifications` e no histórico administrativo. Clientes não podem escrever nem consultar diretamente essa tabela. Somente o RPC administrativo aprova; o antigo botão de verificação simples não libera empresas.
- Mudar o CNPJ remove a aprovação e exige nova análise. O RPC confere o CNPJ atual sob bloqueio da linha, evitando aprovar um documento que mudou durante a análise.
- Empresas anteriormente verificadas sem registro de análise ficam pendentes ao aplicar a migração. Cadastros antigos sem CNPJ podem preenchê-lo no painel. Dados legados inválidos não são apagados; precisam ser corrigidos antes de atualizar a empresa.
- Suspender uma empresa impede novas consultas e novos downloads. Arquivos já baixados ou URLs assinadas emitidas anteriormente não podem ser recolhidos por esse controle; URLs existentes permanecem válidas até sua expiração.

## Validação

`npm run test:auth` verifica CNPJ numérico/alfanumérico, formatação, caracteres inválidos e dígitos errados. `npm run test:database` aplica e reaplica as migrações, testa cadastro duplicado/ inválido, bloqueios de acesso direto e RPC, análise administrativa, privacidade dos registros, suspensão e mudança de CNPJ. `npm run build` valida TypeScript e a compilação. A interface e o banco de produção não foram testados nesta alteração.

Referência do cálculo: [manual oficial da Receita Federal](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf).
