import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  const actual = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function textField(value: unknown, name: string, max = 500, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new HttpError(400, `Preencha ${name}.`);
    return '';
  }
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw new HttpError(400, `Campo inválido: ${name}.`);
  return value.trim();
}
export function stringList(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 100 || value.some(v => typeof v !== 'string' || v.length > 500)) throw new HttpError(400, 'Lista inválida.');
  return value.map(v => v.trim()).filter(Boolean);
}
export function safeUrl(value: unknown) {
  const text = textField(value, 'URL', 2000);
  if (text && !/^https?:\/\//i.test(text)) throw new HttpError(400, 'Use uma URL http ou https.');
  return text;
}
