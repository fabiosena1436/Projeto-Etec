import { randomBytes } from 'node:crypto';
import { and, eq, gt, desc, sql, count, or } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { accounts, sessions, candidates, companies, jobs, applications, savedJobs, rateLimits } from './schema';
import { HttpError, hashPassword, verifyPassword, tokenHash, textField, stringList, safeUrl } from './security';
import type { User } from '../src/data/users';

const publicAccount = (a: typeof accounts.$inferSelect) => ({ id: a.id, email: a.email, name: a.name, role: a.role });
const publicCompany = ({ ownerId: _owner, ...company }: typeof companies.$inferSelect) => company;
const jobDto = (job: typeof jobs.$inferSelect) => ({ ...job, postedAt: job.postedAt.toISOString() });
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function validId(id: string) { if (!uuidPattern.test(id)) throw new HttpError(404, 'Registro não encontrado.'); return id; }

export function createHandler(database: () => NodePgDatabase) {
  return async function handle(request: Request): Promise<Response> {
    const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
    try {
      const url = new URL(request.url);
      const path = (url.searchParams.get('path') || url.pathname.replace(/^\/api\/?/, '')).replace(/^\/+|\/+$/g, '');
      const method = request.method;
      if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(method)) throw new HttpError(405, 'Método não permitido.');
      if (method !== 'GET') {
        const origin = request.headers.get('origin');
        const allowed = process.env.APP_URL ? new URL(process.env.APP_URL).origin : url.origin;
        if (origin && origin !== url.origin && origin !== allowed) throw new HttpError(403, 'Origem não permitida.');
        if (request.headers.get('sec-fetch-site') === 'cross-site') throw new HttpError(403, 'Origem não permitida.');
        if (!request.headers.get('content-type')?.includes('application/json')) throw new HttpError(415, 'Envie JSON.');
      }
      let body: Record<string, unknown> = {};
      if (method !== 'GET') {
        const raw = await request.text();
        if (raw.length > 3000000) throw new HttpError(413, 'Arquivo muito grande. Máximo: 2 MB.');
        try { body = raw ? JSON.parse(raw) : {}; } catch { throw new HttpError(400, 'JSON inválido.'); }
        if (!body || Array.isArray(body) || typeof body !== 'object') throw new HttpError(400, 'JSON inválido.');
      }
      const db = database();
      const rawToken = request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith('conecta_session='))?.slice(16);
      async function currentUser(required = true, role?: 'empresa' | 'candidato') {
        const found = rawToken ? await db.select({ account: accounts }).from(sessions).innerJoin(accounts, eq(accounts.id, sessions.accountId))
          .where(and(eq(sessions.tokenHash, tokenHash(rawToken)), gt(sessions.expiresAt, new Date()))).limit(1) : [];
        const user = found[0]?.account;
        if (!user && required) throw new HttpError(401, 'Entre na sua conta para continuar.');
        if (user && role && user.role !== role) throw new HttpError(403, 'Seu perfil não tem acesso a esta ação.');
        return user;
      }
      async function myCompany() {
        const user = (await currentUser(true, 'empresa'))!;
        const [company] = await db.select().from(companies).where(eq(companies.ownerId, user.id));
        if (!company) throw new HttpError(404, 'Empresa não encontrada.');
        return company;
      }
      async function setSession(id: string) {
        const token = randomBytes(32).toString('hex');
        await db.insert(sessions).values({ tokenHash: tokenHash(token), accountId: id, expiresAt: new Date(Date.now() + 7 * 86400000) });
        headers.set('Set-Cookie', `conecta_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${url.protocol === 'https:' ? '; Secure' : ''}`);
      }
      if (path === 'health' && method === 'GET') {
        const [j] = await db.select({ value: count() }).from(jobs).where(eq(jobs.status, 'Ativa'));
        const [c] = await db.select({ value: count() }).from(companies);
        return reply({ connected: true, provider: 'Neon PostgreSQL', jobs: j.value, companies: c.value });
      }
      if ((path === 'auth/register' || path === 'auth/login') && method === 'POST') {
        const email = textField(body.email, 'email', 254, true).toLowerCase();
        const password = typeof body.password === 'string' ? body.password : '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) throw new HttpError(400, 'Informe um email válido e uma senha de 8 a 128 caracteres.');
        const ip = request.headers.get('x-vercel-forwarded-for') || 'local';
        const key = tokenHash(`${ip}:${path}:${email}`);
        const [limit] = await db.insert(rateLimits).values({ key, expiresAt: new Date(Date.now() + 15 * 60000) }).onConflictDoUpdate({
          target: rateLimits.key,
          set: { count: sql`case when ${rateLimits.expiresAt} < now() then 1 else ${rateLimits.count} + 1 end`, expiresAt: sql`case when ${rateLimits.expiresAt} < now() then now() + interval '15 minutes' else ${rateLimits.expiresAt} end` },
        }).returning();
        if (limit.count > 10) throw new HttpError(429, 'Muitas tentativas. Aguarde 15 minutos.');
        if (path === 'auth/register') {
          const role = body.role;
          if (role !== 'candidato' && role !== 'empresa') throw new HttpError(400, 'Perfil inválido.');
          const name = textField(body.full_name, 'nome', 150, true);
          const phone = textField(body.phone, 'telefone', 40);
          const city = textField(body.city, 'cidade', 150) || 'Teodoro Sampaio, SP';
          const passwordHash = await hashPassword(password);
          const user = await db.transaction(async tx => {
            const [account] = await tx.insert(accounts).values({ email, name, role, passwordHash }).returning();
            if (role === 'empresa') await tx.insert(companies).values({ ownerId: account.id, name, contactEmail: email, location: city });
            else await tx.insert(candidates).values({ id: account.id, profile: { id: account.id, name, email, phone, city, profession: '', avatarUrl: '', age: 0, about: '', skills: [], education: '', experience: [] } });
            return account;
          });
          await setSession(user.id);
          return reply({ user: publicAccount(user) }, 201);
        }
        const [user] = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1);
        // Same expensive derivation for unknown users prevents trivial account enumeration by timing.
        const stored = user?.passwordHash || `${'0'.repeat(32)}:${'0'.repeat(128)}`;
        if (!await verifyPassword(password, stored) || !user) throw new HttpError(401, 'Email ou senha inválidos.');
        await setSession(user.id);
        return reply({ user: publicAccount(user) });
      }
      if (path === 'auth/session' && method === 'GET') {
        const user = await currentUser(false);
        return reply({ user: user ? publicAccount(user) : null });
      }
      if (path === 'auth/logout' && method === 'POST') {
        if (rawToken) await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash(rawToken)));
        headers.set('Set-Cookie', `conecta_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${url.protocol === 'https:' ? '; Secure' : ''}`);
        return reply({ ok: true });
      }
      if (path === 'companies' && method === 'GET') return reply((await db.select().from(companies).limit(100)).map(publicCompany));
      if (path === 'company/me') {
        const company = await myCompany();
        if (method === 'GET') return reply(publicCompany(company));
        if (method === 'PATCH') {
          const [updated] = await db.update(companies).set({ name: textField(body.name, 'nome', 150, true), description: textField(body.description, 'descrição', 10000), logoUrl: safeUrl(body.logoUrl), website: safeUrl(body.website) }).where(eq(companies.id, company.id)).returning();
          return reply(publicCompany(updated));
        }
      }
      if (path.startsWith('companies/') && method === 'GET') {
        const [company] = await db.select().from(companies).where(eq(companies.id, validId(path.split('/')[1])));
        if (!company) throw new HttpError(404, 'Empresa não encontrada.');
        return reply(publicCompany(company));
      }
      if (path === 'company/dashboard' && method === 'GET') {
        const company = await myCompany();
        const myJobs = await db.select().from(jobs).where(eq(jobs.companyId, company.id)).orderBy(desc(jobs.postedAt));
        const entries = await db.select({ application: applications, candidate: candidates.profile }).from(applications).innerJoin(jobs, eq(jobs.id, applications.jobId)).innerJoin(candidates, eq(candidates.id, applications.candidateId)).where(and(eq(jobs.companyId, company.id), sql`${applications.status} != 'desistiu'`));
        return reply({ company: publicCompany(company), jobs: myJobs.map(jobDto), applications: entries });
      }
      if (path === 'jobs' && method === 'GET') {
        const rows = await db.select({ job: jobs, company: companies }).from(jobs).innerJoin(companies, eq(companies.id, jobs.companyId)).where(eq(jobs.status, 'Ativa')).orderBy(desc(jobs.postedAt)).limit(100);
        return reply(rows.map(row => ({ ...jobDto(row.job), company: publicCompany(row.company) })));
      }
      if (path === 'jobs' && method === 'POST' || /^jobs\/[^/]+$/.test(path) && method === 'PATCH') {
        const company = await myCompany();
        const data = {
          title: textField(body.title, 'título', 200, true), description: textField(body.description, 'descrição', 20000, true),
          location: textField(body.location, 'localização', 200, true), salary: textField(body.salary, 'salário', 150) || 'A combinar',
          type: textField(body.type, 'modalidade', 50, true), requirements: stringList(body.requirements || []), benefits: stringList(body.benefits || []),
        };
        if (!['Presencial', 'Remoto', 'Híbrido', 'Estágio', 'Jovem Aprendiz', 'Freelancer', 'Temporário'].includes(data.type)) throw new HttpError(400, 'Modalidade inválida.');
        if (method === 'POST') { const [job] = await db.insert(jobs).values({ ...data, companyId: company.id }).returning(); return reply(jobDto(job), 201); }
        const [job] = await db.update(jobs).set(data).where(and(eq(jobs.id, validId(path.split('/')[1])), eq(jobs.companyId, company.id))).returning();
        if (!job) throw new HttpError(404, 'Vaga não encontrada.');
        return reply(jobDto(job));
      }
      if (/^jobs\/[^/]+\/status$/.test(path) && method === 'PATCH') {
        const company = await myCompany();
        if (body.status !== 'Ativa' && body.status !== 'Encerrada') throw new HttpError(400, 'Status inválido.');
        const [job] = await db.update(jobs).set({ status: body.status }).where(and(eq(jobs.id, validId(path.split('/')[1])), eq(jobs.companyId, company.id))).returning();
        if (!job) throw new HttpError(404, 'Vaga não encontrada.');
        return reply(jobDto(job));
      }
      if (/^jobs\/[^/]+$/.test(path) && method === 'GET') {
        const [row] = await db.select({ job: jobs, company: companies }).from(jobs).innerJoin(companies, eq(companies.id, jobs.companyId)).where(eq(jobs.id, validId(path.split('/')[1])));
        if (!row) throw new HttpError(404, 'Vaga não encontrada.');
        if (row.job.status !== 'Ativa') {
          const user = await currentUser(false);
          if (user?.id !== row.company.ownerId) throw new HttpError(404, 'Vaga não encontrada.');
        }
        return reply({ ...jobDto(row.job), company: publicCompany(row.company) });
      }
      if (path === 'candidate/me' || /^candidates\/[^/]+$/.test(path)) {
        const user = (await currentUser())!;
        const id = path === 'candidate/me' ? user.id : validId(path.split('/')[1]);
        if (id !== user.id) {
          if (user.role !== 'empresa') throw new HttpError(403, 'Acesso restrito.');
          const [permission] = await db.select({ id: applications.id }).from(applications).innerJoin(jobs, eq(jobs.id, applications.jobId)).innerJoin(companies, eq(companies.id, jobs.companyId)).where(and(eq(companies.ownerId, user.id), eq(applications.candidateId, id), sql`${applications.status} != 'desistiu'`)).limit(1);
          if (!permission) throw new HttpError(403, 'Acesso restrito aos seus candidatos.');
        }
        const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
        if (!candidate) throw new HttpError(404, 'Candidato não encontrado.');
        if (method === 'GET') return reply(candidate.profile);
        if (method === 'PATCH' && id === user.id && user.role === 'candidato') {
          const age = Number(body.age || 0);
          if (!Number.isInteger(age) || age < 0 || age > 120) throw new HttpError(400, 'Idade inválida.');
          const profile: User = { ...candidate.profile, name: textField(body.name, 'nome', 150, true), profession: textField(body.profession, 'profissão', 200), city: textField(body.city, 'cidade', 150), age, phone: textField(body.phone, 'telefone', 40), about: textField(body.about, 'sobre', 10000), education: textField(body.education, 'formação', 500), skills: stringList(body.skills || []) };
          await db.transaction(async tx => { await tx.update(candidates).set({ profile }).where(eq(candidates.id, id)); await tx.update(accounts).set({ name: profile.name }).where(eq(accounts.id, id)); });
          return reply(profile);
        }
      }
      if (path === 'candidate/resume' && method === 'POST') {
        const user = (await currentUser(true, 'candidato'))!;
        const encoded = textField(body.data, 'currículo', 2800000, true);
        const filename = textField(body.name, 'nome do arquivo', 200, true);
        if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new HttpError(400, 'PDF inválido.');
        const bytes = Buffer.from(encoded, 'base64');
        if (bytes.length > 2 * 1024 * 1024) throw new HttpError(413, 'Máximo: 2 MB.');
        if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new HttpError(400, 'Envie um arquivo PDF.');
        const [candidate] = await db.select().from(candidates).where(eq(candidates.id, user.id));
        const resumeUrl = `/api/resumes/${user.id}`;
        await db.update(candidates).set({ resume: encoded, resumeName: filename, profile: { ...candidate.profile, resumeUrl } }).where(eq(candidates.id, user.id));
        return reply({ resumeUrl, name: filename });
      }
      if (/^resumes\/[^/]+$/.test(path) && method === 'GET') {
        const id = validId(path.split('/')[1]);
        const access = await handle(new Request(new URL(`/api/candidates/${id}`, url), { headers: request.headers }));
        if (!access.ok) return access;
        const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
        if (!candidate.resume) throw new HttpError(404, 'Currículo não encontrado.');
        headers.set('Content-Type', 'application/pdf'); headers.set('Content-Disposition', 'attachment; filename="curriculo.pdf"');
        return new Response(new Uint8Array(Buffer.from(candidate.resume, 'base64')), { headers });
      }
      if (path === 'applications' && method === 'GET') {
        const user = (await currentUser(true, 'candidato'))!;
        const entries = await db.select({ application: applications, job: jobs }).from(applications).innerJoin(jobs, eq(jobs.id, applications.jobId)).where(and(eq(applications.candidateId, user.id), sql`${applications.status} != 'desistiu'`));
        return reply(entries.map(entry => ({ ...entry.application, job: jobDto(entry.job) })));
      }
      if (path === 'applications' && method === 'POST') {
        const user = (await currentUser(true, 'candidato'))!;
        const jobId = validId(textField(body.jobId, 'vaga', 36, true));
        // Row lock ensures a company cannot close the job between the status check and insert.
        const result = await db.transaction(async tx => {
          const [job] = await tx.select().from(jobs).where(and(eq(jobs.id, jobId), eq(jobs.status, 'Ativa'))).for('update');
          if (!job) throw new HttpError(409, 'Esta vaga não está mais disponível.');
          const [entry] = await tx.insert(applications).values({ jobId, candidateId: user.id }).onConflictDoUpdate({ target: [applications.jobId, applications.candidateId], set: { status: sql`case when ${applications.status} = 'desistiu' then 'enviada' else ${applications.status} end` } }).returning();
          return entry;
        });
        return reply(result, 201);
      }
      if (/^applications\/[^/]+$/.test(path) && method === 'DELETE') {
        const user = (await currentUser(true, 'candidato'))!;
        await db.update(applications).set({ status: 'desistiu' }).where(and(eq(applications.candidateId, user.id), eq(applications.jobId, validId(path.split('/')[1]))));
        return reply({ ok: true });
      }
      if (path === 'saved-jobs' && method === 'GET') {
        const user = (await currentUser(true, 'candidato'))!;
        const rows = await db.select({ job: jobs }).from(savedJobs).innerJoin(jobs, eq(jobs.id, savedJobs.jobId)).where(eq(savedJobs.candidateId, user.id));
        return reply(rows.map(row => jobDto(row.job)));
      }
      if (/^saved-jobs\/[^/]+$/.test(path)) {
        const user = (await currentUser(true, 'candidato'))!;
        const jobId = validId(path.split('/')[1]);
        if (method === 'POST') {
          const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
          if (!job) throw new HttpError(404, 'Vaga não encontrada.');
          await db.insert(savedJobs).values({ jobId, candidateId: user.id }).onConflictDoNothing(); return reply({ ok: true });
        }
        if (method === 'DELETE') { await db.delete(savedJobs).where(and(eq(savedJobs.jobId, jobId), eq(savedJobs.candidateId, user.id))); return reply({ ok: true }); }
      }
      throw new HttpError(404, 'Endpoint não encontrado.');
    } catch (error) {
      if (error instanceof HttpError) return reply({ error: error.message }, error.status);
      const details = error as { code?: string; message?: string; cause?: { code?: string } };
      if (details.code === '23505' || details.cause?.code === '23505') return reply({ error: 'Este email já está cadastrado.' }, 409);
      console.error('API error', { code: details.code || details.cause?.code || 'internal' });
      return reply({ error: 'Serviço indisponível. Tente novamente em alguns instantes.' }, 503);
    }
  };
}
