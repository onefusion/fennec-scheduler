PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`host_name` text DEFAULT 'Friendly Fennec' NOT NULL,
	`host_email` text DEFAULT 'fennec@example.com' NOT NULL,
	`password_hash` text,
	`timezone` text DEFAULT 'America/Chicago' NOT NULL,
	`slot_duration_minutes` integer DEFAULT 30 NOT NULL,
	`buffer_minutes` integer DEFAULT 30 NOT NULL,
	`min_advance_notice_hours` integer DEFAULT 2 NOT NULL,
	`max_future_booking_days` integer DEFAULT 30 NOT NULL,
	`require_host_approval` integer DEFAULT false NOT NULL,
	`primary_theme_color` text DEFAULT '#E07A5F' NOT NULL,
	`accent_theme_color` text DEFAULT '#F59E0B' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_settings`("id", "host_name", "host_email", "password_hash", "timezone", "slot_duration_minutes", "buffer_minutes", "min_advance_notice_hours", "max_future_booking_days", "require_host_approval", "primary_theme_color", "accent_theme_color") SELECT "id", "host_name", "host_email", "password_hash", "timezone", "slot_duration_minutes", "buffer_minutes", "min_advance_notice_hours", "max_future_booking_days", "require_host_approval", "primary_theme_color", "accent_theme_color" FROM `settings`;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
-- Existing installs were on the old 0-minute default; opt them into the new
-- 30-minute prep buffer too. Anyone who deliberately set 0 loses that choice,
-- but a bare "no gap between meetings" setting is unlikely to be intentional.
UPDATE `settings` SET `buffer_minutes` = 30 WHERE `buffer_minutes` = 0;