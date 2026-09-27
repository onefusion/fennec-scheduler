import { describe, it, expect } from 'vitest';
import { getAvailableSlots } from './availability';
import type { Setting, WeeklySchedule, DateOverride, Booking } from '@/schema';

function makeSetting(overrides: Partial<Setting> = {}): Setting {
  return {
    id: 1,
    hostName: 'Friendly Fennec',
    hostEmail: 'fennec@example.com',
    passwordHash: null,
    timezone: 'UTC',
    slotDurationMinutes: 30,
    bufferMinutes: 0,
    minAdvanceNoticeHours: 0,
    maxFutureBookingDays: 365,
    requireHostApproval: false,
    primaryThemeColor: '#E07A5F',
    accentThemeColor: '#F59E0B',
    ...overrides,
  };
}

const mondaySchedule: WeeklySchedule[] = [
  { id: 1, dayOfWeek: 1, startTime: '09:00', endTime: '10:00', isActive: true },
];

function makeOverride(overrides: Partial<DateOverride> = {}): DateOverride {
  return {
    id: 1,
    date: '',
    isBlocked: true,
    startTime: null,
    endTime: null,
    recurrence: 'none',
    ...overrides,
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'b1',
    visitorName: 'Visitor',
    visitorEmail: 'visitor@example.com',
    topicNotes: null,
    startTimeUtc: '',
    endTimeUtc: '',
    status: 'confirmed',
    cancelToken: 'tok',
    createdAt: new Date().toISOString(),
    reminderSentAt: null,
    ...overrides,
  };
}

// 2026-09-28 is a Monday
const MONDAY = '2026-09-28';

describe('getAvailableSlots', () => {
  it('generates 30-min slots covering the full scheduled window', () => {
    const slots = getAvailableSlots(MONDAY, 'UTC', makeSetting(), mondaySchedule, [], []);
    expect(slots.map((s) => s.startTimeFormatted)).toEqual(['9:00 AM', '9:30 AM']);
    expect(slots[0].endTimeFormatted).toBe('9:30 AM');
  });

  it('returns nothing for a day with no active weekly schedule and no override', () => {
    // 2026-09-29 is a Tuesday, not in mondaySchedule
    const slots = getAvailableSlots('2026-09-29', 'UTC', makeSetting(), mondaySchedule, [], []);
    expect(slots).toEqual([]);
  });

  it('returns nothing when the date is blocked by an override', () => {
    const overrides = [makeOverride({ date: MONDAY, isBlocked: true })];
    const slots = getAvailableSlots(MONDAY, 'UTC', makeSetting(), mondaySchedule, overrides, []);
    expect(slots).toEqual([]);
  });

  it('blocks every date sharing the same day-of-week when recurrence is weekly', () => {
    // Anchor override is a Monday (2026-09-28); a different, later Monday should also be blocked.
    const overrides = [makeOverride({ date: MONDAY, isBlocked: true, recurrence: 'weekly' })];
    const laterMonday = '2026-10-19';
    const slots = getAvailableSlots(laterMonday, 'UTC', makeSetting(), mondaySchedule, overrides, []);
    expect(slots).toEqual([]);
  });

  it('does not block a different day-of-week when recurrence is weekly', () => {
    const overrides = [makeOverride({ date: MONDAY, isBlocked: true, recurrence: 'weekly' })];
    // Tuesday has no active weekly schedule of its own, so use an override to open it,
    // then confirm the Monday-recurring blackout doesn't also block this Tuesday.
    const tuesdayOpen = [
      ...overrides,
      makeOverride({ id: 2, date: '2026-09-29', isBlocked: false, startTime: '09:00', endTime: '10:00' }),
    ];
    const slots = getAvailableSlots('2026-09-29', 'UTC', makeSetting(), mondaySchedule, tuesdayOpen, []);
    expect(slots.length).toBeGreaterThan(0);
  });

  it('blocks every date sharing the same month/day when recurrence is yearly', () => {
    const overrides = [makeOverride({ date: '2026-12-25', isBlocked: true, recurrence: 'yearly' })];
    // 2028-12-25 is a Monday, matching mondaySchedule's active day, but a different year.
    const slots = getAvailableSlots('2028-12-25', 'UTC', makeSetting(), mondaySchedule, overrides, []);
    expect(slots).toEqual([]);
  });

  it('excludes slots that overlap an existing confirmed or pending booking', () => {
    const existing = [
      makeBooking({ startTimeUtc: '2026-09-28T09:00:00.000Z', endTimeUtc: '2026-09-28T09:30:00.000Z', status: 'confirmed' }),
    ];
    const slots = getAvailableSlots(MONDAY, 'UTC', makeSetting(), mondaySchedule, [], existing);
    expect(slots.map((s) => s.startTimeFormatted)).toEqual(['9:30 AM']);
  });

  it('does not exclude a slot overlapping a cancelled or denied booking', () => {
    const existing = [
      makeBooking({ startTimeUtc: '2026-09-28T09:00:00.000Z', endTimeUtc: '2026-09-28T09:30:00.000Z', status: 'cancelled' }),
    ];
    const slots = getAvailableSlots(MONDAY, 'UTC', makeSetting(), mondaySchedule, [], existing);
    expect(slots.map((s) => s.startTimeFormatted)).toEqual(['9:00 AM', '9:30 AM']);
  });

  it('adds buffer minutes after each slot, shrinking the number of slots offered', () => {
    const slots = getAvailableSlots(
      MONDAY,
      'UTC',
      makeSetting({ bufferMinutes: 30 }),
      mondaySchedule,
      [],
      []
    );
    // 09:00-09:30 slot, then a 30min buffer pushes past the 10:00 window end
    expect(slots.map((s) => s.startTimeFormatted)).toEqual(['9:00 AM']);
  });

  it('hides slots that fall inside the minimum advance notice window', () => {
    const setting = makeSetting({ minAdvanceNoticeHours: 100000 }); // effectively "never"
    const slots = getAvailableSlots(MONDAY, 'UTC', setting, mondaySchedule, [], []);
    expect(slots).toEqual([]);
  });

  it('lets a date-specific override open hours on an otherwise-inactive day', () => {
    const overrides = [makeOverride({ date: '2026-09-29', isBlocked: false, startTime: '13:00', endTime: '13:30' })];
    const slots = getAvailableSlots('2026-09-29', 'UTC', makeSetting(), mondaySchedule, overrides, []);
    expect(slots.map((s) => s.startTimeFormatted)).toEqual(['1:00 PM']);
  });

  it('converts slot times into the visitor timezone', () => {
    // Host is UTC, visitor is UTC-5 (America/Chicago is UTC-5 in Sept, DST)
    const slots = getAvailableSlots(MONDAY, 'America/Chicago', makeSetting(), mondaySchedule, [], []);
    expect(slots.map((s) => s.startTimeFormatted)).toEqual(['4:00 AM', '4:30 AM']);
  });
});
