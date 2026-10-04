import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { organization, supportEmail } from '../../components/Footer';
import * as S from './styles';
export function Help() {
  const { hash } = useLocation();
  useEffect(() => { if(hash) document.getElementById(hash.slice(1))?.scrollIntoView(); }, [hash]);
  return <S.Container><S.Heading><span>UM LUGAR PARA TODA A CIDADE</span><h1>Como podemos ajudar?</h1><p>Encontre oportunidades e conheça os próximos passos com tranquilidade.</p></S.Heading>
    <S.Cards><S.Card><span>PARA CANDIDATOS</span><h2>Seu talento tem lugar aqui.</h2><p>Consulte as vagas sem cadastro. Para se candidatar, crie uma conta, complete seu perfil e envie seu currículo. Acompanhe o andamento pelo painel.</p><Link to="/vagas">Encontrar oportunidades <ArrowRight size={17} /></Link></S.Card><S.Card><span>PARA EMPRESAS</span><h2>Encontre pessoas perto de você.</h2><p>Crie uma conta de empresa, informe os dados do seu negócio e publique uma vaga. No painel, você acompanha os candidatos e atualiza as etapas do processo.</p><Link to="/cadastro?type=empresa">Cadastrar minha empresa <ArrowRight size={17} /></Link></S.Card></S.Cards>
    <S.Block><h2>Dúvidas frequentes</h2>
      <details><summary>Preciso me cadastrar para ver as vagas?</summary><p>Não. Você pode pesquisar e abrir os detalhes das vagas livremente. Para enviar uma candidatura ou salvar uma vaga, entre na sua conta de candidato.</p></details>
      <details><summary>Quem pode usar a plataforma?</summary><p>Pessoas que procuram trabalho e empresas que oferecem oportunidades em Teodoro Sampaio. Há espaço para quem está começando e para quem já tem experiência.</p></details>
      <details><summary>Como envio meu currículo?</summary><p>Entre na sua conta, abra seu perfil pelo painel e use a opção de enviar currículo. O formulário informa os formatos e o tamanho aceitos. Depois, confira se o arquivo foi salvo antes de se candidatar.</p></details>
      <details><summary>Como acompanho minhas candidaturas?</summary><p>Abra seu painel de candidato. Ali você encontra as vagas às quais se candidatou e as atualizações de status feitas pelas empresas. A candidatura não garante contratação.</p></details>
      <details><summary>Posso retirar uma candidatura?</summary><p>Sim. Use a opção de desistir no seu painel. Isso encerra sua participação naquela vaga e bloqueia novas consultas da empresa ao currículo quando não houver outra candidatura sua para ela.</p></details>
      <details><summary>Esqueci minha senha. O que faço?</summary><p>Na tela de login, escolha “Esqueci minha senha” e informe o e-mail cadastrado. A entrega do link depende do serviço de e-mail da plataforma. Se ele não chegar, confira o spam e utilize o canal de suporte abaixo.</p></details>
    </S.Block>
    <S.Block id="seguranca"><ShieldCheck size={28} color="#0c6d5d" /><h2>Oportunidades com mais cuidado</h2><p>Desconfie de pedidos de pagamento para participar de seleções. Não compartilhe senhas, códigos de acesso ou dados bancários. Confira o nome da empresa e os detalhes da oportunidade antes de enviar documentos.</p><h3>Suporte e relatos de problemas</h3><p>Responsável identificado na plataforma: {organization}.</p>
      {supportEmail ? <p>Para relatar uma vaga suspeita, pedir ajuda ou tratar de seus dados, escreva para <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. Inclua o endereço da página e uma descrição do problema; não envie senhas.</p> : <p>O canal privado de atendimento ainda não foi informado pela equipe responsável. Para problemas técnicos, você pode abrir um relato no repositório do projeto. Relatos são públicos: não inclua currículo, telefone, senha ou outros dados pessoais.</p>}
      {!supportEmail && <a href="https://github.com/fabiosena1436/Projeto-Etec/issues/new" target="_blank" rel="noopener noreferrer">Relatar um problema técnico ↗</a>}
      <p><Link to="/privacidade">Saiba como seus dados são utilizados →</Link></p>
    </S.Block>
  </S.Container>;
}
