import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Add missing columns to template_fields table
    await db.execute(sql`
      ALTER TABLE template_fields 
      ADD COLUMN IF NOT EXISTS field_label text NOT NULL DEFAULT ''
    `);
    
    await db.execute(sql`
      ALTER TABLE template_fields 
      ADD COLUMN IF NOT EXISTS field_type text NOT NULL DEFAULT 'text'
    `);
    
    // Rename name column to field_key if it exists
    await db.execute(sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'template_fields' 
          AND column_name = 'name'
        ) THEN
          ALTER TABLE template_fields RENAME COLUMN name TO field_key;
        END IF;
      END $$;
    `);

    return NextResponse.json({ success: true, message: "Migration completed" });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
