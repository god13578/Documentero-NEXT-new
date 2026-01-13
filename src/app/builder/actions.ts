"use server";

import { db } from "@/lib/db/client";
import {
  templates,
  templateFields,
  type NewTemplate,
  type NewTemplateField,
} from "@/lib/db/schema";
import { extractFieldsFromDocx } from "@/lib/docx/parser";

export async function uploadTemplate(formData: FormData) {
  const name = formData.get("name") as string;
  const file = formData.get("file") as File;

  const buffer = Buffer.from(await file.arrayBuffer());
  const fields = extractFieldsFromDocx(buffer);

  const newTemplate: NewTemplate = { name };

  const [template] = await db
    .insert(templates)
    .values(newTemplate)
    .returning();

  for (const field of fields) {
    const row: NewTemplateField = {
      templateId: template.id,
      name: field,
    };

    await db.insert(templateFields).values(row);
  }

  return { ok: true };
}
