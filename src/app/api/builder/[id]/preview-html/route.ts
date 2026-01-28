import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { values } = await req.json();
    const templateId = params.id;
    const docxPath = path.join(process.cwd(), "public", "templates", `${templateId}.docx`);

    if (!fs.existsSync(docxPath)) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // 1. Fill Data using Docxtemplater first (to replace {{vars}} with text)
    const content = fs.readFileSync(docxPath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    
    // Replace null/undefined with empty string to prevent "undefined" text
    const safeValues = { ...values };
    Object.keys(safeValues).forEach(key => {
        if (safeValues[key] === null || safeValues[key] === undefined) safeValues[key] = "";
    });

    doc.setData(safeValues);
    doc.render();
    const filledBuffer = doc.getZip().generate({ type: "nodebuffer" });

    // 2. Convert filled DOCX to HTML using Mammoth
    const result = await mammoth.convertToHtml({ buffer: filledBuffer });
    
    return NextResponse.json({ html: result.value });
  } catch (error: any) {
    console.error("HTML Preview Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
