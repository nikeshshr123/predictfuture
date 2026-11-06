CREATE TABLE `login_attempts` (
	`bucket` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `readings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_key` text NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`job` text NOT NULL,
	`love` text NOT NULL,
	`sign` text NOT NULL,
	`dob` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `readings_entry_key_unique` ON `readings` (`entry_key`);--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
