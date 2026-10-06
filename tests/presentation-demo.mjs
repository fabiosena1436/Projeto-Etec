import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { presentationCompanies, presentationPosts, mergePresentationFeed, getPresentationCompany, isPresentationEntity } from '../src/data/presentationDemo.ts';

assert.equal(presentationCompanies.length,5);
assert.equal(presentationPosts.length,10);
assert.equal(new Set(presentationCompanies.map(c=>c.id)).size,5);
assert.equal(new Set(presentationPosts.map(p=>p.id)).size,10);
for(const c of presentationCompanies){
  assert.ok(c.is_demo && !c.is_verified && !c.cnpj && !c.phone && !c.contact_email && !c.website,'fictional company cannot claim verified identity or supply real contact');
  assert.ok(c.name.includes('Demonstração'));
  assert.equal(getPresentationCompany(c.slug),c);
  assert.ok(isPresentationEntity(c.id));
  assert.equal(mergePresentationFeed([],c.id).length,2,'profile shows only its two posts');
  for(const path of [c.logo_url,c.banner_url]){
    const svg=await readFile(new URL('../public'+path,import.meta.url),'utf8');
    assert.ok(svg.includes('<svg') && svg.includes('</svg>'));
    assert.ok(!svg.includes('http://') || svg.includes('xmlns="http://www.w3.org/2000/svg"'));
  }
  for(const p of c.promotions||[]) assert.ok(p.description.startsWith('Demonstração:') && p.views_count===0);
}
for(const p of presentationPosts){
  assert.match(p.id,/^[a-f0-9-]{36}$/,'post cursor must be a UUID accepted by the database RPC');
  assert.ok(p.is_demo && !p.can_edit && !p.verified && !p.likes && !p.comment_count);
  assert.ok(p.body.length<=2000);
  assert.ok(isPresentationEntity(p.id));
}
assert.equal(mergePresentationFeed([],undefined,true).length,0,'following feed does not invent followed demo companies');
assert.equal(mergePresentationFeed([],'real-company').length,0,'real company feed excludes demo posts');
const newest=Math.max(...presentationPosts.map(p=>Date.parse(p.created_at)));
const real=Array.from({length:45},(_,i)=>({...presentationPosts[0],id:`aa000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,company_id:'real-company',is_demo:false,created_at:new Date(newest-i*1200000).toISOString()}));
const compare=(a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)||b.id.localeCompare(a.id);
const expected=[...real,...presentationPosts].sort(compare);
const read=[];let cursor;
for(let page=0;page<6;page++){
  const visible=real.filter(p=>!cursor || Date.parse(p.created_at)<Date.parse(cursor.created_at) || (p.created_at===cursor.created_at&&p.id<cursor.id)).sort(compare).slice(0,20);
  const batch=mergePresentationFeed(visible,undefined,false,cursor);
  if(!batch.length)break;
  read.push(...batch);cursor=batch.at(-1);
}
assert.deepEqual(read.map(p=>p.id),expected.map(p=>p.id),'combined pagination must preserve all real and demo posts, including timestamp ties');
console.log('PASS: five labelled demo companies, ten posts, local images, safe contacts and combined feed pagination.');
