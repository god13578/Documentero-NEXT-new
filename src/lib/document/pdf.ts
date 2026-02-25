import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { randomUUID } from "crypto";
import os from "os";

const execAsync = promisify(exec);

export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  const tmpDir = path.join(process.cwd(), "tmp");
  
  // สร้างโฟลเดอร์ tmp ถ้ายังไม่มี
  if (!fsSync.existsSync(tmpDir)) {
    await fs.mkdir(tmpDir, { recursive: true });
  }

  // สร้างชื่อไฟล์สุ่ม เพื่อไม่ให้ไฟล์ชนกันเวลาคนกดพร้อมกัน
  const fileId = randomUUID();
  const inputPath = path.join(tmpDir, `${fileId}.docx`);
  const outputPath = path.join(tmpDir, `${fileId}.pdf`);

  try {
    // 1. วางไฟล์ Word ลงในโฟลเดอร์ชั่วคราว
    await fs.writeFile(inputPath, docxBuffer);

    // 2. กำหนด Path ของโปรแกรม LibreOffice (ปรับตามระบบปฏิบัติการ)
    let sofficePath = 'soffice'; // ค่าเริ่มต้นสำหรับ Linux/Docker
    if (os.platform() === 'win32') {
      // สำหรับ Windows (ตำแหน่งที่ติดตั้งมาตรฐาน)
      sofficePath = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"';
    } else if (os.platform() === 'darwin') {
      // สำหรับ Mac
      sofficePath = '/Applications/LibreOffice.app/Contents/MacOS/soffice';
    }

    // 3. สั่งรันคำสั่งแปลงไฟล์ (Command Line)
    const command = `${sofficePath} --headless --convert-to pdf --outdir "${tmpDir}" "${inputPath}"`;
    await execAsync(command);

    // 4. อ่านไฟล์ PDF ที่ถูกสร้างเสร็จแล้วกลับมา
    const pdfBuffer = await fs.readFile(outputPath);

    // 5. ลบไฟล์ขยะทิ้งเพื่อประหยัดพื้นที่
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});

    return pdfBuffer;
  } catch (error) {
    console.error("🔥 LibreOffice Conversion Error:", error);
    // กรณีพัง ให้ลบไฟล์ขยะด้วย
    if (fsSync.existsSync(inputPath)) await fs.unlink(inputPath).catch(() => {});
    if (fsSync.existsSync(outputPath)) await fs.unlink(outputPath).catch(() => {});
    throw new Error("ไม่สามารถแปลง PDF ได้ (ตรวจสอบว่าติดตั้ง LibreOffice ในเครื่องหรือยัง?)");
  }
}