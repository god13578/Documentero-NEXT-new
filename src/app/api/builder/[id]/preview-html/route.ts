import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";

// โหลดฟังก์ชันแปลง Word เป็น HTML ที่คุณมีอยู่แล้ว
import { docxToHtml } from "@/lib/document/docx-to-html"; 

// ห้ามจำ Cache 
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 1. ดึงข้อมูล Template
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    // 2. ค้นหาไฟล์ Word (.docx)
    let filePath = "";
    const cleanPath = template.docxPath.replace(/^\//, ''); 
    if (cleanPath.startsWith('public/')) {
        filePath = path.join(process.cwd(), cleanPath);
    } else {
        filePath = path.join(process.cwd(), 'public', cleanPath);
    }
    
    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found on server" }, { status: 404 });
    }

    // 3. แปลง Word ให้กลายเป็น HTML (เพื่อให้แก้ไขแล้วเห็นภาพทันที)
    const htmlOutput = await docxToHtml(filePath);

    // 4. ส่งกลับไปให้หน้า Builder ฝั่งขวา
    return NextResponse.json({ html: htmlOutput });
    
  } catch (error) {
    console.error("HTML Preview Error:", error);
    return NextResponse.json({ error: "Server Error", details: String(error) }, { status: 500 });
  }
}