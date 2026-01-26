"use server";

import { db } from "@/lib/db/client";
import { templateFields, documents } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

export async function generateDocument(
  templateId: string,
  formData: FormData
) {
  // 1. ดึง template docx path
  const result = await db.execute<{
    docx_path: string;
  }>(sql`
    select docx_path
    from templates
    where id = ${templateId}
  `);

  if (!result.rows[0]) {
    throw new Error("ไม่พบ template");
  }

  const templatePath = result.rows[0].docx_path;

  // 2. อ่านไฟล์ docx
  const content = await fs.readFile(templatePath);
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // 3. แปลง formData → values
  const values: Record<string, string> = {};
  formData.forEach((value, key) => {
    values[key] = String(value);
  });

  // 4. render
  doc.setData(values);
  doc.render();

  // 5. สร้างไฟล์ใหม่
  const buffer = doc.getZip().generate({
    type: "nodebuffer",
  });

  const outDir = path.join(process.cwd(), "tmp");
  await fs.mkdir(outDir, { recursive: true });

  const filename = `document-${Date.now()}.docx`;
  const outPath = path.join(outDir, filename);

  await fs.writeFile(outPath, buffer);

  // 6. บันทึกลงฐานข้อมูล
  const documentId = randomUUID();
  await db.insert(documents).values({
    id: documentId,
    templateId: templateId,
    createdBy: "system", // ควรดึงจาก authentication
    title: `Document - ${new Date().toISOString()}`,
    data: values,
    docxPath: outPath,
    pdfPath: "", // สามารถเพิ่ม PDF generation ภายหลัง
  });

  // 7. redirect ไป download
  redirect(`/api/files/${documentId}`);
}
