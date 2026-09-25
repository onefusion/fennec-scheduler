import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { bookings, settings } from '@/schema';
import { eq } from 'drizzle-orm';
import { isAdminAuthenticated } from '@/lib/auth';
import { sendBookingEmailNotification } from '@/lib/email';

export const runtime = 'edge';

// POST /api/admin/bookings/[id]/approve (action: 'confirm' | 'deny')
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bookingId = params.id;
  const body: any = await request.json();
  const { action } = body; // 'confirm' | 'deny'

  if (!action || (action !== 'confirm' && action !== 'deny')) {
    return NextResponse.json({ error: 'Invalid action. Must be confirm or deny.' }, { status: 400 });
  }

  const db = getDb();
  const bookingList = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const targetBooking = bookingList[0];

  if (!targetBooking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const newStatus = action === 'confirm' ? 'confirmed' : 'denied';
  await db.update(bookings).set({ status: newStatus }).where(eq(bookings.id, bookingId));

  const updatedBooking = { ...targetBooking, status: newStatus };
  const hostSettings = (await db.select().from(settings).limit(1))[0] || {
    hostName: 'Friendly Fennec',
    hostEmail: 'fennec@example.com',
  };

  const siteUrl = new URL(request.url).origin;
  await sendBookingEmailNotification({
    booking: updatedBooking,
    hostName: hostSettings.hostName,
    hostEmail: hostSettings.hostEmail,
    type: action === 'confirm' ? 'host_confirmed' : 'host_denied',
    siteUrl,
  });

  return NextResponse.json({ success: true, booking: updatedBooking });
}
