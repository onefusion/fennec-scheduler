import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory stand-in for next/headers' cookies() store, shared across a test.
const cookieJar = new Map<string, string>();

vi.mock('next/headers', () => ({
  cookies: async () => ({
    set: (name: string, value: string) => cookieJar.set(name, value),
    get: (name: string) => (cookieJar.has(name) ? { value: cookieJar.get(name) } : undefined),
    delete: (name: string) => cookieJar.delete(name),
  }),
}));

const { createAdminSession, isAdminAuthenticated, clearAdminSession, hashPassword, comparePassword } =
  await import('./auth');

beforeEach(() => {
  cookieJar.clear();
});

describe('admin session cookie', () => {
  it('authenticates after a session is created', async () => {
    await createAdminSession('host@example.com');
    expect(await isAdminAuthenticated()).toBe(true);
  });

  it('rejects when no session cookie is set', async () => {
    expect(await isAdminAuthenticated()).toBe(false);
  });

  it('rejects after the session is cleared', async () => {
    await createAdminSession('host@example.com');
    await clearAdminSession();
    expect(await isAdminAuthenticated()).toBe(false);
  });

  it('rejects a forged cookie (unsigned payload with no valid signature)', async () => {
    const forgedPayload = Buffer.from(
      JSON.stringify({ email: 'host@example.com', timestamp: Date.now() })
    ).toString('base64url');
    cookieJar.set('fennec_admin_session', `${forgedPayload}.not-a-real-signature`);
    expect(await isAdminAuthenticated()).toBe(false);
  });

  it('rejects a cookie with a mismatched/tampered payload', async () => {
    await createAdminSession('host@example.com');
    const [, signature] = cookieJar.get('fennec_admin_session')!.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ email: 'attacker@example.com', timestamp: Date.now() })
    ).toString('base64url');
    cookieJar.set('fennec_admin_session', `${tamperedPayload}.${signature}`);
    expect(await isAdminAuthenticated()).toBe(false);
  });

  it('rejects an expired session', async () => {
    await createAdminSession('host@example.com');
    const raw = cookieJar.get('fennec_admin_session')!;
    // Re-run the same signing logic isn't exposed, so instead we roll the clock forward
    // past the 7-day maxAge and confirm the timestamp check itself does the rejecting.
    const [payload] = raw.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    expect(decoded.timestamp).toBeLessThanOrEqual(Date.now());

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 1000 * 60 * 60 * 24 * 8); // +8 days
    expect(await isAdminAuthenticated()).toBe(false);
    vi.useRealTimers();
  });
});

describe('password hashing', () => {
  it('verifies a matching password and rejects a wrong one', async () => {
    const hash = await hashPassword('correct-password');
    expect(await comparePassword('correct-password', hash)).toBe(true);
    expect(await comparePassword('wrong-password', hash)).toBe(false);
  });
});
