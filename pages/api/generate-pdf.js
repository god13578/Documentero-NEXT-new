import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { template, values } = req.body;
    if (!template || !values) {
      return res.status(400).json({ error: "Missing data" });
    }

    const templatesDir = path.join(process.cwd(), "templates");
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const templatePath = path.join(templatesDir, template);
    const content = fs.readFileSync(templatePath, "binary");

    // 1) Load DOCX correctly
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // 2) Inject values
    doc.render(values);

    const filledBuffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    const filledDocxPath = path.join(
      tempDir,
      `filled-${Date.now()}.docx`
    );
    fs.writeFileSync(filledDocxPath, filledBuffer);

    // 3) Convert to PDF using LibreOffice
    await execAsync(
      `soffice --headless --convert-to pdf --outdir "${tempDir}" "${filledDocxPath}"`
    );

    const pdfPath = filledDocxPath.replace(".docx", ".pdf");
    const pdfBuffer = fs.readFileSync(pdfPath);

    // 4) Send PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="document.pdf"'
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({
      error: "PDF generation failed",
      detail: err.message,
    });
  }
}
