CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "template_fields" RENAME COLUMN "name" TO "field_key";--> statement-breakpoint
ALTER TABLE "template_fields" ADD COLUMN "field_label" text NOT NULL;--> statement-breakpoint
ALTER TABLE "template_fields" ADD COLUMN "field_type" text DEFAULT 'text' NOT NULL;