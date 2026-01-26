"use server";

import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/db/client";
import { templates, templateFields } from "@/lib/db/schema";
import { extractFieldsFromDocx } from "@/lib/document/parser";
import { randomUUID } from "crypto";

export async function uploadTemplate(
  _: any,
  formData: FormData
) {
  const name = formData.get("name")?.toString();
  const file = formData.get("file") as File;

  if (!name || !file) {
    return { error: "ข้อมูลไม่ครบ" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fields = extractFieldsFromDocx(buffer);

  const id = randomUUID();
  const dir = path.join(process.cwd(), "storage/templates");
  await fs.mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${id}.docx`);
  await fs.writeFile(filePath, buffer);

  await db.insert(templates).values({
    id,
    name,
    docxPath: filePath,
  });

  for (const field of fields) {
    await db.insert(templateFields).values({
      templateId: id,
      name: field, // ใช้ name แบบเดิม
    });
  }

  return { success: true };
}
