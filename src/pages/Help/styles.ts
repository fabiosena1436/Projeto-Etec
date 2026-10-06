import styled from 'styled-components';
export const Container = styled.div`max-width:1050px;width:100%;margin:auto;padding:46px 24px 60px;@media(max-width:600px){padding:32px 20px;}`;
export const Heading = styled.header`margin-bottom:30px;span{color:#0c6d5d;font-size:11px;font-weight:750;letter-spacing:.12em;}h1{color:#102a43;margin:12px 0;}p{color:#526578;font-size:16px;max-width:620px;}`;
export const Cards = styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-bottom:28px;@media(max-width:650px){grid-template-columns:1fr;}`;
export const Card = styled.article`background:white;border:1px solid #dbe3eb;border-radius:14px;padding:28px;span{font-size:11px;color:#0c6d5d;font-weight:750;letter-spacing:.08em;}h2{font-size:23px;color:#102a43;margin:12px 0;}p{font-size:15px;color:#526578;line-height:1.8;}a{display:inline-flex;align-items:center;gap:8px;color:#175cda;font-weight:650;margin-top:20px;font-size:14px;min-height:44px;}`;
export const Block = styled.section`
  background:white;border:1px solid #dbe3eb;border-radius:14px;padding:30px;margin-top:24px;h2{color:#102a43;font-size:24px;margin-bottom:18px;}h3{color:#102a43;font-size:18px;margin:24px 0 12px;}p{color:#526578;line-height:1.85;font-size:15px;margin:12px 0;}a{color:#175cda;text-decoration:underline;text-underline-offset:3px;}
  details{border-top:1px solid #dbe3eb;padding:8px 0;}summary{font-weight:650;color:#21374b;cursor:pointer;padding:14px 0;min-height:44px;}details p{margin:0 0 14px;max-width:780px;}
  @media(max-width:600px){padding:23px;}
`;
