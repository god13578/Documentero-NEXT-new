import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const execAsync = promisify(exec);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { values } = await req.json();
    const docxPath = path.join(process.cwd(), "public", "templates", `${params.id}.docx`);
    const tempDir = path.join(os.tmpdir(), "doc-gen");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // 1. Generate Word
    const content = fs.readFileSync(docxPath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.setData(values || {});
    doc.render();
    const buf = doc.getZip().generate({ type: "nodebuffer" });

    // 2. Save Temp Word
    const tempId = Date.now();
    const tempWordPath = path.join(tempDir, `${tempId}.docx`);
    fs.writeFileSync(tempWordPath, buf);

    // 3. Convert to PDF (LibreOffice)
    // หมายเหตุ: ต้องติดตั้ง LibreOffice ในเครื่อง/Server
    const soffice = process.platform === "win32" ? '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"' : "libreoffice";
    await execAsync(`${soffice} --headless --convert-to pdf --outdir "${tempDir}" "${tempWordPath}"`);

    // 4. Read PDF
    const pdfPath = path.join(tempDir, `${tempId}.pdf`);
    const pdfBuf = fs.readFileSync(pdfPath);

    // Cleanup
    try { fs.unlinkSync(tempWordPath); fs.unlinkSync(pdfPath); } catch {}

    return new NextResponse(pdfBuf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${params.id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate PDF. Make sure LibreOffice is installed." }, { status: 500 });
  }
}
