import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const templateId = params.id;
    // Look in templates first, then uploads
    let docxPath = path.join(process.cwd(), "public", "templates", `${templateId}.docx`);
    if (!fs.existsSync(docxPath)) {
       docxPath = path.join(process.cwd(), "public", "uploads", `${templateId}.docx`);
    }

    if (!fs.existsSync(docxPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Convert raw docx to html (preserve placeholders)
    const result = await mammoth.convertToHtml({ path: docxPath });
    return NextResponse.json({ html: result.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
