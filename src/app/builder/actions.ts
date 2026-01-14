"use server";

import { db } from "@/lib/db/client";
import { extractFieldsFromDocx } from "@/lib/docx/parser";
import { sql } from "drizzle-orm";

export async function uploadTemplate(formData: FormData) {
  const name = formData.get("name") as string;
  const file = formData.get("file") as File;

  if (!name || !file) {
    throw new Error("Missing name or file");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fields = extractFieldsFromDocx(buffer);

  // insert template
  const result = await db.execute<{ id: string }>(sql`
    insert into templates (name)
    values (${name})
    returning id
  `);

  const templateId = result.rows[0].id;

  // insert fields (SQL ตรง)
  for (const field of fields) {
    await db.execute(sql`
      insert into template_fields (template_id, name)
      values (${templateId}, ${field})
    `);
  }

  return { ok: true };
}
