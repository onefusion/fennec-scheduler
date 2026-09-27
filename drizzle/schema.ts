import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Application & Host Configuration
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hostName: text('host_name').notNull().default('Friendly Fennec'),
  hostEmail: text('host_email').notNull().default('fennec@example.com'),
  passwordHash: text('password_hash'), // Nullable initially until first-run setup wizard completes
  timezone: text('timezone').notNull().default('America/Chicago'),
  slotDurationMinutes: integer('slot_duration_minutes').notNull().default(30),
  bufferMinutes: integer('buffer_minutes').notNull().default(0),
  minAdvanceNoticeHours: integer('min_advance_notice_hours').notNull().default(2),
  maxFutureBookingDays: integer('max_future_booking_days').notNull().default(30),
  requireHostApproval: integer('require_host_approval', { mode: 'boolean' }).notNull().default(false),
  primaryThemeColor: text('primary_theme_color').notNull().default('#E07A5F'),
  accentThemeColor: text('accent_theme_color').notNull().default('#F59E0B'),
});

// Weekly Recurring Availability (Day 0 = Sun, 1 = Mon, ..., 6 = Sat)
export const weeklySchedules = sqliteTable('weekly_schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dayOfWeek: integer('day_of_week').notNull(), // 0 to 6
  startTime: text('start_time').notNull(), // HH:mm e.g. "09:00"
  endTime: text('end_time').notNull(), // HH:mm e.g. "17:00"
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

// Date Specific Overrides (Extra available hours or blocked dates)
export const dateOverrides = sqliteTable('date_overrides', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // YYYY-MM-DD
  isBlocked: integer('is_blocked', { mode: 'boolean' }).notNull().default(false),
  startTime: text('start_time'), // optional HH:mm override
  endTime: text('end_time'), // optional HH:mm override
});

// Confirmed or Pending Meeting Bookings
export const bookings = sqliteTable(
  'bookings',
  {
    id: text('id').primaryKey(), // UUID v4
    visitorName: text('visitor_name').notNull(),
    visitorEmail: text('visitor_email').notNull(),
    topicNotes: text('topic_notes'),
    startTimeUtc: text('start_time_utc').notNull(), // ISO string in UTC
    endTimeUtc: text('end_time_utc').notNull(), // ISO string in UTC
    status: text('status').notNull().default('confirmed'), // 'pending' | 'confirmed' | 'denied' | 'cancelled'
    cancelToken: text('cancel_token').notNull(), // UUID v4
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    // Only one active (pending/confirmed) booking may hold a given start time.
    activeSlotUnique: uniqueIndex('bookings_active_slot_unique')
      .on(table.startTimeUtc)
      .where(sql`${table.status} in ('confirmed', 'pending')`),
  })
);

export type Setting = typeof settings.$inferSelect;
export type WeeklySchedule = typeof weeklySchedules.$inferSelect;
export type DateOverride = typeof dateOverrides.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
