import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { templateFields } from "@/lib/db/schema";

export type BuilderField = {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "date";
  required: boolean;
};

const normalizeType = (value?: string | null): BuilderField["type"] => {
  switch ((value || "").toLowerCase()) {
    case "number":
    case "numeric":
      return "number";
    case "boolean":
    case "bool":
      return "boolean";
    case "date":
    case "datetime":
    case "fulldate":
      return "date";
    default:
      return "string";
  }
};

const formatLabel = (name: string) =>
  name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export async function getBuilderFields(templateId?: string): Promise<BuilderField[]> {
  "use server";

  try {
    const result = await db.execute<{
      name: string | null;
      label: string | null;
      type: string | null;
      is_required: boolean | null;
    }>(sql`
      select name, label, type, is_required
      from template_fields
      ${templateId ? sql`where template_id = ${templateId}` : sql``}
      order by field_order
    `);

    const rows = result.rows ?? [];

    return rows
      .filter((row) => row.name)
      .map((row) => ({
        name: row.name as string,
        label: row.label && row.label.trim().length > 0 ? row.label : formatLabel(row.name as string),
        type: normalizeType(row.type),
        required: Boolean(row.is_required),
      }));
  } catch {
    const rows = await db
      .select()
      .from(templateFields)
      .where(templateId ? eq(templateFields.templateId, templateId) : undefined);

    return rows.map((row) => ({
      name: row.name,
      label: formatLabel(row.name),
      type: "string",
      required: false,
    }));
  }
}
