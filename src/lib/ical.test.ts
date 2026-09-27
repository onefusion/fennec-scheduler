import { describe, it, expect } from 'vitest';
import { generateIcsForBooking, generateIcalFeed } from './ical';
import type { Booking } from '@/schema';

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'abc-123',
    visitorName: 'Jane Visitor',
    visitorEmail: 'jane@example.com',
    topicNotes: 'Discuss roadmap',
    startTimeUtc: '2026-10-01T14:00:00.000Z',
    endTimeUtc: '2026-10-01T14:30:00.000Z',
    status: 'confirmed',
    cancelToken: 'tok-abc',
    createdAt: new Date().toISOString(),
    ...overrides,
  } as Booking;
}

describe('generateIcsForBooking', () => {
  it('produces a valid VCALENDAR/VEVENT wrapper with correct UTC timestamps', () => {
    const ics = generateIcsForBooking(makeBooking(), 'Friendly Fennec', 'fennec@example.com');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART:20261001T140000Z');
    expect(ics).toContain('DTEND:20261001T143000Z');
    expect(ics).toContain('UID:fennec-booking-abc-123@fennecscheduler');
  });

  it('includes organizer and attendee lines when a host email is given', () => {
    const ics = generateIcsForBooking(makeBooking(), 'Friendly Fennec', 'fennec@example.com');
    expect(ics).toContain('ORGANIZER;CN="Friendly Fennec":mailto:fennec@example.com');
    expect(ics).toContain('ATTENDEE');
    expect(ics).toContain('mailto:jane@example.com');
  });

  it('marks a pending booking as TENTATIVE and a confirmed one as CONFIRMED', () => {
    const pending = generateIcsForBooking(makeBooking({ status: 'pending' }), 'Host', 'h@e.com');
    const confirmed = generateIcsForBooking(makeBooking({ status: 'confirmed' }), 'Host', 'h@e.com');
    expect(pending).toContain('STATUS:TENTATIVE');
    expect(confirmed).toContain('STATUS:CONFIRMED');
  });
});

describe('generateIcalFeed', () => {
  it('includes confirmed and pending bookings but excludes cancelled/denied ones', () => {
    const bookings = [
      makeBooking({ id: 'b-confirmed', status: 'confirmed' }),
      makeBooking({ id: 'b-pending', status: 'pending' }),
      makeBooking({ id: 'b-cancelled', status: 'cancelled' }),
      makeBooking({ id: 'b-denied', status: 'denied' }),
    ];
    const feed = generateIcalFeed(bookings, 'Friendly Fennec', 'fennec@example.com');
    expect(feed).toContain('fennec-booking-b-confirmed');
    expect(feed).toContain('fennec-booking-b-pending');
    expect(feed).not.toContain('fennec-booking-b-cancelled');
    expect(feed).not.toContain('fennec-booking-b-denied');
  });

  it('wraps the feed in a single VCALENDAR with a feed name', () => {
    const feed = generateIcalFeed([makeBooking()], 'Friendly Fennec', 'fennec@example.com');
    expect(feed).toContain('X-WR-CALNAME:Fennec Scheduler Bookings');
    expect(feed.match(/BEGIN:VCALENDAR/g)?.length).toBe(1);
  });
});
