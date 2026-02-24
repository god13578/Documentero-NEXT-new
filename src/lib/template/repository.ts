import { db } from "@/lib/db/client";
import { templates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type TemplateRecord = {
  id: string;
  name: string;
  content: string;
};

export async function loadTemplate(templateId?: string): Promise<TemplateRecord | null> {
  if (!templateId) return null;

  const rows = await db.select().from(templates).where(eq(templates.id, templateId)).limit(1);
  const row = rows[0];
  if (!row) return null;

  const fieldConfig = (row.fieldConfig as any) || {};
  const content = typeof fieldConfig.content === "string" ? fieldConfig.content : "";

  return {
    id: row.id,
    name: row.name,
    content,
  };
}

export async function saveTemplate(templateId: string, content: string): Promise<TemplateRecord | null> {
  if (!templateId) return null;

  const rows = await db.select().from(templates).where(eq(templates.id, templateId)).limit(1);
  const row = rows[0];
  if (!row) return null;

  const nextConfig = {
    ...(row.fieldConfig as any || {}),
    content,
  };

  await db
    .update(templates)
    .set({ fieldConfig: nextConfig, updatedAt: new Date() })
    .where(eq(templates.id, templateId));

  return {
    id: row.id,
    name: row.name,
    content,
  };
}
