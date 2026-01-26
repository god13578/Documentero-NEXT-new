import { db } from "../client";
import { templates, templateFields } from "../schema";
import { eq } from "drizzle-orm";

export async function getTemplateWithFields(id: string) {
  const template = await db
    .select()
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);

  const fields = await db
    .select()
    .from(templateFields)
    .where(eq(templateFields.templateId, id));

  return {
    template: template[0],
    fields,
  };
}