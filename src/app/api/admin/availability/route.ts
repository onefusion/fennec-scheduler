import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { weeklySchedules, dateOverrides } from '@/schema';
import { eq } from 'drizzle-orm';
import { isAdminAuthenticated } from '@/lib/auth';

export const runtime = 'edge';

// GET /api/admin/availability - Fetch weekly schedule and date overrides
export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const schedules = await db.select().from(weeklySchedules);
  const overrides = await db.select().from(dateOverrides);

  return NextResponse.json({ schedules, overrides });
}

// POST /api/admin/availability - Save weekly schedules or add/remove overrides
export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body: any = await request.json();
  const { schedules, override } = body;

  if (schedules && Array.isArray(schedules)) {
    // Delete old schedules and replace with updated ones
    await db.delete(weeklySchedules);
    for (const s of schedules) {
      await db.insert(weeklySchedules).values({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: s.isActive,
      });
    }
  }

  if (override) {
    if (override.action === 'delete') {
      await db.delete(dateOverrides).where(eq(dateOverrides.id, override.id));
    } else {
      await db.insert(dateOverrides).values({
        date: override.date,
        isBlocked: override.isBlocked ?? true,
        startTime: override.startTime || null,
        endTime: override.endTime || null,
      });
    }
  }

  return NextResponse.json({ success: true });
}
