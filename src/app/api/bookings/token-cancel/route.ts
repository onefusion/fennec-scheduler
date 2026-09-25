import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { bookings, settings } from '@/schema';
import { eq } from 'drizzle-orm';
import { sendBookingEmailNotification } from '@/lib/email';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body: any = await request.json();
    const { cancelToken } = body;
    if (!cancelToken) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const db = getDb();
    const matches = await db.select().from(bookings).where(eq(bookings.cancelToken, cancelToken)).limit(1);
    const targetBooking = matches[0];

    if (!targetBooking) {
      return NextResponse.json({ error: 'Booking token invalid or not found' }, { status: 404 });
    }

    await db.update(bookings).set({ status: 'cancelled' }).where(eq(bookings.id, targetBooking.id));

    const hostSettings = (await db.select().from(settings).limit(1))[0] || {
      hostName: 'Friendly Fennec',
      hostEmail: 'fennec@example.com',
    };

    const siteUrl = new URL(request.url).origin;
    await sendBookingEmailNotification({
      booking: { ...targetBooking, status: 'cancelled' },
      hostName: hostSettings.hostName,
      hostEmail: hostSettings.hostEmail,
      type: 'cancelled',
      siteUrl,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
