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
    const templateId = params.id;
    let values: Record<string, string> = {};
    let templateBuffer: Buffer;
    let templateName: string = templateId;

    // Try to get template from database first
    try {
      const template = await db
        .select()
        .from(templates)
        .where(eq(templates.id, templateId))
        .limit(1);

      if (template[0]) {
        // Read template file from database path
        templateBuffer = await fs.readFile(template[0].docxPath);
        templateName = template[0].name;
      } else {
        // Fallback to public/templates
        const fallbackPath = path.join(process.cwd(), "public", "templates", `${templateId}.docx`);
        if (!fs.existsSync(fallbackPath)) {
          return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }
        templateBuffer = await fs.readFile(fallbackPath);
      }
    } catch (dbError) {
      // Database error, fallback to public/templates
      const fallbackPath = path.join(process.cwd(), "public", "templates", `${templateId}.docx`);
      if (!fs.existsSync(fallbackPath)) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }
      templateBuffer = await fs.readFile(fallbackPath);
    }

    // Parse values from JSON or formData
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const jsonData = await request.json();
      values = jsonData.values || {};
    } else {
      // Legacy formData support
      const formData = await request.formData();
      formData.forEach((value, key) => {
        values[key] = String(value);
      });
    }

    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
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

    // Save to database (optional)
    try {
      await db.insert(documents).values({
        id: documentId,
        templateId: templateId,
        name: `${templateName} - ${new Date().toISOString()}`,
        docxPath,
        createdBy: "system",
        title: `${templateName} - ${new Date().toISOString()}`,
        data: values,
        pdfPath,
      });
    } catch (dbError) {
      console.warn("Failed to save to database:", dbError);
    }

    // Return file for download
    return new NextResponse(filledBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${templateName}.docx"`,
      },
    });

  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json({ error: "Failed to generate document" }, { status: 500 });
  }
}
