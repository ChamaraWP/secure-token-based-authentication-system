PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_refresh_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`family_id` text NOT NULL,
	`replaced_by_token_id` text,
	`revoked` integer DEFAULT false NOT NULL,
	`revoked_at` integer,
	`expires_at` integer NOT NULL,
	`user_agent` text,
	`ip_address` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_refresh_tokens`("id", "user_id", "token_hash", "family_id", "replaced_by_token_id", "revoked", "revoked_at", "expires_at", "user_agent", "ip_address", "created_at")
SELECT
	"id",
	"user_id",
	"token_id",
	"id",
	NULL,
	CASE WHEN "revoked_at" IS NULL THEN false ELSE true END,
	CASE
		WHEN "revoked_at" IS NULL THEN NULL
		WHEN typeof("revoked_at") = 'integer' THEN "revoked_at"
		ELSE unixepoch("revoked_at")
	END,
	CASE
		WHEN typeof("expires_at") = 'integer' THEN "expires_at"
		ELSE unixepoch("expires_at")
	END,
	NULL,
	NULL,
	CASE
		WHEN typeof("created_at") = 'integer' THEN "created_at"
		ELSE unixepoch("created_at")
	END
FROM `refresh_tokens`;--> statement-breakpoint
DROP TABLE `refresh_tokens`;--> statement-breakpoint
ALTER TABLE `__new_refresh_tokens` RENAME TO `refresh_tokens`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `refresh_tokens_user_id_idx` ON `refresh_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `refresh_tokens_family_id_idx` ON `refresh_tokens` (`family_id`);--> statement-breakpoint
CREATE INDEX `refresh_tokens_token_hash_idx` ON `refresh_tokens` (`token_hash`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`token_version` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password_hash", "token_version", "created_at", "updated_at")
SELECT
	"id",
	"email",
	"password_hash",
	0,
	CASE
		WHEN typeof("created_at") = 'integer' THEN "created_at"
		ELSE unixepoch("created_at")
	END,
	CASE
		WHEN typeof("created_at") = 'integer' THEN "created_at"
		ELSE unixepoch("created_at")
	END
FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);