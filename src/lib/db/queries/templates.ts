import { db } from "../client";
import { templates } from "../schema";

export async function getTemplates() {
  return await db.select().from(templates);
}
