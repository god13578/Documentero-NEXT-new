import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { generateDocx } from '@/lib/document/generator';

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

    const docxBuffer = fs.readFileSync(filePath);
    const filledDocxBuffer = await generateDocx(docxBuffer, values);

    // 🌟 แก้ปัญหาโหลดไม่ได้: เข้ารหัสชื่อไฟล์ภาษาไทย
    const safeName = template.name.replace(/\s+/g, '_');
    const encodedFilename = encodeURIComponent(`${safeName}_กรอกแล้ว.docx`);

    return new NextResponse(filledDocxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // ใช้ filename*=UTF-8'' เพื่อรองรับภาษาไทย 100%
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
      },
    });

  } catch (error) {
    console.error('Generate Route Error:', error);
    return new NextResponse(String(error), { status: 500 });
  }
}