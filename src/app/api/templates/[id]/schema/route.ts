import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const templateId = params.id;
    const filePath = path.join(process.cwd(), "public", "templates", `${templateId}.docx`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ ok: false, error: "Template file not found" }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // Key Fix: Extract full text to strip XML tags, then find {vars}
    const text = doc.getFullText(); 
    const regex = /\{([^}]+)\}/g;
    const matches = new Set<string>();
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Filter out internal Docxtemplater tags or invalid chars if needed
      if (match[1] && !match[1].startsWith('/')) {
         matches.add(match[1].trim());
      }
    }

    const fields = Array.from(matches).map(variable => ({ variable }));

    return NextResponse.json({ ok: true, schema: fields });
  } catch (error: any) {
    console.error("Schema Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
