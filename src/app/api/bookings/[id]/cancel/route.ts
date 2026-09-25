import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { bookings, settings } from '@/schema';
import { eq } from 'drizzle-orm';
import { sendBookingEmailNotification } from '@/lib/email';
import { isAdminAuthenticated } from '@/lib/auth';

export const runtime = 'edge';

// POST /api/bookings/[id]/cancel (with cancelToken or admin session)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const bookingId = params.id;
  const body: any = await request.json().catch(() => ({}));
  const { cancelToken } = body;

  const db = getDb();
  const bookingList = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const targetBooking = bookingList[0];

  if (!targetBooking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const isAuth = await isAdminAuthenticated();
  if (!isAuth && targetBooking.cancelToken !== cancelToken) {
    return NextResponse.json({ error: 'Unauthorized cancellation request' }, { status: 403 });
  }

  await db.update(bookings).set({ status: 'cancelled' }).where(eq(bookings.id, bookingId));

  const updatedBooking = { ...targetBooking, status: 'cancelled' };
  const hostSettings = (await db.select().from(settings).limit(1))[0] || {
    hostName: 'Friendly Fennec',
    hostEmail: 'fennec@example.com',
  };

  const siteUrl = new URL(request.url).origin;
  await sendBookingEmailNotification({
    booking: updatedBooking,
    hostName: hostSettings.hostName,
    hostEmail: hostSettings.hostEmail,
    type: 'cancelled',
    siteUrl,
  });

  return NextResponse.json({ success: true, booking: updatedBooking });
}
