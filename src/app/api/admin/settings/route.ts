import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { settings } from '@/schema';
import { isAdminAuthenticated, hashPassword } from '@/lib/auth';

// GET /api/admin/settings
export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const hostSettings = (await db.select().from(settings).limit(1))[0] || {
    hostName: 'Friendly Fennec',
    hostEmail: 'fennec@example.com',
    timezone: 'America/Chicago',
    requireHostApproval: false,
    bufferMinutes: 30,
    minAdvanceNoticeHours: 2,
    maxFutureBookingDays: 30,
    primaryThemeColor: '#E07A5F',
    accentThemeColor: '#F59E0B',
  };

  // Exclude passwordHash from output
  const { passwordHash, ...safeSettings } = hostSettings as any;
  return NextResponse.json(safeSettings);
}

// POST /api/admin/settings
export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const body: any = await request.json();
  const {
    hostName,
    hostEmail,
    newPassword,
    timezone,
    requireHostApproval,
    bufferMinutes,
    minAdvanceNoticeHours,
    maxFutureBookingDays,
    primaryThemeColor,
    accentThemeColor,
  } = body;

  const updateFields: any = {};
  if (hostName) updateFields.hostName = hostName;
  if (hostEmail) updateFields.hostEmail = hostEmail;
  if (timezone) updateFields.timezone = timezone;
  if (typeof requireHostApproval === 'boolean') updateFields.requireHostApproval = requireHostApproval;
  if (typeof bufferMinutes === 'number') updateFields.bufferMinutes = bufferMinutes;
  if (typeof minAdvanceNoticeHours === 'number') updateFields.minAdvanceNoticeHours = minAdvanceNoticeHours;
  if (typeof maxFutureBookingDays === 'number') updateFields.maxFutureBookingDays = maxFutureBookingDays;
  if (primaryThemeColor) updateFields.primaryThemeColor = primaryThemeColor;
  if (accentThemeColor) updateFields.accentThemeColor = accentThemeColor;

  if (newPassword) {
    updateFields.passwordHash = await hashPassword(newPassword);
  }

  const current = (await db.select().from(settings).limit(1))[0];
  if (current) {
    await db.update(settings).set(updateFields);
  } else {
    await db.insert(settings).values({
      hostName: hostName || 'Friendly Fennec',
      hostEmail: hostEmail || 'fennec@example.com',
      passwordHash: updateFields.passwordHash || null,
      timezone: timezone || 'America/Chicago',
      requireHostApproval: requireHostApproval ?? false,
      primaryThemeColor: primaryThemeColor || '#E07A5F',
      accentThemeColor: accentThemeColor || '#F59E0B',
    });
  }

  return NextResponse.json({ success: true });
}
