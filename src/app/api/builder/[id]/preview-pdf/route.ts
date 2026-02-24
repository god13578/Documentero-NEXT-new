import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
// หากในโปรเจกต์คุณใช้ชื่อฟังก์ชันอื่นในการสร้าง PDF ให้แก้ตรงนี้นะครับ 
// (เช่น import { createPdf } หรือ import { generateDocx })
import { generatePdf } from '@/lib/document/generator'; 

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = req.nextUrl.searchParams;
    const dataJson = searchParams.get('data');
    const values = dataJson ? JSON.parse(dataJson) : {};

    // 1. ค้นหาแม่แบบใน Database
    const [template] = await db.select().from(templates).where(eq(templates.id, id));

    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    // 2. ระบบค้นหาไฟล์อัจฉริยะ (แก้ปัญหาหาไฟล์ไม่เจอ)
    let filePath = "";
    const cleanPath = template.docxPath.replace(/^\//, ''); // ตัด / ข้างหน้าทิ้ง
    
    if (cleanPath.startsWith('public/')) {
        filePath = path.join(process.cwd(), cleanPath);
    } else {
        filePath = path.join(process.cwd(), 'public', cleanPath);
    }

    if (!fs.existsSync(filePath)) {
       console.error("❌ PDF Preview Error: File missing at", filePath);
       // ถ้าหาไม่เจอ ส่งข้อความกลับไปให้รู้
       return new NextResponse(`File missing on server: ${template.docxPath}`, { status: 404 });
    }

    // 3. อ่านไฟล์ Word
    const docxBuffer = fs.readFileSync(filePath);
    
    // 4. สร้าง PDF
    // หมายเหตุ: ตรงนี้ต้องแน่ใจว่าฟังก์ชัน generatePdf มีอยู่จริงในโปรเจกต์ของคุณ 
    // ถ้าโปรเจกต์เก่าคืนค่าเป็น docx ก็ใช้ generateDocx แทนได้
    const pdfBuffer = await generatePdf(docxBuffer, values); 

    // 5. ส่งไฟล์ PDF กลับไปให้หน้าเว็บแสดง
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"',
      },
    });

  } catch (error) {
    console.error('🔥 PDF Preview Route Error:', error);
    return new NextResponse(String(error), { status: 500 });
  }
}