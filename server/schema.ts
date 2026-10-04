import { pgTable, text, timestamp, uuid, jsonb, integer, boolean, uniqueIndex, index } from 'drizzle-orm/pg-core';
import type { User } from '../src/data/users';
import type { Promotion } from '../src/data/companies';

export const accounts = pgTable('conecta_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['candidato', 'empresa'] }).notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export const sessions = pgTable('conecta_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
export const candidates = pgTable('conecta_candidates', {
  id: uuid('id').primaryKey().references(() => accounts.id, { onDelete: 'cascade' }),
  profile: jsonb('profile').$type<User>().notNull(),
  resume: text('resume'),
  resumeName: text('resume_name'),
});
export const companies = pgTable('conecta_companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().unique().references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), industry: text('industry').notNull().default('Outros'),
  logoUrl: text('logo_url').notNull().default(''), description: text('description').notNull().default(''),
  location: text('location').notNull().default('Teodoro Sampaio, SP'),
  contactEmail: text('contact_email').notNull(), website: text('website').notNull().default(''),
  slogan: text('slogan').notNull().default(''), isSponsor: boolean('is_sponsor').notNull().default(false),
  promotions: jsonb('promotions').$type<Promotion[]>().notNull().default([]),
});
export const jobs = pgTable('conecta_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), type: text('type').notNull(), salary: text('salary').notNull().default('A combinar'),
  location: text('location').notNull(), description: text('description').notNull(),
  requirements: jsonb('requirements').$type<string[]>().notNull().default([]),
  benefits: jsonb('benefits').$type<string[]>().notNull().default([]),
  status: text('status', { enum: ['Ativa', 'Encerrada'] }).notNull().default('Ativa'),
  postedAt: timestamp('posted_at', { withTimezone: true }).notNull().defaultNow(),
  views: integer('views').notNull().default(0),
}, table => [index('conecta_jobs_company_idx').on(table.companyId), index('conecta_jobs_status_idx').on(table.status, table.postedAt)]);
export const applications = pgTable('conecta_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('enviada'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [uniqueIndex('conecta_application_unique').on(table.jobId, table.candidateId)]);
export const savedJobs = pgTable('conecta_saved_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
}, table => [uniqueIndex('conecta_saved_unique').on(table.jobId, table.candidateId)]);
export const rateLimits = pgTable('conecta_rate_limits', {
  key: text('key').primaryKey(), count: integer('count').notNull().default(1),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
