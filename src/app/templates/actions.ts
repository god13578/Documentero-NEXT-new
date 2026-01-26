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

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fields = extractFieldsFromDocx(buffer);

    const id = randomUUID();
    const dir = path.join(process.cwd(), "storage/templates");
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, `${id}.docx`);
    await fs.writeFile(filePath, buffer);

    // Insert template with userId = 1 (default user for now)
    await db.insert(templates).values({
      id,
      userId: 1, // Default user ID
      name,
      docxPath: filePath,
      originalName: file.name,
      fieldConfig: {}, // Initialize with empty config
    });

    // Insert template fields
    for (const field of fields) {
      await db.insert(templateFields).values({
        templateId: id,
        name: field,
        label: field, // Use field name as label initially
        type: "text", // Default type
        options: null,
        defaultValue: null,
        isRequired: false,
        fieldOrder: 0,
      });
    }

    return { success: true, id };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "เกิดข้อผิดพลาดในการอัปโหลด" };
  }
}
