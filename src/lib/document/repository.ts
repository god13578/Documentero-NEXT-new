import { db } from "@/lib/db/client";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type DocumentRecord = {
  id: string;
  name: string;
  data: Record<string, any>;
};

export async function loadDocumentValues(documentId: string): Promise<DocumentRecord | null> {
  if (!documentId) return null;
  const rows = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  const row = rows[0];
  if (!row) return null;
  const data = (row.data as Record<string, any>) || {};
  return {
    id: row.id,
    name: row.name,
    data,
  };
}

export async function saveDocumentValues(documentId: string, values: Record<string, any>): Promise<DocumentRecord | null> {
  if (!documentId) return null;
  const rows = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  const row = rows[0];
  if (!row) return null;

  await db.update(documents).set({ data: values }).where(eq(documents.id, documentId));

  return {
    id: row.id,
    name: row.name,
    data: values,
  };
}
