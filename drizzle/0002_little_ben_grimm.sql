ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "documents" RENAME COLUMN "name" TO "created_by";--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "template_fields" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "data" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "pdf_path" text NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "docx_path" text NOT NULL;