import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const db = new PGlite({ extensions: { pg_trgm, uuid_ossp, pgcrypto } });
try {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE SCHEMA storage;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claim.role',true),''),'anon') $$;
    CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    CREATE TABLE storage.objects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text REFERENCES storage.buckets(id), name text);
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT string_to_array(name,'/') $$;
    GRANT USAGE ON SCHEMA auth,storage,public TO anon,authenticated;
  `);
  for (const migration of ['001_initial_schema', '003_storage_and_functions', '005_production_ready', '006_security_hardening']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${migration}.sql`, import.meta.url), 'utf8'));
  }
  // Reapplying the security correction is safe.
  await db.exec(await readFile(new URL('../supabase/migrations/006_security_hardening.sql', import.meta.url), 'utf8'));
  await db.exec('GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public,storage TO authenticated; GRANT SELECT ON ALL TABLES IN SCHEMA public,storage TO anon;');
  const ids = ['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444','55555555-5555-4555-8555-555555555555'];
  for (let i = 0; i < ids.length; i++) await db.query('INSERT INTO auth.users (id,email,raw_user_meta_data) VALUES ($1,$2,$3)', [ids[i],`test${i}@example.com`, { full_name: `Teste ${i}`, role: i === 4 ? 'admin' : i >= 2 ? 'empresa' : 'candidato' }]);
  assert.equal((await db.query('SELECT role FROM profiles WHERE id=$1',[ids[4]])).rows[0].role,'candidato','signup must reject administrator self-assignment');
  const company = (await db.query('SELECT id FROM companies WHERE owner_profile_id=$1',[ids[2]])).rows[0].id;
  const secondCompany = (await db.query('SELECT id FROM companies WHERE owner_profile_id=$1',[ids[3]])).rows[0].id;
  const job = (await db.query(`INSERT INTO jobs (company_id,title,slug,description,location,type,salary_text) VALUES ($1,'Vaga Teste','vaga-teste','Oportunidade de teste para validar candidaturas e todas as permissões do banco.','Teodoro Sampaio','Presencial','A combinar') RETURNING id`,[company])).rows[0].id;
  async function asUser(id, statement, params = []) {
    return db.transaction(async tx => {
      await tx.exec(`SET LOCAL ROLE ${id ? 'authenticated' : 'anon'}`);
      await tx.query("SELECT set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claim.role',$2,true)",[id || '',id ? 'authenticated' : 'anon']);
      return tx.query(statement,params);
    });
  }
  assert.equal((await asUser(null,'SELECT * FROM profiles')).rows.length,0,'anonymous cannot read contact information');
  assert.equal((await asUser(null,'SELECT * FROM candidates')).rows.length,0,'anonymous cannot read resumes/profile');
  await assert.rejects(asUser(ids[0],"UPDATE profiles SET role='admin' WHERE id=$1",[ids[0]]),/administrativos/);
  await assert.rejects(asUser(ids[2],'UPDATE companies SET is_sponsor=true WHERE id=$1',[company]),/administrativos/);
  await assert.rejects(asUser(ids[2],`INSERT INTO companies(owner_profile_id,name,slug,industry,location,contact_email,is_sponsor) VALUES($1,'Fraude','fraude','Geral','SP','fake@example.com',true)`,[ids[2]]),/administrativos/);
  await assert.rejects(asUser(ids[3],'SELECT get_company_dashboard_metrics($1)',[company]),/restrito/);
  assert.equal((await asUser(ids[2],'SELECT * FROM candidates WHERE profile_id=$1',[ids[0]])).rows.length,0,'recruiter cannot inspect unrelated candidates');
  await asUser(ids[0],"INSERT INTO storage.objects(bucket_id,name) VALUES('resumes',$1)",[`${ids[0]}/curriculo.pdf`]);
  assert.equal((await asUser(ids[3],"SELECT * FROM storage.objects WHERE bucket_id='resumes'")).rows.length,0,'unrelated recruiter cannot download resume');
  await assert.rejects(asUser(ids[3],"INSERT INTO storage.objects(bucket_id,name) VALUES('company-logos',$1)",[`${company}/logo.png`]),/row-level security/);
  await assert.rejects(asUser(ids[0],'INSERT INTO applications(job_id,candidate_id,company_id) VALUES($1,$2,$3)',[job,ids[0],company]),/row-level security/);
  const app = (await asUser(ids[0],'SELECT apply_to_job($1) AS id',[job])).rows[0].id;
  assert.equal((await asUser(ids[2],'SELECT * FROM candidates WHERE profile_id=$1',[ids[0]])).rows.length,1,'recipient company can access its candidate');
  assert.equal((await asUser(ids[2],"SELECT * FROM storage.objects WHERE bucket_id='resumes'")).rows.length,1,'recipient company can download the submitted resume');
  await assert.rejects(asUser(ids[0],"UPDATE applications SET status='aprovada' WHERE id=$1",[app]),/só pode desistir/);
  await assert.rejects(asUser(ids[2],'UPDATE applications SET company_id=$1 WHERE id=$2',[secondCompany,app]),/Identidade/);
  await asUser(ids[2],"UPDATE applications SET status='visualizada' WHERE id=$1",[app]);
  assert.equal((await asUser(ids[0],"SELECT * FROM notifications WHERE title='Sua candidatura foi atualizada'")).rows.length,1,'company review notifies the candidate');
  await asUser(ids[0],"SELECT set_my_skills(ARRAY['C++','C#','React','React'])");
  assert.equal((await asUser(ids[0],'SELECT * FROM candidate_skills')).rows.length,3,'skill slug collisions and duplicates are handled');
  await assert.rejects(asUser(ids[2],"SELECT set_my_skills(ARRAY['React'])"),/Apenas candidatos/);
  await asUser(ids[0],'SELECT toggle_saved_job($1)',[job]);
  assert.equal((await asUser(ids[1],'SELECT * FROM saved_jobs')).rows.length,0,'saved jobs are private');
  await asUser(ids[2],"UPDATE jobs SET status='Encerrada' WHERE id=$1",[job]);
  assert.equal((await asUser(null,'SELECT * FROM v_jobs_with_company WHERE id=$1',[job])).rows.length,0,'public view hides closed jobs');
  assert.equal((await asUser(ids[0],'SELECT * FROM v_jobs_with_company WHERE id=$1',[job])).rows.length,1,'applicant retains job history');
  await assert.rejects(asUser(ids[1],'SELECT apply_to_job($1)',[job]),/não está ativa/);
  await asUser(ids[0],"UPDATE applications SET status='desistiu' WHERE id=$1",[app]);
  assert.equal((await asUser(ids[2],"SELECT * FROM storage.objects WHERE bucket_id='resumes'")).rows.length,0,'withdrawal revokes recruiter access');
  console.log('PASS: migrations, signup, jobs, applications, private files and authorization checks.');
} finally { await db.close(); }
