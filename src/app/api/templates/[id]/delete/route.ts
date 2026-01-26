import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates, templateFields } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;

    // Get template info before deleting
    const template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!template[0]) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Delete template fields first (foreign key constraint)
    await db
      .delete(templateFields)
      .where(eq(templateFields.templateId, templateId));

    // Delete template from database
    await db
      .delete(templates)
      .where(eq(templates.id, templateId));

    // Delete the actual DOCX file if it exists
    if (template[0].docxPath) {
      try {
        await fs.unlink(template[0].docxPath);
      } catch (error) {
        console.warn("Could not delete template file:", error);
      }
    }

    return NextResponse.json({ 
      message: "Template deleted successfully",
      templateName: template[0].name
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
