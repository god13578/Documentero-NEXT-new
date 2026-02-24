import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates, users, templateFields } from "@/lib/db/schema";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import { extractFieldsFromDocx } from "@/lib/template/field-extractor"; 

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // 1. หา User (Guest Admin)
    let user = await db.query.users.findFirst();
    if (!user) {
      // ถ้าไม่มี User สร้างใหม่เลย
      const [newUser] = await db.insert(users).values({
        username: 'admin', password: 'password', role: 'admin'
      }).returning();
      user = newUser;
    }

    // 2. เตรียม Folder
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), "public/templates");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    // 3. บันทึก Template ลง DB
    const [newTemplate] = await db.insert(templates).values({
      userId: user.id,
      name: name || file.name,
      docxPath: `/templates/${filename}`,
    }).returning();

    // 4. แกะ Field และบันทึกทันที (สำคัญมาก! อันนี้จะทำให้ Input ขึ้น)
    const fields = await extractFieldsFromDocx(buffer);
    
    if (fields.length > 0) {
      await db.insert(templateFields).values(
        fields.map(f => ({
          templateId: newTemplate.id,
          name: f,
          label: f,
          type: 'text'
        }))
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// เพิ่ม GET เพื่อให้หน้า Dashboard ดึงข้อมูลได้
export async function GET() {
    const allTemplates = await db.query.templates.findMany({
        orderBy: (templates, { desc }) => [desc(templates.createdAt)],
    });
    return NextResponse.json(allTemplates);
}