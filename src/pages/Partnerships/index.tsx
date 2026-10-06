import { Link } from 'react-router-dom';
import { commercialLink } from '../../config/business';
import * as S from '../Help/styles';
export function Partnerships() {
  return <S.Container>
    <S.Heading><span>PARCERIAS LOCAIS</span><h1>Sua empresa mais perto da cidade.</h1><p>Apoie o Conecta Jovens e ganhe um espaço para apresentar seu negócio, suas oportunidades e suas ofertas.</p></S.Heading>
    <S.Cards>
      <S.Card><span>ACESSO GRATUITO</span><h2>Conecte-se aos talentos</h2><p>Cadastre sua empresa, publique vagas e acompanhe candidaturas. As pessoas continuam acessando oportunidades gratuitamente.</p><Link to="/cadastro?type=empresa">Cadastrar empresa →</Link></S.Card>
      <S.Card><span>EMPRESA PATROCINADORA</span><h2>Uma vitrine para seu negócio</h2><p>Ofertas na página inicial e na comunidade, em espaços compartilhados com rodízio entre parceiros. Identificação de patrocinadora, capa na vitrine, contato por WhatsApp e até seis ofertas com foto e validade. Acompanhe exibições e cliques no painel.</p><a href={commercialLink()} target="_blank" rel="noopener noreferrer">Falar com Fabio no WhatsApp →</a></S.Card>
    </S.Cards>
    <S.Block><h2>Liberação com acompanhamento</h2><p>Você conversa com Fabio V. Sena pelo WhatsApp <strong>(18) 98157-9318</strong>. O valor e o período são combinados diretamente. Depois da confirmação, a parceria é registrada e liberada pelo administrador.</p><p>A empresa atualiza suas informações e ofertas pelo próprio painel. O administrador pode pausar o destaque e acompanhar a validade. O patrocínio termina na data registrada e pode ser renovado.</p><p>Na página inicial aparecem até três parceiros; na comunidade, um destaque por visita. O rodízio compartilha esses espaços entre as empresas. O destaque divulga a empresa; o alcance depende do uso da plataforma. Não há promessa de vendas, contratações ou número de visitantes.</p><a href={commercialLink()} target="_blank" rel="noopener noreferrer">Conversar sobre uma parceria</a></S.Block>
  </S.Container>;
}
