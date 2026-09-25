import { addMinutes, addDays, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import { Setting, WeeklySchedule, DateOverride, Booking } from '@/schema';

export interface TimeSlot {
  startTimeUtc: string; // ISO string
  endTimeUtc: string; // ISO string
  startTimeFormatted: string; // e.g. "9:00 AM" in visitor timezone
  endTimeFormatted: string; // e.g. "9:30 AM" in visitor timezone
  dateStrVisitor: string; // YYYY-MM-DD in visitor timezone
}

/**
 * Generate available 30-minute time slots for a specified target date in visitor timezone.
 */
export function getAvailableSlots(
  targetDateStr: string, // YYYY-MM-DD in visitor timezone
  visitorTimezone: string,
  setting: Setting,
  weeklySchedules: WeeklySchedule[],
  dateOverrides: DateOverride[],
  existingBookings: Booking[]
): TimeSlot[] {
  const hostTz = setting.timezone || 'America/Chicago';
  const slotMinutes = setting.slotDurationMinutes || 30;
  const bufferMinutes = setting.bufferMinutes || 0;
  const minNoticeHours = setting.minAdvanceNoticeHours ?? 2;
  const maxFutureDays = setting.maxFutureBookingDays ?? 30;

  const nowUtc = new Date();
  const earliestAllowedUtc = addMinutes(nowUtc, minNoticeHours * 60);
  const maxAllowedUtc = addDays(startOfDay(nowUtc), maxFutureDays + 1);

  // Active bookings (confirmed or pending) to exclude
  const activeBookings = existingBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  // We parse the target date window in visitor timezone
  const startOfDayVisitor = toDate(`${targetDateStr}T00:00:00`, { timeZone: visitorTimezone });

  // Map to host timezone date string(s) covered by this day
  const hostDateStr = formatInTimeZone(startOfDayVisitor, hostTz, 'yyyy-MM-dd');

  // Check if date is blocked by override
  const override = dateOverrides.find((o) => o.date === hostDateStr);
  if (override && override.isBlocked) {
    return [];
  }

  // Get day of week in host timezone
  const dayOfWeek = parseInt(formatInTimeZone(startOfDayVisitor, hostTz, 'i'), 10) % 7; // 0=Sun..6=Sat
  const scheduleForDay = weeklySchedules.find((s) => s.dayOfWeek === dayOfWeek && s.isActive);

  let startHourStr = scheduleForDay?.startTime || '09:00';
  let endHourStr = scheduleForDay?.endTime || '17:00';

  if (override && override.startTime && override.endTime) {
    startHourStr = override.startTime;
    endHourStr = override.endTime;
  }

  if (!scheduleForDay && !override) {
    return [];
  }

  // Build candidate start and end dates in host timezone
  const hostStartUtc = toDate(`${hostDateStr}T${startHourStr}:00`, { timeZone: hostTz });
  const hostEndUtc = toDate(`${hostDateStr}T${endHourStr}:00`, { timeZone: hostTz });

  const slots: TimeSlot[] = [];
  let currentSlotStart = hostStartUtc;

  while (isBefore(currentSlotStart, hostEndUtc)) {
    const currentSlotEnd = addMinutes(currentSlotStart, slotMinutes);
    if (isAfter(currentSlotEnd, hostEndUtc)) {
      break;
    }

    const slotStartIso = currentSlotStart.toISOString();
    const slotEndIso = currentSlotEnd.toISOString();

    // Check minimum advance notice
    if (isBefore(currentSlotStart, earliestAllowedUtc)) {
      currentSlotStart = addMinutes(currentSlotEnd, bufferMinutes);
      continue;
    }

    // Check max future horizon
    if (isAfter(currentSlotStart, maxAllowedUtc)) {
      break;
    }

    // Check for overlap with existing bookings
    const hasOverlap = activeBookings.some((b) => {
      const bStart = parseISO(b.startTimeUtc);
      const bEnd = parseISO(b.endTimeUtc);
      // Overlap if slotStart < bEnd AND slotEnd > bStart
      return isBefore(currentSlotStart, bEnd) && isAfter(currentSlotEnd, bStart);
    });

    if (!hasOverlap) {
      // Check if this slot falls on the visitor's selected date in their timezone
      const dateInVisitorTz = formatInTimeZone(currentSlotStart, visitorTimezone, 'yyyy-MM-dd');
      if (dateInVisitorTz === targetDateStr) {
        slots.push({
          startTimeUtc: slotStartIso,
          endTimeUtc: slotEndIso,
          startTimeFormatted: formatInTimeZone(currentSlotStart, visitorTimezone, 'h:mm a'),
          endTimeFormatted: formatInTimeZone(currentSlotEnd, visitorTimezone, 'h:mm a'),
          dateStrVisitor: dateInVisitorTz,
        });
      }
    }

    currentSlotStart = addMinutes(currentSlotEnd, bufferMinutes);
  }

  return slots;
}
