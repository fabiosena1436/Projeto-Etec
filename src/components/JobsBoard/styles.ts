import styled from 'styled-components';
export const BoardContainer = styled.div`width:100%;`;
export const SearchContainer = styled.div`margin-bottom:24px;`;
export const SearchInputWrapper = styled.div`
  display:flex;align-items:center;gap:12px;background:white;border:1px solid #cfdbe5;border-radius:11px;padding:8px 16px;color:#526578;
  &:focus-within{outline:2px solid #175cda;outline-offset:2px;}input{flex:1;min-width:0;border:0;outline:0;background:transparent;font-size:16px;color:#21374b;}input::placeholder{color:#526578;}button{display:flex;align-items:center;color:#526578;}
`;
export const FilterContainer = styled.div`display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;`;
export const FilterButton = styled.button<{ $active?: boolean }>`
  padding:9px 16px;border:1px solid ${({$active}) => $active ? '#102a43' : '#dbe3eb'};border-radius:8px;background:${({$active}) => $active ? '#102a43' : '#fff'};color:${({$active}) => $active ? '#fff' : '#526578'};font-size:13px;font-weight:600;
  &:hover{border-color:#175cda;}@media(max-width:500px){padding:8px 12px;}
`;
export const JobsGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr));gap:20px;`;
export const EmptyState = styled.div`
  grid-column:1/-1;text-align:center;padding:42px 24px;border:1px solid #dbe3eb;border-radius:14px;background:linear-gradient(130deg,#fff,#edf4f8);
  >svg{color:#0c6d5d;margin-bottom:13px;}h3{font-size:21px;color:#102a43;margin-bottom:10px;}p{color:#526578;font-size:15px;max-width:510px;margin:auto;line-height:1.7;}
  a,button{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#175cda;color:white;border-radius:9px;padding:10px 20px;font-size:14px;font-weight:600;margin-top:22px;}
  @media(max-width:500px){padding:30px 20px;}
`;
