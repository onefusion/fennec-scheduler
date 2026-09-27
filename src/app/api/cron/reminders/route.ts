import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { bookings, settings } from '@/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { sendBookingEmailNotification } from '@/lib/email';

const REMINDER_WINDOW_START_HOURS = 23;
const REMINDER_WINDOW_END_HOURS = 25;

// POST /api/cron/reminders - Sends 24h-before reminder emails for confirmed bookings.
// Intended to be called on a schedule (e.g. every 15-30 min) by an external
// scheduler, authenticated with a shared CRON_SECRET header.
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
  }
  if (request.headers.get('x-cron-secret') !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const hostSettings = (await db.select().from(settings).limit(1))[0] || {
    hostName: 'Friendly Fennec',
    hostEmail: 'fennec@example.com',
  };

  const now = Date.now();
  const windowStart = new Date(now + REMINDER_WINDOW_START_HOURS * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now + REMINDER_WINDOW_END_HOURS * 60 * 60 * 1000).toISOString();

  const dueBookings = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.status, 'confirmed'), isNull(bookings.reminderSentAt)));

  const upcoming = dueBookings.filter(
    (b) => b.startTimeUtc >= windowStart && b.startTimeUtc < windowEnd
  );

  const siteUrl = new URL(request.url).origin;
  let sent = 0;
  for (const booking of upcoming) {
    await sendBookingEmailNotification({
      booking,
      hostName: hostSettings.hostName,
      hostEmail: hostSettings.hostEmail,
      type: 'reminder_24h',
      siteUrl,
    });
    await db
      .update(bookings)
      .set({ reminderSentAt: new Date().toISOString() })
      .where(eq(bookings.id, booking.id));
    sent += 1;
  }

  return NextResponse.json({ success: true, sent });
}
