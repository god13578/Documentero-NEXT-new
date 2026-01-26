import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";

async function runBootstrap() {
  // Templates table columns
  await db.execute(sql`
    ALTER TABLE templates
    ADD COLUMN IF NOT EXISTS docx_path TEXT,
    ADD COLUMN IF NOT EXISTS original_name TEXT,
    ADD COLUMN IF NOT EXISTS field_config JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now(),
    ADD COLUMN IF NOT EXISTS user_id INTEGER DEFAULT 1;
  `);

  // Template fields table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS template_fields (
      id SERIAL PRIMARY KEY,
      template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      label TEXT NOT NULL,
      type TEXT DEFAULT 'text' NOT NULL,
      options JSONB,
      default_value TEXT,
      is_required BOOLEAN DEFAULT false,
      field_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );
  `);

  // Documents table columns
  await db.execute(sql`
    ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS docx_path TEXT,
    ADD COLUMN IF NOT EXISTS pdf_path TEXT,
    ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS title TEXT;
  `);

  // Users table already exists in dump; skip seeding here
}

export async function POST() {
  try {
    await runBootstrap();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bootstrap error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
