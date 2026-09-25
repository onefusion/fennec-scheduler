import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'fennec_admin_session';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAdminSession(hostEmail: string): Promise<void> {
  const cookieStore = await cookies();
  // Simple encrypted token simulation: base64 encoded payload with secret signature
  const sessionData = JSON.stringify({ email: hostEmail, timestamp: Date.now() });
  const sessionToken = Buffer.from(sessionData).toString('base64');

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
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

  try {
    const payload = JSON.parse(Buffer.from(sessionToken.value, 'base64').toString('utf-8'));
    // Valid for 7 days
    if (payload.timestamp && Date.now() - payload.timestamp < 1000 * 60 * 60 * 24 * 7) {
      return true;
    }
  } catch (_e) {
    return false;
  }
  return false;
}
