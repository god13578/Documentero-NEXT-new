import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check templates then uploads
    const publicDir = path.join(process.cwd(), "public");
    let docxPath = path.join(publicDir, "templates", `${params.id}.docx`);
    if (!fs.existsSync(docxPath)) docxPath = path.join(publicDir, "uploads", `${params.id}.docx`);

    if (!fs.existsSync(docxPath)) return NextResponse.json({ error: "File not found" }, { status: 404 });

    // Convert to HTML (Raw)
    const result = await mammoth.convertToHtml({ path: docxPath });
    return NextResponse.json({ html: result.value });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
