import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export const config = {
  api: {
    bodyParser: { sizeLimit: "10mb" },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { templateName, data = {}, toPdf = false } = req.body;
    if (!templateName) {
      return res.status(400).json({ error: "Missing templateName" });
    }

    const templatePath = path.join(process.cwd(), "templates", templateName);
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "Template not found" });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 👇 ใช้ชื่อไฟล์เดิมเสมอ (overwrite)
    const safeName = templateName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const docxName = `preview-${safeName}.docx`;
    const pdfName = `preview-${safeName}.pdf`;

    const docxPath = path.join(uploadsDir, docxName);
    const pdfPath = path.join(uploadsDir, pdfName);

    // ----------------------------
    // Fill DOCX
    // ----------------------------
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render(data);

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    fs.writeFileSync(docxPath, buf);

    // ----------------------------
    // DOCX only
    // ----------------------------
    if (!toPdf) {
      return res.json({
        ok: true,
        docxUrl: `/uploads/${docxName}`,
      });
    }

    // ----------------------------
    // Convert via Docker LibreOffice
    // ----------------------------
    const formData = new FormData();
    formData.append("file", new Blob([buf]), docxName);

    const loRes = await fetch("http://localhost:4000/convert", {
      method: "POST",
      body: formData,
    });

    if (!loRes.ok) {
      throw new Error("LibreOffice service failed");
    }

    const pdfBuffer = Buffer.from(await loRes.arrayBuffer());
    fs.writeFileSync(pdfPath, pdfBuffer);

    return res.json({
      ok: true,
      pdfUrl: `/uploads/${pdfName}`,
    });
  } catch (err) {
    console.error("FILL API ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
