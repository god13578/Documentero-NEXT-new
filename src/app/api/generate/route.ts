import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates, documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
  try {
    const { template, fields } = await request.json();

    if (!template || !fields) {
      return NextResponse.json({ error: "Template and fields are required" }, { status: 400 });
    }

    // Get template from database
    const templateData = await db
      .select({ docxPath: templates.docxPath, name: templates.name })
      .from(templates)
      .where(eq(templates.id, template))
      .limit(1);

    if (!templateData[0]) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Read template file
    const templateBuffer = await fs.readFile(templateData[0].docxPath);
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Fill template with data
    doc.setData(fields);
    doc.render();

    // Generate filled document
    const filledBuffer = Buffer.from(doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    }));

    // Create temporary files
    const docxId = randomUUID();
    const docxPath = path.join(process.cwd(), "tmp", `filled-${docxId}.docx`);
    const pdfPath = path.join(process.cwd(), "tmp", `filled-${docxId}.pdf`);

    await fs.writeFile(docxPath, filledBuffer);

    // Convert to PDF using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Convert DOCX to HTML first (simplified approach)
    // For production, you might want to use a proper DOCX to HTML converter
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #ddd; padding: 8px; }
          </style>
        </head>
        <body>
          <h1>${templateData[0].name}</h1>
          <div>Document generated with template: ${template}</div>
          <div>Fields: ${JSON.stringify(fields, null, 2)}</div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();
    await fs.writeFile(pdfPath, pdfBuffer);

    // Save to database
    const documentId = randomUUID();
    await db.insert(documents).values({
      id: documentId,
      templateId: template,
      createdBy: "system", // You should get this from authentication
      title: `${templateData[0].name} - ${new Date().toISOString()}`,
      data: fields,
      docxPath,
      pdfPath,
    });

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="document.pdf"`,
      },
    });

  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json({ error: "Failed to generate document" }, { status: 500 });
  }
}
