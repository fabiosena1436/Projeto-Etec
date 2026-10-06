import styled from 'styled-components';
export const Page = styled.div`
 background:#f3f6f9; padding:36px 24px 64px; min-height:75vh;
 .shell{max-width:1200px;margin:auto} .eyebrow{color:#0c6d5d;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
 h1{font-size:clamp(27px,4vw,38px);letter-spacing:-.04em;color:#102a43;margin:8px 0} .intro{color:#52687a;line-height:1.6;margin-bottom:26px}
 .columns{display:grid;grid-template-columns:220px minmax(0,1fr) 260px;gap:22px;align-items:start}
 .card{background:white;border:1px solid #dde6ee;border-radius:16px;padding:22px;margin-bottom:18px;box-shadow:0 3px 12px #16344b04}
 h2{font-size:19px;margin:0 0 12px;color:#102a43} h3{font-size:15px;color:#102a43;margin:0 0 5px}
 p{line-height:1.65} small,.muted{color:#52687a;font-size:13px} a{color:#165bb4;font-weight:650}
 button{display:inline-flex;align-items:center;justify-content:center;gap:7px;font:inherit;font-size:13px;font-weight:650;padding:10px 12px;border:1px solid #dce5ee;border-radius:9px;background:white;color:#244258;cursor:pointer;min-height:40px}
 button:hover{background:#f0f6fc} button:disabled{opacity:.55;cursor:wait} button[aria-pressed=true]{color:#155eb7;border-color:#98bce8;background:#edf5ff}
 .primary{background:#165fbd;color:white;border-color:#165fbd} .primary:hover{background:#124d99}
 .actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px} .navlinks{display:grid;gap:15px;margin-top:22px;font-size:14px} .identity{width:46px;height:46px;background:#e8f3ee;color:#0c6d5d;border-radius:13px;display:grid;place-items:center;margin-bottom:14px;font-weight:800}
 .tabs{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px}.tabs .refresh{margin-left:auto}
 label{display:block;font-size:13px;font-weight:650;color:#29475f;margin:12px 0 6px}
 textarea,input,select{font:inherit;width:100%;padding:12px;border:1px solid #cedbe7;border-radius:9px;background:white;color:#16344b;box-sizing:border-box} textarea{resize:vertical;min-height:85px}
 .posthead{display:flex;gap:12px;align-items:center;margin-bottom:16px}.logo{width:46px;height:46px;object-fit:contain;background:#f0f5fa;border-radius:11px;flex-shrink:0}.posthead .company{flex:1;min-width:0}.posthead a{display:block;overflow-wrap:anywhere;font-size:15px;color:#102a43}.badge{display:inline-block;color:#0c6d5d;font-size:11px;margin-right:8px;font-weight:750}
 .postbody{white-space:pre-wrap;overflow-wrap:anywhere;color:#29475f;font-size:15px;margin:0}.postimage{width:100%;max-height:420px;object-fit:contain;border-radius:10px;margin-top:16px;background:#f3f6f9}
 .author-name{display:block;overflow-wrap:anywhere;font-size:15px;color:#102a43}
 .counts{display:flex;gap:16px;margin-top:16px;font-size:12px;color:#52687a}.postactions{display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid #e8edf2;padding-top:12px;margin-top:12px}
 .comments{margin-top:18px;border-top:1px solid #e8edf2;padding-top:12px}.comment{background:#f3f6fa;border-radius:10px;padding:12px;margin-bottom:10px}.comment p{white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px;margin:5px 0}.comment .by{display:flex;justify-content:space-between;gap:10px}.comment button{padding:4px 7px;min-height:32px;font-size:11px}
 .report{background:#fff9ec;padding:14px;border-radius:10px;margin-top:14px} .empty{text-align:center;padding:35px 20px}.joblink{display:block;border-bottom:1px solid #e5ebf1;padding:12px 0}.joblink small{display:block;margin-top:4px}.notification{display:block;padding:12px 0;border-bottom:1px solid #e5ebf1;font-size:13px}.notification strong{display:block}.notification p{margin:4px 0}
 :focus-visible{outline:3px solid #76abe9;outline-offset:3px}
 @media(max-width:1100px){.columns{grid-template-columns:190px minmax(0,1fr)}.right{grid-column:2}.right .card{margin-bottom:18px}}
 @media(max-width:700px){padding:25px 16px 45px;.columns{display:flex;flex-direction:column;gap:0}.left,.center,.right{width:100%}.left .card{padding:16px}.left .identity{display:none}.navlinks{display:flex;flex-wrap:wrap;gap:16px;margin-top:12px}.card{padding:17px}.posthead{align-items:flex-start}.posthead button{padding:7px;font-size:12px}.intro{font-size:14px}.right{margin-top:8px}}
`;
