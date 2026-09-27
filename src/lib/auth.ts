import bcrypt from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'fennec_admin_session';
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET env var is required in production');
  }
  return 'dev-only-insecure-session-secret';
}

function sign(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAdminSession(hostEmail: string): Promise<void> {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify({ email: hostEmail, timestamp: Date.now() })).toString(
    'base64url'
  );
  const sessionToken = `${payload}.${sign(payload)}`;

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_MS / 1000,
    path: '/',
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionToken || !sessionToken.value) {
    return false;
  }

  const [payload, signature] = sessionToken.value.split('.');
  if (!payload || !signature) {
    return false;
  }

  try {
    const expectedSignature = sign(payload);
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return false;
    }

    const sessionData = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return Boolean(sessionData.timestamp && Date.now() - sessionData.timestamp < SESSION_MAX_AGE_MS);
  } catch (_e) {
    return false;
  }
}
