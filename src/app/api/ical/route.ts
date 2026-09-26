import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { bookings, settings } from '@/schema';
import { generateIcalFeed } from '@/lib/ical';

// GET /api/ical - Serves standard RFC 5545 webcal feed
export async function GET() {
  const db = await getDb();

  try {
    const hostSettings = (await db.select().from(settings).limit(1))[0] || {
      hostName: 'Friendly Fennec',
      hostEmail: 'fennec@example.com',
    };

    const allBookings = await db.select().from(bookings);
    const icalFeed = generateIcalFeed(allBookings, hostSettings.hostName, hostSettings.hostEmail);

    return new NextResponse(icalFeed, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="fennec-scheduler-feed.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Error generating iCal feed:', err);
    return new NextResponse('Error generating iCal feed', { status: 500 });
  }
}
