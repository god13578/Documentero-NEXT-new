"use server";

import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/db/client";
import { templates, templateFields } from "@/lib/db/schema";
import { extractFieldsFromDocx } from "@/lib/document/parser";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth/session";

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
    // Get user session
    const session = await getSession();
    if (!session) {
      console.error("Template upload failed: No active session");
      return { error: "กรุณาเข้าสู่ระบบก่อนอัปโหลดเทมเพลต" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fields = extractFieldsFromDocx(buffer);

    const id = randomUUID();
    const dir = path.join(process.cwd(), "storage/templates");
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, `${id}.docx`);
    await fs.writeFile(filePath, buffer);

    console.log(`Template "${name}" uploaded with fields:`, fields);

    // Insert template with actual user ID from session
    await db.insert(templates).values({
      id,
      userId: session, // Use actual user ID from session
      name,
      docxPath: filePath,
      originalName: file.name,
      fieldConfig: {}, // Initialize with empty config
    });

    // Insert template fields with correct schema
    for (const field of fields) {
      await db.insert(templateFields).values({
        id: randomUUID(),
        templateId: id,
        name: field,
      });
    }

    console.log(`Template "${name}" saved successfully with ID: ${id}`);

    return { success: true, id };
  } catch (error) {
    console.error("Template upload error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return { error: "เกิดข้อผิดพลาดในการอัปโหลด" };
  }
}
