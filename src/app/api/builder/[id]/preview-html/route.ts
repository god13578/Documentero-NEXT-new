import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const templateId = params.id;
    // 1. Search in templates folder
    let docxPath = path.join(process.cwd(), "public", "templates", `${templateId}.docx`);
    
    // 2. Fallback to uploads folder
    if (!fs.existsSync(docxPath)) {
       docxPath = path.join(process.cwd(), "public", "uploads", `${templateId}.docx`);
    }

    if (!fs.existsSync(docxPath)) {
      return NextResponse.json({ error: "Template file not found" }, { status: 404 });
    }

    // 3. Convert to HTML (Raw, preserving placeholders)
    const result = await mammoth.convertToHtml({ path: docxPath });
    
    return NextResponse.json({ html: result.value });

  } catch (error: any) {
    console.error("Preview Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
