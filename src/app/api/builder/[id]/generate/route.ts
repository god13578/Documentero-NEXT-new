import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates, documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { redirect } from "next/navigation";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const templateId = params.id;

    // Get template from database
    const template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!template[0]) {
      return NextResponse.json({ error: "ไม่พบ Template" }, { status: 404 });
    }

    // Read template file
    const templateBuffer = await fs.readFile(template[0].docxPath);
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Convert formData to values
    const values: Record<string, string> = {};
    formData.forEach((value, key) => {
      values[key] = String(value);
    });

    // Fill template with data
    doc.setData(values);
    doc.render();

    // Apply THSarabun font to all text
    const templateZip = doc.getZip();
    const documentXml = templateZip.files["word/document.xml"].asText();
    
    // Replace font to THSarabun
    const updatedXml = documentXml
      .replace(/<w:rPr[^>]*>.*?<\/w:rPr>/g, (match) => {
        if (match.includes('w:rFonts')) {
          return match.replace(/w:ascii="[^"]*"/g, 'w:ascii="THSarabun"')
                     .replace(/w:eastAsia="[^"]*"/g, 'w:eastAsia="THSarabun"')
                     .replace(/w:hAnsi="[^"]*"/g, 'w:hAnsi="THSarabun"');
        } else {
          return match.replace('<w:rPr>', '<w:rPr><w:rFonts w:ascii="THSarabun" w:eastAsia="THSarabun" w:hAnsi="THSarabun"/></w:rPr>');
        }
      })
      .replace(/<w:rPr>/g, '<w:rPr><w:rFonts w:ascii="THSarabun" w:eastAsia="THSarabun" w:hAnsi="THSarabun"/></w:rPr>');
    
    templateZip.files["word/document.xml"] = updatedXml;

    // Generate filled document
    const filledBuffer = Buffer.from(templateZip.generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    }));

    // Create temporary files
    const documentId = randomUUID();
    const docxId = randomUUID();
    const docxPath = path.join(process.cwd(), "tmp", `filled-${docxId}.docx`);
    const pdfPath = path.join(process.cwd(), "tmp", `filled-${docxId}.pdf`);

    await fs.writeFile(docxPath, filledBuffer);

    // Save to database
    await db.insert(documents).values({
      id: documentId,
      templateId: templateId,
      name: `${template[0].name} - ${new Date().toISOString()}`,
      docxPath,
      createdBy: "system",
      title: `${template[0].name} - ${new Date().toISOString()}`,
      data: values,
      pdfPath,
    });

    // Return file for download
    return new NextResponse(filledBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${template[0].name}.docx"`,
      },
    });

  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json({ error: "Failed to generate document" }, { status: 500 });
  }
}
