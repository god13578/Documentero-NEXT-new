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
  const userId = await getSession();
  if (!userId) {
    throw new Error("ไม่ได้เข้าสู่ระบบ");
  }

  // 1. โหลด template
  const template = await db.query.templates.findFirst({
    where: eq(templates.id, templateId),
  });

  if (!template) {
    throw new Error("ไม่พบ Template");
  }

  // 2. โหลด field
  const fields = await db.query.templateFields.findMany({
    where: eq(templateFields.templateId, templateId),
  });

  // 3. map formData → object
  const values: Record<string, string> = {};
  for (const field of fields) {
    values[field.name] = formData.get(field.name)?.toString() ?? "";
  }

  // 4. เตรียม path
  const docId = randomUUID();

  const docxPath = path.join(
    process.cwd(),
    "storage/documents",
    `${docId}.docx`
  );

  const pdfPath = path.join(
    process.cwd(),
    "storage/documents",
    `${docId}.pdf`
  );

  // 5. สร้าง DOCX
  await generateDocx(template.docxPath, values, docxPath);

  // 6. DOCX → HTML → PDF
  const html = await docxToHtml(docxPath);
  const pdfHtml = buildPdfHtml(html);
  await generatePdfFromHtml(pdfHtml, pdfPath);

  // 7. save document
  await db.insert(documents).values({
    id: docId,
    templateId,
    createdBy: userId,
    title: values.subject || template.name,
    data: values,
    docxPath,
    pdfPath,
  });

  return { success: true, docId };
}
