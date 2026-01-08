"use server";

import path from "path";
import { randomUUID } from "crypto";
import { db } from "@/lib/db/client";
import {
  templates,
  templateFields,
  documents,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateDocx } from "@/lib/document/generator";
import { getSession } from "@/lib/auth/session";
import { docxToHtml } from "@/lib/document/docx-to-html";
import { buildPdfHtml } from "@/lib/document/pdf-template";
import { generatePdfFromHtml } from "@/lib/document/pdf";


export async function createDocument(
  templateId: string,
  formData: FormData
) {
  const userId = getSession();
  if (!userId) {
    throw new Error("ไม่ได้เข้าสู่ระบบ");
  }

  const template = await db.query.templates.findFirst({
    where: eq(templates.id, templateId),
  });

  if (!template) {
    throw new Error("ไม่พบ Template");
  }

  const fields = await db.query.templateFields.findMany({
    where: eq(templateFields.templateId, templateId),
  });

  const data: Record<string, any> = {};
  for (const field of fields) {
    data[field.fieldKey] = formData
      .get(field.fieldKey)
      ?.toString() ?? "";
  }

  const docId = randomUUID();
  const outputPath = path.join(
    process.cwd(),
    "storage/documents",
    `${docId}.docx`
  );

  await generateDocx(template.docxPath, data, outputPath);
  // 1) แปลง DOCX → HTML
  const html = await docxToHtml(outputPath);

  // 2) สร้าง HTML สำหรับ PDF (ฝังฟอนต์จากโปรเจ็กต์)
  const pdfHtml = buildPdfHtml(html);

  // 3) กำหนด path PDF
  const pdfPath = outputPath.replace(".docx", ".pdf");

  // 4) สร้าง PDF จริง
  await generatePdfFromHtml(pdfHtml, pdfPath);


  await db.insert(documents).values({
    id: docId,
    templateId,
    createdBy: userId,
    title: data.subject || "เอกสาร",
    data,
    docxPath: outputPath,
    pdfPath,
  });

  return { success: true, docId };
}
