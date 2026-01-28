import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { values } = await req.json();
    const templateId = params.id;
    const docxPath = path.join(process.cwd(), "public", "templates", `${templateId}.docx`);

    if (!fs.existsSync(docxPath)) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Convert raw DOCX to HTML to preserve {placeholders}
    const result = await mammoth.convertToHtml({ path: docxPath });
    
    return NextResponse.json({ html: result.value });
  } catch (error: any) {
    console.error("HTML Preview Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
