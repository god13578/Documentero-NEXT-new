import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templateFields } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const fields = await db
      .select()
      .from(templateFields)
      .where(eq(templateFields.templateId, params.id))
      .orderBy(templateFields.fieldOrder);

    // Handle old schema (without new fields) - provide defaults
    const processedFields = fields.map(field => ({
      id: field.id,
      templateId: field.templateId,
      name: field.name,
      fieldType: field.fieldType || "text",
      fieldOptions: field.fieldOptions || [],
      fieldDependencies: field.fieldDependencies || [],
      defaultValue: field.defaultValue || "",
      isRequired: field.isRequired || false,
      fieldOrder: field.fieldOrder || 0
    }));

    return NextResponse.json(processedFields);
  } catch (error) {
    console.error("Error fetching template fields:", error);
    return NextResponse.json({ error: "Failed to fetch template fields" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { fields } = await request.json();
    const templateId = params.id;

    // Delete existing fields
    await db.delete(templateFields).where(eq(templateFields.templateId, templateId));

    // Insert new fields
    for (const field of fields) {
      await db.insert(templateFields).values({
        id: field.id,
        templateId,
        name: field.name,
        fieldType: field.fieldType || "text",
        fieldOptions: field.fieldOptions || [],
        fieldDependencies: field.fieldDependencies || [],
        defaultValue: field.defaultValue,
        isRequired: field.isRequired || false,
        fieldOrder: field.fieldOrder || 0,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating template fields:", error);
    return NextResponse.json({ error: "Failed to update template fields" }, { status: 500 });
  }
}
