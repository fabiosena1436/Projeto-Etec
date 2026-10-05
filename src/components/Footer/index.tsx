import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { BrandMark } from '../BrandMark';
const Wrap = styled.footer`
  background:#102a43;color:#d1dce6;margin-top:auto;
  .inner{max-width:1200px;margin:auto;padding:40px 24px 20px;}
  .columns{display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px;}
  .brand{display:flex;align-items:center;gap:10px;font-weight:750;font-size:20px;color:white;}
  p{font-size:13px;line-height:1.8;max-width:310px;margin-top:14px;}
  h2{font-size:12px;font-weight:650;letter-spacing:.06em;color:#91e0c5;margin-bottom:12px;}
  nav{display:flex;flex-direction:column;align-items:start;gap:4px;}nav a{font-size:13px;min-height:36px;display:flex;gap:6px;align-items:center;}a:hover{text-decoration:underline;}
  .bottom{display:flex;justify-content:space-between;gap:20px;border-top:1px solid #ffffff20;margin-top:28px;padding-top:20px;font-size:11px;color:#c1d0df;}.bottom span{display:flex;gap:5px;align-items:center;}
  @media(max-width:600px){.inner{padding:30px 20px 20px;}.columns{grid-template-columns:1fr 1fr;gap:25px;}.columns>div:first-child{grid-column:1/-1;}.bottom{flex-direction:column;gap:8px;}}
`;
export const supportEmail = (import.meta.env.VITE_PUBLIC_SUPPORT_EMAIL as string | undefined) || 'fabiosena1436@gmail.com';
export const organization = (import.meta.env.VITE_PUBLIC_ORGANIZATION as string | undefined) || 'Fabio V. Sena';
export function Footer() {
  return <Wrap><div className="inner"><div className="columns">
    <div><Link to="/" className="brand"><BrandMark /> Conecta Sampaio</Link><p>Talentos, empresas e oportunidades.<br />Uma conexão para toda a cidade.</p></div>
    <div><h2>SEU PRÓXIMO PASSO</h2><nav aria-label="Oportunidades"><Link to="/vagas">Encontrar vagas</Link><Link to="/empresas">Conhecer empresas</Link><Link to="/cadastro?type=empresa">Publicar uma vaga <ArrowUpRight size={14} /></Link></nav></div>
    <div><h2>INFORMAÇÃO E CUIDADO</h2><nav aria-label="Ajuda"><Link to="/ajuda">Como funciona</Link><Link to="/privacidade">Privacidade dos dados</Link><Link to="/ajuda#seguranca">Segurança e suporte</Link>{supportEmail && <a href={`mailto:${supportEmail}`}>Fale com a equipe</a>}</nav></div>
  </div><div className="bottom"><span>© {new Date().getFullYear()} {organization}</span><span><MapPin size={13} /> Feito para Teodoro Sampaio, SP</span></div></div></Wrap>;
}
