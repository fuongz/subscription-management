CREATE TABLE `push_subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh_key` text NOT NULL,
	`auth_key` text NOT NULL,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`last_used` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscription_endpoint_unique` ON `push_subscription` (`endpoint`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`provider` text,
	`plan_name` text,
	`price` real NOT NULL,
	`currency` text DEFAULT 'VND' NOT NULL,
	`billing_cycle` text DEFAULT 'monthly' NOT NULL,
	`start_date` text NOT NULL,
	`next_billing_date` text,
	`status` text DEFAULT 'active' NOT NULL,
	`category` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_subscription`("id", "user_id", "name", "provider", "plan_name", "price", "currency", "billing_cycle", "start_date", "next_billing_date", "status", "category", "notes", "created_at", "updated_at") SELECT "id", "user_id", "name", "provider", "plan_name", "price", "currency", "billing_cycle", "start_date", "next_billing_date", "status", "category", "notes", "created_at", "updated_at" FROM `subscription`;--> statement-breakpoint
DROP TABLE `subscription`;--> statement-breakpoint
ALTER TABLE `__new_subscription` RENAME TO `subscription`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_user_preference` (
	`user_id` text PRIMARY KEY NOT NULL,
	`currency` text DEFAULT 'VND' NOT NULL,
	`timezone` text DEFAULT 'Asia/Ho_Chi_Minh' NOT NULL,
	`enable_push_notifications` integer DEFAULT false NOT NULL,
	`notify_days_before` text DEFAULT '[1,3,7]' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_preference`("user_id", "currency", "timezone", "enable_push_notifications", "notify_days_before") SELECT "user_id", "currency", "timezone", "enable_push_notifications", "notify_days_before" FROM `user_preference`;--> statement-breakpoint
DROP TABLE `user_preference`;--> statement-breakpoint
ALTER TABLE `__new_user_preference` RENAME TO `user_preference`;