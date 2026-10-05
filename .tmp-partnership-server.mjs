import http from 'node:http';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
http.createServer((req,res)=>{
 res.setHeader('Content-Type','text/html; charset=utf-8');
 if(req.method==='GET'&&req.url==='/migration'){res.end('<label>Migração<textarea readonly>'+escape(readFileSync('supabase/migrations/009_super_admin_sponsorship.sql','utf8'))+'</textarea></label>');return;}
 if(req.method==='GET'){res.end('<form method="post" action="/save"><label>Imagem<textarea name="image"></textarea></label><button>Salvar comprovante</button></form>');return;}
 if(req.method!=='POST'||req.url!=='/save'){res.writeHead(404);res.end();return;}
 let body='';req.on('data',chunk=>{body+=chunk;if(body.length>3_000_000)req.destroy();});
 req.on('end',()=>{const data=new URLSearchParams(body).get('image');if(!data||!/^[A-Za-z0-9+/=]+$/.test(data)){res.writeHead(400);res.end();return;}mkdirSync('.vercel/design-proof',{recursive:true});writeFileSync('.vercel/design-proof/partnerships.jpg',Buffer.from(data,'base64'));res.end('<h1>Imagem salva</h1>');});
}).listen(5189,'127.0.0.1',()=>process.stdout.write('Prévia local pronta\n'));
