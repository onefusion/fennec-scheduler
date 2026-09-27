import { Booking } from '@/schema';
import { parseISO } from 'date-fns';

function formatDateToIcs(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function buildVEvent(booking: Booking, hostName: string, hostEmail?: string): string {
  const start = parseISO(booking.startTimeUtc);
  const end = parseISO(booking.endTimeUtc);
  const lines = [
    'BEGIN:VEVENT',
    `UID:fennec-booking-${booking.id}@fennecscheduler`,
    `DTSTAMP:${formatDateToIcs(new Date())}`,
    `DTSTART:${formatDateToIcs(start)}`,
    `DTEND:${formatDateToIcs(end)}`,
    `SUMMARY:Meeting with ${booking.visitorName}`,
    `DESCRIPTION:Visitor: ${booking.visitorName} (${booking.visitorEmail})\\nNotes: ${booking.topicNotes || 'N/A'}`,
  ];
  if (hostEmail) {
    lines.push(`ORGANIZER;CN="${hostName}":mailto:${hostEmail}`);
    lines.push(
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${booking.visitorName}":mailto:${booking.visitorEmail}`
    );
  }
  lines.push(`STATUS:${booking.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`);
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

/**
 * Generate standard RFC 5545 .ics string for a single booking event.
 */
export function generateIcsForBooking(
  booking: Booking,
  hostName: string,
  hostEmail: string
): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Friendly Fennec//Fennec Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    buildVEvent(booking, hostName, hostEmail),
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generate iCal feed string for all non-cancelled host bookings.
 */
export function generateIcalFeed(
  bookingsList: Booking[],
  hostName: string,
  hostEmail: string
): string {
  const events = bookingsList
    .filter((b) => b.status === 'confirmed' || b.status === 'pending')
    .map((b) => buildVEvent(b, hostName))
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Friendly Fennec//Fennec Scheduler Feed//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Fennec Scheduler Bookings',
    events,
    'END:VCALENDAR',
  ].join('\r\n');
}
