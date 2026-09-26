import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { settings, weeklySchedules, dateOverrides, bookings } from '../../../../drizzle/schema';
import { getAvailableSlots } from '@/lib/availability';
import { sendBookingEmailNotification } from '@/lib/email';

// GET /api/bookings?date=YYYY-MM-DD&tz=VisitorTimezone
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  const visitorTz = searchParams.get('tz') || 'America/Chicago';

  const db = await getDb();

  try {
    // 1. Fetch settings
    let hostSettings = (await db.select().from(settings).limit(1))[0];
    if (!hostSettings) {
      // Default initial settings
      hostSettings = {
        id: 1,
        hostName: 'Friendly Fennec',
        hostEmail: 'fennec@example.com',
        passwordHash: null,
        timezone: 'America/Chicago',
        slotDurationMinutes: 30,
        bufferMinutes: 0,
        minAdvanceNoticeHours: 2,
        maxFutureBookingDays: 30,
        requireHostApproval: false,
        primaryThemeColor: '#E07A5F',
        accentThemeColor: '#F59E0B',
      };
    }

    // 2. Fetch weekly schedules, overrides, and bookings
    const schedulesList = await db.select().from(weeklySchedules);
    const overridesList = await db.select().from(dateOverrides);
    const bookingsList = await db.select().from(bookings);

    if (dateStr === 'all') {
      return NextResponse.json({ bookings: bookingsList });
    }

    if (!dateStr) {
      return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
    }

    // Default schedules if empty (Mon-Fri 09:00 - 17:00)
    let activeSchedules = schedulesList;
    if (activeSchedules.length === 0) {
      activeSchedules = [1, 2, 3, 4, 5].map((day) => ({
        id: day,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      }));
    }

    // 3. Compute available 30-min slots
    const slots = getAvailableSlots(
      dateStr,
      visitorTz,
      hostSettings,
      activeSchedules,
      overridesList,
      bookingsList
    );

    return NextResponse.json({
      hostName: hostSettings.hostName,
      timezone: hostSettings.timezone,
      requireHostApproval: hostSettings.requireHostApproval,
      primaryColor: hostSettings.primaryThemeColor,
      accentColor: hostSettings.accentThemeColor,
      slots,
    });
  } catch (err: any) {
    console.error('Error fetching slots:', err);
    return NextResponse.json({ error: 'Failed to compute availability slots' }, { status: 500 });
  }
}

// POST /api/bookings - Visitor submits new booking request
export async function POST(request: Request) {
  try {
    const body: any = await request.json();
    const { startTimeUtc, endTimeUtc, visitorName, visitorEmail, topicNotes } = body;

    if (!startTimeUtc || !endTimeUtc || !visitorName || !visitorEmail) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    const db = await getDb();
    const hostSettings = (await db.select().from(settings).limit(1))[0] || {
      hostName: 'Friendly Fennec',
      hostEmail: 'fennec@example.com',
      requireHostApproval: false,
    };

    const status = hostSettings.requireHostApproval ? 'pending' : 'confirmed';
    const bookingId = crypto.randomUUID();
    const cancelToken = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Insert booking into D1
    const newBooking = {
      id: bookingId,
      visitorName,
      visitorEmail,
      topicNotes: topicNotes || '',
      startTimeUtc,
      endTimeUtc,
      status,
      cancelToken,
      createdAt,
    };

    await db.insert(bookings).values(newBooking);

    // Send email notification in background
    const siteUrl = new URL(request.url).origin;
    await sendBookingEmailNotification({
      booking: newBooking,
      hostName: hostSettings.hostName,
      hostEmail: hostSettings.hostEmail,
      type: status === 'confirmed' ? 'created_confirmed' : 'created_pending',
      siteUrl,
    });

    return NextResponse.json({
      success: true,
      booking: newBooking,
    });
  } catch (err: any) {
    console.error('Error creating booking:', err);
    if (err?.message?.includes('UNIQUE') || err?.message?.includes('unique')) {
      return NextResponse.json(
        { error: 'This time slot was just claimed by someone else. Please select another slot.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message || 'Failed to create booking' }, { status: 500 });
  }
}
