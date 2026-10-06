import styled from 'styled-components';
export const HomeContainer = styled.div`width:100%;`;
export const Eyebrow = styled.span`display:inline-flex;align-items:center;gap:7px;font-size:11px;letter-spacing:.13em;font-weight:750;color:#0c6d5d;`;
export const HeroSection = styled.section`
  max-width:1200px;margin:auto;padding:60px 24px 44px;display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);align-items:center;gap:55px;
  @media(max-width:900px){gap:28px;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);padding-top:40px;}
  @media(max-width:850px){grid-template-columns:1fr;padding:36px 20px 28px;}
`;
export const HeroContent = styled.div`
  min-width:0;
  h1{font-size:clamp(2.4rem,4.5vw,3.65rem);line-height:1.1;letter-spacing:-.055em;font-weight:800;color:#102a43;margin:21px 0;} h1 em{font-style:normal;color:#0c6d5d;}
  >p{font-size:17px;line-height:1.75;max-width:540px;color:#526578;margin-bottom:26px;}
`;
export const SearchForm = styled.form`
  display:flex;align-items:center;gap:12px;background:white;padding:8px 8px 8px 18px;border:1px solid #cfdbe5;border-radius:12px;box-shadow:0 5px 18px #102a4307;
  >svg{color:#526578;flex-shrink:0;} input{border:0;background:transparent;outline:none;flex:1;width:0;font-size:14px;}
  button{display:flex;align-items:center;gap:9px;background:#175cda;color:white;border-radius:8px;padding:12px 16px;font-size:14px;font-weight:650;white-space:nowrap;}
  &:focus-within{outline:2px solid #175cda;outline-offset:2px;} button:hover{background:#1046aa;}
  @media(max-width:480px){display:grid;grid-template-columns:20px minmax(0,1fr);input{width:100%;font-size:16px;}button{grid-column:1/-1;justify-content:center;}}
  @media(max-width:400px){gap:8px;padding-left:12px;button{padding:12px;font-size:13px;} button svg{display:none;}}
`;
export const HeroLinks = styled.div`
  display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-top:16px;font-size:12px;color:#526578;span,a{display:flex;align-items:center;gap:5px;}a{color:#175cda;font-weight:650;}
  @media(max-width:400px){flex-direction:column;}
`;
export const CityPanel = styled.aside`
  color:white;background:#102f45;border-radius:22px;padding:27px 30px 24px;position:relative;overflow:hidden;min-height:355px;
  .panel-top{font-size:9px;letter-spacing:.11em;display:flex;align-items:center;gap:7px;color:#d2e3ec;} .dot{width:6px;height:6px;background:#91e0c5;border-radius:100%;}
  h2{font-size:31px;line-height:1.2;letter-spacing:-.035em;margin:23px 0 0;position:relative;z-index:1;}h2 em{color:#91e0c5;font-style:normal;}
  .city{height:110px;position:relative;margin:0 -8px;} .sun{width:64px;height:64px;border-radius:50%;background:#ffdc87;position:absolute;right:8px;top:-42px;}
  .building{position:absolute;bottom:0;border:1px solid #6798a5;background:repeating-linear-gradient(90deg,transparent 0 15px,#6894a655 15px 20px,transparent 20px 31px),#224b61;border-radius:4px 4px 0 0;}
  .one{height:55px;width:23%;left:0;}.two{height:88px;width:26%;left:25%;}.three{height:66px;width:22%;left:53%;background-color:#326d70;}.four{height:43px;width:23%;left:77%;}
  .ground{position:absolute;bottom:0;left:0;right:0;height:2px;background:#83c2b0;}
  .panel-bottom{display:flex;align-items:center;gap:12px;font-size:11px;color:#c7dce7;padding-top:17px;}.panel-bottom strong{color:white;font-weight:500;}.panel-bottom >svg:last-child{margin-left:auto;color:#91e0c5;}
  @media(max-width:850px){min-height:0;padding:22px 24px;display:none;}
`;
export const StatsSection = styled.section`
  max-width:1152px;margin:0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) minmax(0,1.4fr);align-items:center;padding:23px 0;border-top:1px solid #dbe3eb;border-bottom:1px solid #dbe3eb;gap:20px;
  >p{font-size:12px;color:#526578;border-left:1px solid #dbe3eb;padding-left:30px;} >p strong{font-weight:600;color:#21374b;}
  @media(max-width:1200px){margin:0 24px;}@media(max-width:700px){margin:0 20px;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:20px 0;>p{display:none;}}
`;
export const StatCard = styled.div`
  min-width:0;>div{min-width:0;}
  display:flex;gap:13px;align-items:center;>svg{color:#526578;} strong{font-size:25px;color:#102a43;font-weight:750;display:block;line-height:1.2;} span{font-size:12px;color:#526578;}
  @media(max-width:700px){gap:8px;>svg{display:none;}strong{font-size:23px;}span{font-size:11px;}}
`;
export const Section = styled.section`max-width:1200px;margin:auto;padding:48px 24px;@media(max-width:700px){padding:34px 20px;}`;
export const SectionTitle = styled.div`
  display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:26px;h2{font-size:clamp(1.5rem,3vw,2rem);color:#102a43;margin-top:8px;}p{margin-top:10px;color:#526578;font-size:14px;}
  >a{display:flex;align-items:center;gap:8px;color:#175cda;white-space:nowrap;font-size:13px;font-weight:650;min-height:44px;}
  @media(max-width:650px){flex-direction:column;align-items:start;gap:8px;}
`;
export const HowSection = styled(Section)`border-top:1px solid #dbe3eb;`;
export const StepsGrid = styled.div`display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;@media(max-width:700px){grid-template-columns:1fr;gap:20px;}`;
export const Step = styled.article`span{font-size:13px;color:#0c6d5d;font-weight:750;display:inline-flex;background:#e4f1ec;border-radius:8px;padding:7px 10px;margin-bottom:15px;}h3{font-size:18px;color:#102a43;margin-bottom:10px;}p{font-size:14px;color:#526578;line-height:1.75;}`;
export const CompanySection = styled.section`
  max-width:1152px;margin:10px auto 35px;padding:42px;background:#e7f0f3;border:1px solid #d8e6eb;border-radius:18px;display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:40px;align-items:center;
  h2{color:#102a43;font-size:clamp(1.6rem,3vw,2rem);margin:12px 0 15px;line-height:1.25;}p{font-size:14px;color:#526578;max-width:510px;}
  a{display:inline-flex;align-items:center;gap:16px;background:#102a43;color:white;border-radius:9px;padding:12px 20px;margin-top:24px;font-weight:650;font-size:14px;}
  .company-note{padding-left:35px;border-left:1px solid #baccd6;display:flex;flex-direction:column;gap:15px;color:#0c6d5d;}.company-note strong{color:#102a43;font-size:22px;line-height:1.4;}.company-note span{color:#526578;font-size:12px;}
  @media(max-width:1200px){margin-left:24px;margin-right:24px;}@media(max-width:700px){margin:0 20px 25px;padding:25px;grid-template-columns:1fr;.company-note{display:none;}}
`;
export const TrustSection = styled(Section)`display:flex;align-items:center;gap:17px;padding-top:20px;padding-bottom:35px;>svg{color:#0c6d5d;flex-shrink:0;}strong{color:#102a43;font-size:14px;}p{color:#526578;font-size:12px;margin-top:3px;}a{margin-left:auto;display:flex;align-items:center;gap:8px;white-space:nowrap;color:#175cda;font-size:12px;font-weight:650;}@media(max-width:700px){flex-wrap:wrap;a{margin-left:42px;}}`;
