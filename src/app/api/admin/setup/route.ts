import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { settings, weeklySchedules } from '@/schema';
import { hashPassword, createAdminSession } from '@/lib/auth';

// POST /api/admin/setup - Initial onboarding wizard setup
export async function POST(request: Request) {
  try {
    const db = await getDb();
    const existingSettings = await db.select().from(settings).limit(1);

    // If password is already set, setup wizard is locked
    if (existingSettings.length > 0 && existingSettings[0].passwordHash) {
      return NextResponse.json({ error: 'System is already initialized. Please log in.' }, { status: 400 });
    }

    const body: any = await request.json();
    const { hostName, hostEmail, password, timezone } = body;

    if (!hostName || !hostEmail || !password) {
      return NextResponse.json({ error: 'Missing required onboarding fields' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    if (existingSettings.length > 0) {
      // Update existing placeholder settings row
      await db.update(settings).set({
        hostName,
        hostEmail,
        passwordHash,
        timezone: timezone || 'America/Chicago',
      });
    } else {
      // Insert initial settings row
      await db.insert(settings).values({
        hostName,
        hostEmail,
        passwordHash,
        timezone: timezone || 'America/Chicago',
        slotDurationMinutes: 30,
        bufferMinutes: 30,
        minAdvanceNoticeHours: 2,
        maxFutureBookingDays: 30,
        requireHostApproval: false,
        primaryThemeColor: '#E07A5F',
        accentThemeColor: '#F59E0B',
      });
    }

    // Populate default Mon-Fri weekly schedule if empty
    const existingSchedules = await db.select().from(weeklySchedules);
    if (existingSchedules.length === 0) {
      for (const day of [1, 2, 3, 4, 5]) {
        await db.insert(weeklySchedules).values({
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
        });
      }
    }

    // Auto log in after setup
    await createAdminSession(hostEmail);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Setup error:', err);
    return NextResponse.json({ error: err.message || 'Setup failed' }, { status: 500 });
  }
}
