import { Booking } from '@/schema';
import { parseISO } from 'date-fns';

/**
 * Generate standard RFC 5545 .ics string for a single booking event.
 */
export function generateIcsForBooking(
  booking: Booking,
  hostName: string,
  hostEmail: string
): string {
  const start = parseISO(booking.startTimeUtc);
  const end = parseISO(booking.endTimeUtc);

  const formatDateToIcs = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const nowStr = formatDateToIcs(new Date());
  const startStr = formatDateToIcs(start);
  const endStr = formatDateToIcs(end);

  const title = `Meeting: ${booking.visitorName} & ${hostName}`;
  const description = `Scheduled via Fennec Scheduler\\n\\nVisitor: ${booking.visitorName} (${booking.visitorEmail})\\nTopic: ${booking.topicNotes || 'N/A'}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Friendly Fennec//Fennec Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:fennec-booking-${booking.id}@fennecscheduler`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `ORGANIZER;CN="${hostName}":mailto:${hostEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${booking.visitorName}":mailto:${booking.visitorEmail}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
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
    .map((b) => {
      const start = parseISO(b.startTimeUtc);
      const end = parseISO(b.endTimeUtc);
      const formatDateToIcs = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      return [
        'BEGIN:VEVENT',
        `UID:fennec-booking-${b.id}@fennecscheduler`,
        `DTSTAMP:${formatDateToIcs(new Date())}`,
        `DTSTART:${formatDateToIcs(start)}`,
        `DTEND:${formatDateToIcs(end)}`,
        `SUMMARY:Meeting with ${b.visitorName}`,
        `DESCRIPTION:Visitor: ${b.visitorName} (${b.visitorEmail})\\nNotes: ${b.topicNotes || 'None'}`,
        `ORGANIZER;CN="${hostName}":mailto:${hostEmail}`,
        `STATUS:${b.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`,
        'END:VEVENT',
      ].join('\r\n');
    })
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
