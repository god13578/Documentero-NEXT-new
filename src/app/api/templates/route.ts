import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates, templateFields } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { extractFieldsFromDocx } from "@/lib/document/parser";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file || !name) {
      return NextResponse.json({ error: "File and name are required" }, { status: 400 });
    }

    // Save template file
    const templateId = randomUUID();
    const fileName = `${templateId}.docx`;
    const uploadPath = path.join(process.cwd(), "public", "templates", fileName);
    
    // Ensure templates directory exists
    await fs.mkdir(path.dirname(uploadPath), { recursive: true });
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(uploadPath, buffer);

    // Extract fields from template
    const uniqueFields = extractFieldsFromDocx(buffer);

    // Save template to database
    await db.insert(templates).values({
      id: templateId,
      userId: 1,
      name,
      docxPath: uploadPath,
      originalName: file.name,
      fieldConfig: {},
    });

    // Save template fields with proper IDs
    for (const fieldName of uniqueFields) {
      await db.insert(templateFields).values({
        id: randomUUID(),
        templateId,
        name: fieldName,
      });
    }

    return NextResponse.json({ 
      success: true, 
      templateId,
      fields: uniqueFields 
    });

  } catch (error) {
    console.error("Error uploading template:", error);
    return NextResponse.json({ error: "Failed to upload template" }, { status: 500 });
  }
}
