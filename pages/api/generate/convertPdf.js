import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

export async function convertDocxToPdf(docxBuffer) {
  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }

  const id = randomUUID();
  const docxPath = path.join(tmpDir, `${id}.docx`);
  const pdfPath = path.join(tmpDir, `${id}.pdf`);

  // เขียน DOCX ลง disk
  fs.writeFileSync(docxPath, docxBuffer);

  try {
    await execAsync(
      `soffice --headless --convert-to pdf --outdir "${tmpDir}" "${docxPath}"`
    );
  } catch (err) {
    console.error("LibreOffice convert error:", err);
    throw new Error("PDF conversion failed");
  }

  if (!fs.existsSync(pdfPath)) {
    throw new Error("PDF file not generated");
  }

  const pdfBuffer = fs.readFileSync(pdfPath);

  // cleanup (optional แต่แนะนำ)
  fs.unlinkSync(docxPath);
  fs.unlinkSync(pdfPath);

  return pdfBuffer;
}
