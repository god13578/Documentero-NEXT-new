import { fillDocx } from "./fillDocx";
import { convertDocxToPdf } from "./convertPdf";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { template, fields } = req.body;

    if (!template || !fields) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // 1️⃣ เติมข้อมูลลง Word
    const docxBuffer = fillDocx(template, fields);

    // 2️⃣ แปลงเป็น PDF
    const pdfBuffer = await convertDocxToPdf(docxBuffer);

    // 3️⃣ ส่งกลับเป็นไฟล์
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="document.pdf"'
    );

    res.send(pdfBuffer);
  } catch (err) {
    console.error("Generate API error:", err);
    res.status(500).json({ error: "Generate failed" });
  }
}
