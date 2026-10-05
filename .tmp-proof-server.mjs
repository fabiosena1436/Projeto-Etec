import http from 'node:http';
import { mkdirSync, writeFileSync } from 'node:fs';
const server=http.createServer((req,res)=>{
 if(req.method==='GET'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<form method="post" action="/save"><label>Imagem<textarea name="image"></textarea></label><button>Salvar comprovante</button></form>');return;}
 if(req.method!=='POST'||req.url!=='/save'){res.writeHead(404);res.end();return;}
 let body='';req.on('data',chunk=>{body+=chunk;if(body.length>3_000_000)req.destroy();});
 req.on('end',()=>{const data=new URLSearchParams(body).get('image');if(!data||!/^[A-Za-z0-9+/=]+$/.test(data)){res.writeHead(400);res.end();return;}mkdirSync('.vercel/design-proof',{recursive:true});writeFileSync('.vercel/design-proof/sample-jobs.jpg',Buffer.from(data,'base64'));res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<h1>Imagem salva</h1>');});
});
server.listen(5189,'127.0.0.1',()=>process.stdout.write('Comprovante local pronto\n'));
