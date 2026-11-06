import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export const demoUsers = ['demo-student-a', 'demo-student-b'] as const;
const runtime = globalThis as typeof globalThis & { signalDemoSessionKey?: Buffer };
const key = runtime.signalDemoSessionKey ??= randomBytes(32);
export function createDemoSession(user: string): string {
  if (!(demoUsers as readonly string[]).includes(user)) throw new Error('INVALID_USER');
  const payload = `${user}:${Date.now() + 8 * 3600000}`;
  return `${payload}:${createHmac('sha256', key).update(payload).digest('hex')}`;
}
export function readDemoSession(token: string | undefined, now = Date.now()): string | null {
  if (!token) return null;
  const [user, expires, signature, extra] = token.split(':');
  if (extra || !signature || !/^[a-f0-9]{64}$/.test(signature) || !(demoUsers as readonly string[]).includes(user)
    || !Number.isFinite(Number(expires)) || Number(expires) <= now) return null;
  const expected = createHmac('sha256', key).update(`${user}:${expires}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex')) ? user : null;
}
