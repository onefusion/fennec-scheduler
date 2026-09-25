CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_name` text NOT NULL,
	`visitor_email` text NOT NULL,
	`topic_notes` text,
	`start_time_utc` text NOT NULL,
	`end_time_utc` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`cancel_token` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `date_overrides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`is_blocked` integer DEFAULT false NOT NULL,
	`start_time` text,
	`end_time` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`host_name` text DEFAULT 'Friendly Fennec' NOT NULL,
	`host_email` text DEFAULT 'fennec@example.com' NOT NULL,
	`password_hash` text,
	`timezone` text DEFAULT 'America/Chicago' NOT NULL,
	`slot_duration_minutes` integer DEFAULT 30 NOT NULL,
	`buffer_minutes` integer DEFAULT 0 NOT NULL,
	`min_advance_notice_hours` integer DEFAULT 2 NOT NULL,
	`max_future_booking_days` integer DEFAULT 30 NOT NULL,
	`require_host_approval` integer DEFAULT false NOT NULL,
	`primary_theme_color` text DEFAULT '#E07A5F' NOT NULL,
	`accent_theme_color` text DEFAULT '#F59E0B' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weekly_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_of_week` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
