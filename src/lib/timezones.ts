import { formatInTimeZone, toDate } from 'date-fns-tz';
import { format, parseISO } from 'date-fns';

export const COMMON_TIMEZONES = [
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Anchorage', label: 'Alaska Time' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
  { value: 'Europe/London', label: 'London, Edinburgh, Dublin (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris, Berlin, Rome, Madrid (CET/CEST)' },
  { value: 'Europe/Athens', label: 'Athens, Istanbul, Helsinki (EET/EEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Osaka (JST)' },
  { value: 'Asia/Shanghai', label: 'Beijing, Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne (AEST/AEDT)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

/**
 * Convert a date object or ISO string into a display string in a specific target timezone.
 */
export function formatInTz(dateStrOrObj: string | Date, timeZone: string, formatStr: string = 'h:mm a'): string {
  const date = typeof dateStrOrObj === 'string' ? parseISO(dateStrOrObj) : dateStrOrObj;
  return formatInTimeZone(date, timeZone, formatStr);
}

/**
 * Get current ISO string in UTC.
 */
export function getCurrentUtcIso(): string {
  return new Date().toISOString();
}

/**
 * Combine YYYY-MM-DD date string and HH:mm time string in a specified timezone to a UTC Date object.
 */
export function createUtcDateFromLocal(dateStr: string, timeStr: string, timeZone: string): Date {
  // e.g. "2026-09-25 09:30" interpreted in host or visitor timezone
  const dateTimeStr = `${dateStr}T${timeStr}:00`;
  return toDate(dateTimeStr, { timeZone });
}
