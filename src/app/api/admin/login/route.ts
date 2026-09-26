import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { settings } from '@/schema';
import { comparePassword, createAdminSession } from '@/lib/auth';

// GET /api/admin/login - Check setup status
export async function GET() {
  const db = await getDb();
  const hostSettings = (await db.select().from(settings).limit(1))[0];
  const isInitialized = Boolean(hostSettings && hostSettings.passwordHash);

  return NextResponse.json({
    isInitialized,
    hostName: hostSettings?.hostName || 'Friendly Fennec',
  });
}

// POST /api/admin/login - Verify password & issue session cookie
export async function POST(request: Request) {
  try {
    const db = await getDb();
    const hostSettings = (await db.select().from(settings).limit(1))[0];

    if (!hostSettings || !hostSettings.passwordHash) {
      return NextResponse.json({ error: 'System not initialized. Please complete onboarding.' }, { status: 400 });
    }

    const body: any = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const isValid = await comparePassword(password, hostSettings.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    await createAdminSession(hostSettings.hostEmail);
    return NextResponse.json({ success: true });
  } catch (_err) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
