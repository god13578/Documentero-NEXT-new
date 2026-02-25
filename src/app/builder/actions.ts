'use server';

import { db } from '@/lib/db/client';
import { documents, users, templates } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { generateDocx } from '@/lib/document/generator'; 

export async function saveDocument(templateId: string, fieldData: any, docName: string) {
  try {
    console.log("⏳ กำลังบันทึกเอกสาร:", docName);

    // 1. หา User (ระบบ Auto-User ที่เราทำไว้)
    const allUsers = await db.select().from(users).limit(1);
    let userId;
    if (allUsers.length > 0) {
      userId = allUsers[0].id;
    } else {
      const [newUser] = await db.insert(users).values({
        username: 'guest', password: 'password', role: 'admin',
      }).returning();
      userId = newUser.id;
    }

    // 2. สร้างไฟล์ Word เอาไปเก็บไว้บน Server เผื่อโหลดวันหลัง
    const [template] = await db.select().from(templates).where(eq(templates.id, templateId));
    if (!template) throw new Error("ไม่พบข้อมูลแม่แบบเอกสาร");
    
    const cleanPath = template.docxPath.replace(/^\//, ''); 
    const templatePath = path.join(process.cwd(), cleanPath.startsWith('public/') ? cleanPath : `public/${cleanPath}`);
    const templateBuffer = await fs.readFile(templatePath);
    
    // สั่งยัดข้อมูลลงไฟล์ Word
    const filledDocxBuffer = await generateDocx(templateBuffer, fieldData);
    
    // ตั้งชื่อไฟล์สุ่มและบันทึกลงโฟลเดอร์
    const docxFileName = `${Date.now()}-${randomUUID().slice(0,8)}.docx`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    await fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});
    await fs.writeFile(path.join(uploadsDir, docxFileName), filledDocxBuffer);

    // 3. บันทึกประวัติลง Database 
    // (ลองยัดทั้ง title และ name ไปเลย เพื่อป้องกัน Database Error จาก Schema ที่ต่างกัน)
    let newDocId;
    try {
        const [newDoc] = await db.insert(documents).values({
          templateId: templateId,
          userId: userId,
          title: docName, // Drizzle รุ่นใหม่มักใช้ title
          name: docName,  // Drizzle รุ่นเก่าใช้ name
          data: fieldData,
          docxPath: `/uploads/${docxFileName}` // เก็บที่อยู่ไฟล์ไว้ด้วย
        } as any).returning();
        newDocId = newDoc.id;
    } catch (dbError: any) {
        console.log("⚠️ DB Error (พยายามใช้ Schema สำรอง):", dbError.message);
        // ถ้าอันบนพัง (แปลว่าตารางไม่ได้สร้างเผื่อไว้) ให้ลอง Insert แบบ Basic
        const [newDoc] = await db.insert(documents).values({
           templateId: templateId,
           userId: userId,
           title: docName, // ใช้ title อย่างเดียว
           data: fieldData,
           docxPath: `/uploads/${docxFileName}`
        } as any).returning();
        newDocId = newDoc.id;
    }

    console.log("✅ บันทึกสำเร็จ ID:", newDocId);

    // 4. สั่งให้หน้า Dashboard รีเฟรชข้อมูลให้เห็นทันที
    revalidatePath('/dashboard');
    
    return { success: true, documentId: newDocId };

  } catch (error) {
    console.error("🔥 เกิดข้อผิดพลาดในการบันทึก:", error);
    return { success: false, error: String(error) };
  }
}