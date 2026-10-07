# Conecta Jovens — roteiro para apresentar ao grupo

Este roteiro descreve as funcionalidades presentes no código do projeto. A versão publicada precisa estar atualizada e com as configurações do Supabase aplicadas para demonstrar todos os recursos. A disponibilidade atual de cada função no site publicado não foi conferida nesta preparação.

## 1. Como começar a apresentação

Você pode falar:

> “O Conecta Jovens é uma plataforma que aproxima pessoas e empresas da nossa região. A pessoa pode encontrar oportunidades, montar seu perfil profissional e acompanhar suas candidaturas. Além disso, existe uma comunidade para compartilhar notícias, conquistas e assuntos do dia a dia. As empresas podem divulgar vagas e, quando são patrocinadoras, apresentar ofertas em espaços limitados do site. Cada tipo de conta tem seu próprio painel e suas permissões.”

A proposta combina uma plataforma de empregos com uma comunidade social. A inspiração em redes como o LinkedIn está nos perfis e nas publicações; o projeto tem foco local e suas próprias funcionalidades.

## 2. O que cada pessoa pode fazer

| Acesso | Funcionalidades |
| --- | --- |
| Visitante, sem cadastro | Consultar vagas e seus detalhes, conhecer empresas, ler publicações da comunidade e visualizar divulgações de patrocinadores. |
| Usuário/candidato | Completar o perfil, enviar currículo e foto, salvar vagas, candidatar-se, acompanhar a seleção, desistir de uma candidatura e participar da comunidade. |
| Empresa aprovada | Manter seu perfil, publicar e administrar vagas, analisar candidatos das próprias vagas e publicar na comunidade como empresa. |
| Empresa patrocinadora | Usar os recursos de empresa e divulgar ofertas, capa institucional e participação nos espaços de patrocínio, com relatório de divulgação. |
| Administrador | Analisar empresas, administrar patrocínios, tratar denúncias, moderar publicações e controlar os exemplos de apresentação. |

O candidato não recebe a opção comercial de se tornar patrocinador. A página de parcerias é destinada às contas de empresa. O acesso administrativo depende de uma autorização registrada no banco.

## 3. Perfil e oportunidades de emprego

O candidato pode informar nome, profissão ou cargo desejado, cidade, idade, disponibilidade, formação, apresentação pessoal e telefone. Também pode adicionar habilidades e experiências profissionais, enviar uma foto e anexar currículo em PDF ou Word, até 5 MB. O painel indica o preenchimento do perfil.

Na área de vagas, a pessoa pesquisa oportunidades e filtra por categoria. Ao abrir uma vaga, consulta os detalhes e pode salvá-la para depois ou enviar sua candidatura, com uma apresentação opcional.

Depois do envio, acompanha o andamento pelo painel: enviada, visualizada, em análise, pré-selecionada, aprovada ou não selecionada. Também pode desistir. A contratação e o contato final continuam sendo decisões da empresa.

O telefone e o currículo são restritos: a empresa aprovada acessa os candidatos que se inscreveram nas vagas dela. Não há acesso livre a todos os currículos da plataforma. A desistência revoga o acesso da empresa àquela candidatura quando não existe outra candidatura que autorize esse acesso.

## 4. Comunidade e publicações

A comunidade permite compartilhar notícias, conquistas, experiências, novidades e assuntos do dia a dia.

- O início da criação mostra “O que você quer compartilhar?”, “Publicar como” e o botão para criar a publicação.
- O botão abre uma janela com o texto e a foto opcional.
- A foto pode ser escolhida na galeria do celular ou nos arquivos do computador. Também existe a opção de link.
- O texto aceita até 2.000 caracteres. Textos maiores aparecem resumidos e podem ser abertos com “Ver mais”.
- Publicações reais permitem curtidas, comentários e acompanhamento de pessoas e empresas.
- O feed oferece a visualização geral e a de contas seguidas.
- O autor pode editar ou retirar sua própria publicação.
- Uma publicação pode ser denunciada para análise administrativa.
- Há notificações para eventos como comentários e mudanças na candidatura.

Os uploads de publicações aceitam JPG, PNG e WebP, até 10 MB antes do processamento. O sistema reduz a foto antes de enviá-la, ajudando a economizar armazenamento e tráfego. As imagens de publicações são públicas; o currículo usa armazenamento privado.

Não existe conversa privada por chat dentro do site nesta versão.

## 5. Cadastro e painel da empresa

A empresa informa seu CNPJ e os dados do responsável. O sistema valida o formato e os dígitos verificadores do CNPJ e impede cadastros duplicados. Depois, o administrador consulta a situação cadastral e verifica a representação da empresa antes de aprová-la.

O painel administrativo possui um atalho para a consulta oficial e uma opção de copiar o CNPJ. A aprovação é manual: um número matematicamente válido, sozinho, não comprova a identidade de quem está se cadastrando.

Após aprovação, a empresa pode:

- Atualizar nome, descrição, setor, endereço, contatos, site, slogan e logo.
- Criar uma vaga em rascunho, publicá-la, editar, encerrar ou reabrir.
- Consultar candidaturas por vaga e no painel geral.
- Acessar o perfil e o currículo dos candidatos autorizados.
- Alterar a etapa da seleção e usar o contato por WhatsApp quando o candidato disponibiliza telefone.
- Acompanhar indicadores das vagas e candidaturas.
- Publicar novidades na comunidade com a identidade da empresa.

Empresas ainda não aprovadas têm restrições para publicar e acessar candidatos. Alterar o CNPJ exige uma nova análise.

## 6. Como funciona o patrocínio

O modelo mantém a busca de oportunidades gratuita para as pessoas e permite que empresas publiquem vagas sem contratar patrocínio. O patrocínio oferece divulgação adicional para sustentar a plataforma.

A empresa interessada acessa a área de parcerias e combina valor e período com o responsável pelo projeto. Após a confirmação do pagamento, o administrador registra e ativa o patrocínio.

Uma patrocinadora pode cadastrar até seis ofertas, com imagem, descrição, preço, preço promocional e validade. Também conta com capa institucional, identificação de patrocinadora e divulgação em espaços compartilhados.

Para preservar a navegação, a página inicial mostra até três cards e a comunidade até um por visita. As empresas participantes alternam nesses espaços. A divulgação também aparece no perfil da empresa.

O painel da patrocinadora oferece um relatório dos últimos 30 dias com exibições e eventos de clique, incluindo acessos e ações de contato. Esses indicadores medem divulgação; não comprovam vendas nem representam necessariamente pessoas únicas.

O administrador pode ativar, pausar ou cancelar a parceria. O vencimento limita sua divulgação, e a renovação é manual. Não existe cobrança automática, checkout ou processamento de pagamento dentro do site nesta versão.

## 7. Administração, segurança e acesso

O administrador pode analisar empresas e registrar os dados da verificação, administrar o status e o período dos patrocínios, analisar denúncias e ocultar ou restaurar publicações conforme a moderação. As ações administrativas relevantes ficam registradas em histórico.

As contas têm cadastro, login, recuperação e alteração de senha. A nova senha exige pelo menos oito caracteres, com maiúscula, minúscula, número e símbolo. A alteração dentro da conta pede a senha atual e a confirmação da nova senha.

A recuperação por e-mail depende da configuração do serviço de envio e deve ser testada antes da demonstração. As restrições de acesso também são aplicadas no banco, além dos menus da interface. Esses controles reduzem riscos; não representam garantia de ausência de fraude.

A interface possui adaptações para computador, tablet e celular. Vale mostrar o mesmo fluxo em uma tela grande e em um celular para o grupo perceber a mudança de organização.

## 8. Sequência de demonstração — aproximadamente 15 minutos

| Tempo | Tela e ação | O que explicar |
| --- | --- | --- |
| 1 minuto | Página inicial | Objetivo do projeto, acesso gratuito e integração entre pessoas e empresas. |
| 2 minutos | Vagas → uma vaga | Pesquisa, categoria, detalhes, salvar e candidatar-se. |
| 2 minutos | Painel do candidato | Perfil, habilidades, experiências, currículo e acompanhamento das candidaturas. |
| 3 minutos | Comunidade | Ler uma publicação com foto, abrir “Ver mais”, criar uma publicação e mostrar interações em conteúdo real. |
| 2 minutos | Empresas → perfil de demonstração | Perfil comercial, publicações e ofertas ilustrativas. |
| 2 minutos | Painel de uma empresa aprovada | Administração de vagas e análise dos candidatos da própria empresa. |
| 2 minutos | Painel administrativo | Verificação do CNPJ, patrocínios, moderação e controle dos exemplos. |
| 1 minuto | Versão no celular | Navegação e organização responsiva. |

Use uma conta de candidato, uma empresa aprovada e uma conta administrativa em sessões separadas. Isso ajuda a mostrar as permissões sem precisar alternar logins durante toda a apresentação.

Para a comunidade, uma sugestão de texto é:

> “Hoje estamos apresentando o Conecta Jovens: um espaço para conectar pessoas, empresas e oportunidades da nossa região. Este é um teste de publicação para demonstrar a plataforma ao nosso grupo.”

Use uma foto sua ou que você tenha autorização para publicar. Se fizer a demonstração no site público, identifique a publicação e a vaga de teste como exemplos e retire ou encerre esse conteúdo quando terminar.

## 9. Empresas prontas para ilustrar a apresentação

Há cinco perfis fictícios identificados como demonstração: Padaria Pão da Praça, Restaurante Sabor do Bairro, Escola Trilhas do Futuro, Ateliê Flor de Algodão e Oficina Pedal Livre.

Eles têm dez publicações no total, incluindo fotografias ilustrativas de banco de imagens. Os três primeiros também possuem duas ofertas cada. Servem para mostrar a aparência dos perfis, da comunidade e da divulgação.

Esses exemplos não têm login, CNPJ, vagas ou contratação real. As curtidas, os comentários e outras interações ficam desativados neles. Para demonstrar essas ações, use uma conta real de teste e uma publicação real.

O administrador pode ocultar os cinco exemplos em **Empresas e patrocínios → Exemplos para apresentação → Remover exemplos do site** e reativá-los depois. O controle exige a migração 015 e o frontend atualizado. Consulte [o guia dos exemplos](DEMONSTRACAO_DO_PROJETO.md) para detalhes.

## 10. Preparação antes de reunir o grupo

1. Conferir se o site publicado está com a versão atual do projeto.
2. Conferir as migrações e configurações necessárias no Supabase, especialmente as de imagens da comunidade, divulgação dos patrocinadores, verificação das empresas e controle dos exemplos. Não reaplicar configurações sem consultar os guias de instalação.
3. Entrar previamente nas contas de candidato, empresa aprovada e administrador.
4. Preparar uma vaga identificada como teste, um currículo fictício e uma imagem autorizada. Evitar expor documentos e contatos pessoais de terceiros.
5. Testar o percurso completo: candidatura → visualização pela empresa → mudança de status → atualização no painel do candidato.
6. Testar a publicação com foto e sua retirada. Conferir as interações em uma publicação real de teste.
7. Conferir o patrocínio com uma conta de teste devidamente configurada; os perfis fictícios demonstram a aparência, mas não o fluxo administrativo de uma conta real.
8. Se for apresentar recuperação de senha, conferir o envio e o recebimento do e-mail antes.
9. Abrir o site no computador e no celular e deixar as telas principais prontas.

Os registros anteriores incluem verificações locais e alguns testes na versão publicada, mas não comprovam que todas as funções mais recentes já estejam ativas nela. Os detalhes de verificação estão em [TESTES_DOS_PAINEIS.md](TESTES_DOS_PAINEIS.md). Configuração e implantação estão em [BACKEND_SETUP.md](BACKEND_SETUP.md) e [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md).

## 11. Respostas curtas para perguntas do grupo

**É só um site de empregos?** Não. Também tem uma comunidade para publicações e perfis de empresas com divulgação comercial.

**Precisa pagar para procurar emprego?** Não. O modelo previsto mantém o acesso às oportunidades gratuito e oferece patrocínio opcional às empresas.

**Qualquer empresa pode ver meu currículo?** Não. O acesso está ligado às candidaturas enviadas às vagas da empresa aprovada.

**Como evitamos empresas falsas?** Com validação e unicidade do CNPJ, consulta cadastral oficial e verificação manual do responsável antes da aprovação.

**Posso usar uma foto do celular?** Sim. A publicação permite escolher da galeria; o link continua como alternativa.

**O site contrata ou vende produtos?** A plataforma aproxima as partes. A empresa conduz a contratação e a negociação das suas ofertas.

**O patrocínio polui a página?** Os espaços têm limite e rodízio. A proposta é dar visibilidade preservando o uso da plataforma.

**Tem custos para manter?** Há hospedagem, banco, armazenamento, tráfego e envio de e-mails. O custo depende dos planos contratados e do uso; não há valor mensal fechado nesta apresentação. As fotos são reduzidas antes do envio para economizar recursos.

**O que ainda pode evoluir?** Conversas privadas, pagamentos integrados e outros recursos podem ser discutidos como próximos passos. Eles não fazem parte das funcionalidades atuais.

## 12. Como encerrar

> “O projeto permite acompanhar o percurso de uma oportunidade: a empresa publica, a pessoa encontra a vaga e se candidata, a empresa analisa e o candidato acompanha o resultado. A comunidade mantém a participação das pessoas além da procura de emprego, e o patrocínio oferece uma possibilidade de sustentabilidade. Agora podemos avaliar juntos a experiência, testar os fluxos e definir as próximas prioridades.”
