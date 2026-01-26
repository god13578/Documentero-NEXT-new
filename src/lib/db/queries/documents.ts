import { db } from "../client";
import { documents, templates } from "../schema";
import { eq, desc } from "drizzle-orm";

export async function getDocuments() {
  return await db
    .select({
      id: documents.id,
      title: documents.title,
      createdAt: documents.createdAt,
      templateName: templates.name,
      templateId: documents.templateId,
    })
    .from(documents)
    .leftJoin(templates, eq(documents.templateId, templates.id))
    .orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: string) {
  return await db
    .select({
      id: documents.id,
      title: documents.title,
      data: documents.data,
      createdAt: documents.createdAt,
      docxPath: documents.docxPath,
      pdfPath: documents.pdfPath,
      templateName: templates.name,
    })
    .from(documents)
    .leftJoin(templates, eq(documents.templateId, templates.id))
    .where(eq(documents.id, id))
    .limit(1);
}
