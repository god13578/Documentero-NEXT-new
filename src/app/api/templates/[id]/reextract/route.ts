import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates, templateFields } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import mammoth from "mammoth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;

    // Get template info
    const template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!template[0]) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Read template file
    const buffer = await fs.readFile(template[0].docxPath);
    
    // Extract text using mammoth
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    // Find template fields (support Thai characters)
    const fieldMatches = text.match(/\{[^\}]+\}/g) || [];
    const uniqueFields = Array.from(new Set(fieldMatches.map(f => f.slice(1, -1))));

    // Delete existing fields
    await db.delete(templateFields).where(eq(templateFields.templateId, templateId));

    // Save new fields
    for (const fieldName of uniqueFields) {
      await db.insert(templateFields).values({
        id: crypto.randomUUID(),
        templateId,
        name: fieldName,
        fieldType: "text",
        isRequired: false,
        fieldOrder: 0,
      });
    }

    return NextResponse.json({
      success: true,
      extractedText: text,
      fieldsFound: uniqueFields,
      fieldCount: uniqueFields.length
    });

  } catch (error) {
    console.error("Error re-extracting fields:", error);
    return NextResponse.json({ error: "Failed to re-extract fields" }, { status: 500 });
  }
}
