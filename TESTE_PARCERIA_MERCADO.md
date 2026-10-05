# Teste de parceria — 05/10/2026

Empresa: Mercado Atacado Bom Preço (`e8a29535-f239-4864-bb9d-83c9dc14dbfa`). Testes realizados nas sessões reais da empresa e do administrador e numa página pública sem login.

## Resultado final

Parceria ativa como cortesia de teste de R$ 0,00, de 05/10/2026 a 30/11/2026. O registro anterior de R$ 100,00 foi substituído pela cortesia de simulação; o histórico preserva as alterações. Nenhuma cobrança, transferência ou pagamento foi realizado.

Vitrine pública com logo, capa, descrição e seis ofertas identificadas como fictícias, todas válidas até 30/11/2026. Os contatos já existentes da empresa foram mantidos.

## Conferências realizadas

| Cenário | Resultado observado |
| --- | --- |
| Ativar com recebimento pendente | Banco rejeitou |
| Ativar com início futuro | Banco rejeitou |
| Ativar com período vencido | Banco rejeitou |
| Pausar parceria | Capa e ofertas desapareceram para visitante |
| Cancelar parceria | Situação salva no administrador |
| Registrar pendência e atraso | Situação e recebimento persistidos |
| Restaurar cortesia ativa | Vitrine e ofertas recuperadas |
| Criar seis ofertas | Salvas e recuperadas após recarregar |
| Limite de seis | Novo cadastro bloqueado pelo painel; o limite do banco também passa na suíte local |
| Editar oferta e validade | Alterações persistiram |
| Oferta vencida | Oculta ao visitante e mantida no painel da empresa; restaurada depois |
| Preço promocional maior que o original | Formulário rejeitou |
| Logo por HTTPS, capa e imagens | Oito imagens públicas carregaram |
| Destaque na página inicial | Mercado exibido; link abriu a vitrine |
| Conta da empresa tentando acessar administração | Redirecionada ao painel de empresa |
| Consulta e busca de usuários | Busca por Mercado filtrou corretamente |
| Financeiro e histórico | Acordo de cortesia e alterações exibidos ao administrador |
| Página pública | Não exibiu notas administrativas nem valor mensal do acordo; console sem erros |

`npm run build` e `npm run test:database` passaram. Publicação final: `dpl_C9eGaLFNaXGCU2WRcthMXdeNTLHP`.

## Ajustes encontrados durante os testes

- Renovação da mesma sessão não desmonta mais formulários ao trocar de aba.
- Validade pública de oferta não perde um dia por conversão de fuso horário.
- Botões de editar/excluir ofertas têm rótulos acessíveis e ficam bloqueados durante gravação.
- Logo pode ser configurada por HTTPS; upload existente sincroniza o campo de endereço.

O envio de arquivo pela extensão do Chrome não foi concluído: depende de permitir acesso a URLs de arquivo. A logo desta vitrine foi salva e validada pelo campo HTTPS. Não foram realizados exclusões permanentes, cobrança real, envio de mensagem no WhatsApp ou mudanças nas candidaturas. Esta conferência cobre os cenários acima, não comprova todas as combinações possíveis do sistema.
