import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { generateDocx } from '@/lib/document/generator'; 
import { convertDocxToPdf } from '@/lib/document/pdf'; // นำเข้าเครื่องยนต์ PDF ตัวใหม่!

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const searchParams = req.nextUrl.searchParams;
    const dataJson = searchParams.get('data');
    const values = dataJson ? JSON.parse(dataJson) : {};

    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    if (!template) return new NextResponse("Template not found", { status: 404 });

    const cleanPath = template.docxPath.replace(/^\//, ''); 
    const filePath = path.join(process.cwd(), cleanPath.startsWith('public/') ? cleanPath : `public/${cleanPath}`);
    if (!fs.existsSync(filePath)) return new NextResponse("File missing", { status: 404 });

    // 1. อ่าน Word ต้นฉบับ
    const docxBuffer = fs.readFileSync(filePath);
    
    // 2. เติมข้อมูลลง Word
    const filledDocxBuffer = await generateDocx(docxBuffer, values);

    // 3. แปลง Word เป็น "PDF ของแท้" ด้วย LibreOffice
    const pdfBuffer = await convertDocxToPdf(filledDocxBuffer);

    // 4. ส่ง PDF กลับไปให้เบราว์เซอร์แสดงผล
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="document_preview.pdf"',
      },
    });

  } catch (error) {
    console.error('🔥 Preview PDF Route Error:', error);
    return new NextResponse(String(error), { status: 500 });
  }
}