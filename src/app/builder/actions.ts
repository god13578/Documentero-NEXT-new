'use server';

import { db } from '@/lib/db/client';
import { documents, users } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

// ฟังก์ชันบันทึกเอกสาร (ใครกดก็บันทึกได้เลย)
export async function saveDocument(templateId: string, fieldData: any, docName: string) {
  try {
    console.log("Saving document:", docName);

    // 1. หา User อัตโนมัติ (ระบบออโต้)
    // ดึง User คนแรกในระบบมาใช้ (เพื่อให้ผ่าน Constraint ของ Database)
    const allUsers = await db.select().from(users).limit(1);
    let userId;

    if (allUsers.length > 0) {
      userId = allUsers[0].id;
    } else {
      // ถ้าฐานข้อมูลว่างเปล่าจริงๆ ให้สร้าง User "Guest" ขึ้นมาเดี๋ยวนี้
      console.log("No user found, creating Guest user...");
      const [newUser] = await db.insert(users).values({
        username: 'guest_admin',
        password: 'password_bypass', // รหัสหลอกๆ
        role: 'admin', // ให้สิทธิ์เต็มที่ไปเลย
      }).returning();
      userId = newUser.id;
    }

    // 2. บันทึกข้อมูลลงตาราง documents
    const [newDoc] = await db.insert(documents).values({
      templateId: templateId,
      userId: userId, // ใช้ ID ที่เราหามาได้
      name: docName,
      data: fieldData, // เก็บข้อมูล JSON ที่กรอก
      status: 'completed',
    }).returning();

    console.log("Document saved with ID:", newDoc.id);

    // 3. รีเฟรชหน้า Dashboard ให้เห็นของใหม่ทันที
    revalidatePath('/dashboard');
    
    return { success: true, documentId: newDoc.id };

  } catch (error) {
    console.error("Save Error Details:", error);
    return { success: false, error: String(error) };
  }
}