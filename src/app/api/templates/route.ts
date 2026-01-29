import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates, templateFields } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { extractFieldsFromDocx } from "@/lib/document/parser";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    // Get user session
    const session = await getSession();
    if (!session) {
      console.error("Template upload failed: No active session");
      return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file || !name) {
      console.error("Template upload failed: Missing file or name");
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
    console.log(`Template "${name}" uploaded with fields:`, uniqueFields);

    // Save template to database with actual user ID
    await db.insert(templates).values({
      id: templateId,
      userId: session, // session is the userId string directly
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

    console.log(`Template "${name}" saved successfully with ID: ${templateId}`);

    return NextResponse.json({ 
      success: true, 
      templateId,
      fields: uniqueFields 
    });

  } catch (error) {
    console.error("Error uploading template:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ 
      error: "Failed to upload template",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
