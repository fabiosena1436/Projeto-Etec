import type { Company } from '../types/database';
import type { CommunityPost } from '../services/supabase/community.service';

// Exemplos públicos para apresentação. Não são contas, aprovações ou contratos.
export const PRESENTATION_DEMOS_ENABLED = import.meta.env?.VITE_PRESENTATION_DEMOS !== 'false';
const timestamp = Date.now();
const examples = [
  { key:'padaria', name:'Padaria Pão da Praça', industry:'Alimentação', slogan:'Um bom dia começa com carinho.', sponsor:true,
    about:'Uma padaria fictícia para mostrar como um comércio de bairro pode compartilhar novidades e divulgar ofertas no Conecta Jovens.',
    post:'O cheiro de pão saindo do forno, uma mesa arrumada e um atendimento acolhedor: assim imaginamos a nossa padaria de bairro. Nesta publicação de demonstração, apresentamos uma fornada especial e mostramos como um pequeno negócio pode conversar com a comunidade.\n\nO Conecta Jovens também pode ser um espaço para contar a história de quem empreende, valorizar a equipe e apresentar os bastidores do trabalho. Clique em Ver mais para conhecer o texto completo e veja a imagem ilustrativa abaixo.\n\nEste estabelecimento e os produtos apresentados são fictícios. Não há venda, reserva ou oferta real.',
    update:'Por trás de uma boa fornada existe trabalho em equipe! Neste exemplo, nossa equipe fictícia compartilha uma conquista: concluir uma oficina de atendimento ao cliente. Publicação de demonstração para a apresentação do projeto.',
    offers:[{title:'Combo café da manhã',description:'Café e pão artesanal em uma oferta ilustrativa. Exemplo de divulgação; não disponível para compra.',price:18,discount:14.9},{title:'Cesta de pães artesanais',description:'Uma vitrine de produtos para mostrar a participação de um parceiro. Oferta fictícia de demonstração.',price:32,discount:26}] },
  { key:'restaurante', name:'Restaurante Sabor do Bairro', industry:'Alimentação', slogan:'Sabores que aproximam pessoas.', sponsor:true,
    about:'Restaurante fictício de comida caseira, usado para apresentar publicações com imagem, ofertas e a vitrine de parceiros.',
    post:'Uma pausa para o almoço pode ser também um momento de encontro. Nossa cozinha fictícia preparou um prato colorido para ilustrar como um restaurante pode apresentar novidades no feed.\n\nNesta demonstração, você pode abrir o perfil da empresa, conhecer as ofertas de exemplo e ver outras publicações. A imagem é uma fotografia ilustrativa e o cardápio não corresponde a um restaurante real.',
    update:'Ideia para a comunidade: compartilhar dicas de organização e redução do desperdício na cozinha. Esta notícia é um exemplo de conteúdo que uma empresa pode publicar para conversar com as pessoas, além de divulgar produtos. Demonstração do Conecta Jovens.',
    offers:[{title:'Almoço da casa',description:'Prato ilustrativo de comida caseira para demonstrar uma promoção. Nenhuma refeição está sendo comercializada.',price:29.9,discount:24.9},{title:'Menu para duas pessoas',description:'Exemplo de oferta com preço original e promocional. Conteúdo fictício para apresentação.',price:69.9,discount:59.9}] },
  { key:'escola', name:'Escola Trilhas do Futuro', industry:'Educação', slogan:'Aprender abre novos caminhos.', sponsor:true,
    about:'Escola fictícia de cursos livres para apresentar o papel de empresas e instituições que apoiam a formação de jovens.',
    post:'Currículo, entrevista e primeiro emprego: aprender em grupo pode tornar esse começo mais leve. Nesta publicação de demonstração, nossa escola fictícia apresenta uma oficina de preparação para oportunidades profissionais.\n\nA proposta mostra como uma instituição pode compartilhar informações úteis e se conectar com a comunidade. A oficina, as inscrições e a escola são exemplos ilustrativos; não há turma real aberta.',
    update:'Uma conquista de exemplo: nossos alunos fictícios finalizaram seu primeiro projeto em equipe. O feed permite que empresas compartilhem histórias e novidades do dia a dia. Conteúdo de demonstração, sem inscrições reais.',
    offers:[{title:'Oficina de currículo',description:'Exemplo de oficina gratuita para ilustrar uma parceria educacional. Evento fictício, sem inscrição disponível.',price:0,discount:undefined},{title:'Introdução à informática',description:'Exemplo de divulgação de curso e condição promocional. Não existe matrícula ou cobrança nesta demonstração.',price:120,discount:89.9}] },
  { key:'atelie', name:'Ateliê Flor de Algodão', industry:'Varejo', slogan:'Criatividade em cada detalhe.', sponsor:false,
    about:'Ateliê fictício de moda e acessórios para demonstrar um perfil empresarial e publicações gratuitas na comunidade.',
    post:'Um rascunho, uma escolha de cores e muitas ideias: os bastidores também merecem espaço na comunidade. Nossa nova coleção fictícia ilustra como um ateliê pode compartilhar seu processo criativo no Conecta Jovens.\n\nEsta imagem e esta empresa fazem parte da demonstração do projeto. Nenhum produto está à venda.',
    update:'Hoje o nosso exemplo de equipe reuniu referências para um projeto criativo. Compartilhar processos e aprendizados é uma forma de aproximar quem empreende de quem acompanha o negócio. Publicação fictícia para apresentação.',
    offers:[] },
  { key:'oficina', name:'Oficina Pedal Livre', industry:'Serviços', slogan:'Mais movimento para o seu dia.', sponsor:false,
    about:'Oficina fictícia de bicicletas para mostrar como prestadores de serviços podem participar da rede e compartilhar conhecimentos.',
    post:'Bicicleta revisada e um passeio tranquilo: nesta fotografia ilustrativa, mostramos uma oficina de bairro compartilhando uma novidade com a comunidade.\n\nO perfil, a equipe e o serviço são fictícios e servem para apresentar os recursos do Conecta Jovens. Não há agendamento ou atendimento real neste exemplo.',
    update:'Notícia de demonstração: um encontro fictício de pessoas interessadas em mobilidade e passeios pela cidade. Empresas também podem compartilhar ideias e valorizar iniciativas da comunidade. Este encontro não é um evento real.',
    offers:[] },
];

export const presentationCompanies: Company[] = PRESENTATION_DEMOS_ENABLED ? examples.map((example,index)=>{
  const id = `de00000${index+1}-0000-4000-8000-000000000001`;
  const created = new Date(timestamp-(index+1)*3600000).toISOString();
  return {id,owner_profile_id:'presentation-only',slug:`demo-${example.key}`,name:`${example.name} — Demonstração`,industry:example.industry,
    description:`DEMONSTRAÇÃO: ${example.about} Não representa uma empresa real.`,location:'Localização ilustrativa · Teodoro Sampaio, SP',city:'Teodoro Sampaio',state:'SP',
    contact_email:'',phone:null,website:null,logo_url:`/demos/${example.key}-logo.svg`,banner_url:`/demos/${example.key}.jpg`,slogan:example.slogan,
    cnpj:null,is_sponsor:example.sponsor,is_verified:false,is_demo:true,sponsor_expires_at:null,views_count:0,rating:0,created_at:created,updated_at:created,
    promotions:example.offers.map((offer,offerIndex)=>({id:`demo-offer-${example.key}-${offerIndex+1}`,company_id:id,title:offer.title,description:`Demonstração: ${offer.description}`,
      image_url:`/demos/${example.key}.jpg`,price:offer.price,discount_price:offer.discount??null,valid_until:null,is_active:true,views_count:0,created_at:created,updated_at:created}))};
}) : [];

export const presentationPosts: CommunityPost[] = presentationCompanies.flatMap((company,index)=>[examples[index].post,examples[index].update].map((body,postIndex)=>{
  const created = new Date(timestamp-(index*2+postIndex+1)*3600000).toISOString();
  return {id:`de00000${index+1}-0000-4000-8000-00000000000${postIndex+2}`,company_id:company.id,author_id:'presentation-only',author_kind:'company' as const,company_name:company.name,
    logo_url:company.logo_url,verified:false,sponsor:company.is_sponsor,is_demo:true,body:`Demonstração · ${body}`,image_url:postIndex===0?company.banner_url:null,
    created_at:created,updated_at:created,can_edit:false,likes:0,liked:false,following:false,comment_count:0,comments:[]};
}));

export const getPresentationCompany = (id:string) => presentationCompanies.find(company=>company.id===id || company.slug===id);
export const isPresentationEntity = (id:string) => Boolean(getPresentationCompany(id) || presentationPosts.some(post=>post.id===id));
export function mergePresentationFeed(real:CommunityPost[],companyId?:string,following=false,cursor?:CommunityPost,includeDemos=true) {
  const before = (post:CommunityPost) => !cursor || Date.parse(post.created_at)<Date.parse(cursor.created_at) || (Date.parse(post.created_at)===Date.parse(cursor.created_at) && post.id<cursor.id);
  const demos = following||!includeDemos?[]:presentationPosts.filter(post=>(!companyId || post.company_id===getPresentationCompany(companyId)?.id || post.company_id===companyId) && before(post));
  return [...real.filter(before),...demos].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at) || b.id.localeCompare(a.id)).slice(0,20);
}
