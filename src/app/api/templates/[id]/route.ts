import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates, templateFields } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import { extractFieldsFromDocx } from "@/lib/template/field-extractor";

// บังคับให้ Next.js ห้ามจำ Cache เด็ดขาด! (แก้ปัญหาโหลดแล้วข้อมูลไม่เปลี่ยน)
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`\n--- 🔍 START FETCHING TEMPLATE ID: ${id} ---`);

    // 1. ดึงข้อมูลแม่แบบ (ดึงตรงๆ ไม่พึ่ง relations เพื่อป้องกัน error เงียบ)
    const [template] = await db.select().from(templates).where(eq(templates.id, id));

    if (!template) {
      console.log("❌ Template not found in DB");
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // 2. ดึงข้อมูล Field แยกต่างหาก
    let fields = await db.select().from(templateFields).where(eq(templateFields.templateId, id));
    console.log(`📌 Found ${fields.length} fields in database.`);

    // 3. 🔧 ระบบ AUTO-REPAIR: ถ้าไม่มี Field ให้ไปแกะจากไฟล์ใหม่
    if (fields.length === 0) {
        console.log("⚠️ No fields found. Running Auto-Repair...");
        
        // จัดการเรื่อง Path ให้หาไฟล์เจอแน่นอน (ครอบคลุมทั้งโฟลเดอร์ uploads และ templates)
        let filePath = "";
        const cleanPath = template.docxPath.replace(/^\//, ''); // เอา / ข้างหน้าออก
        
        if (cleanPath.startsWith('public/')) {
           filePath = path.join(process.cwd(), cleanPath);
        } else {
           filePath = path.join(process.cwd(), 'public', cleanPath);
        }

        console.log(`📂 Searching for file at: ${filePath}`);

        if (fs.existsSync(filePath)) {
            console.log("✅ File found! Extracting...");
            const fileBuffer = fs.readFileSync(filePath);
            
            // เรียกใช้สมองแกะตัวแปร
            const extracted = await extractFieldsFromDocx(fileBuffer);
            console.log(`🧩 Extracted Fields:`, extracted);

            if (extracted.length > 0) {
                // บันทึก Fields ใหม่ลง Database ทีละตัว (ปลอดภัยที่สุด)
                for (const fieldName of extracted) {
                    await db.insert(templateFields).values({
                        templateId: template.id,
                        name: fieldName,
                        label: fieldName,
                        type: 'text'
                    });
                }
                
                // ดึงข้อมูลขึ้นมาใหม่อีกรอบ
                fields = await db.select().from(templateFields).where(eq(templateFields.templateId, id));
                console.log(`✅ Auto-Repair Complete! Saved ${fields.length} fields to DB.`);
            } else {
                console.log("❌ Extractor found NO {tags} in the document.");
            }
        } else {
            console.log("❌ ERROR: File does not exist at path!");
        }
    }

    // ส่งข้อมูลกลับไปให้หน้าเว็บ
    const responseData = {
        ...template,
        fields: fields // ยัด fields ใส่เข้าไปให้ Frontend เอาไปสร้าง Input
    };

    console.log(`--- 🏁 END FETCHING (Sending ${fields.length} fields to UI) ---\n`);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json({ error: "Server Error", details: String(error) }, { status: 500 });
  }
}