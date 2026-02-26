'use server';

import { db } from '@/lib/db/client';
import { documents, users, templates, templateFields } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { generateDocx } from '@/lib/document/generator'; 

// 1. ฟังก์ชันบันทึกเอกสารใหม่
export async function saveDocument(templateId: string, fieldData: any, docName: string) {
  try {
    const allUsers = await db.select().from(users).limit(1);
    let userId = allUsers.length > 0 ? allUsers[0].id : null;
    
    if (!userId) {
      const [newUser] = await db.insert(users).values({ username: 'guest', password: 'password', role: 'admin' }).returning();
      userId = newUser.id;
    }

    const [template] = await db.select().from(templates).where(eq(templates.id, templateId));
    if (!template) throw new Error("ไม่พบข้อมูลแม่แบบเอกสาร");
    
    const cleanPath = template.docxPath.replace(/^\//, ''); 
    const templatePath = path.join(process.cwd(), cleanPath.startsWith('public/') ? cleanPath : `public/${cleanPath}`);
    const templateBuffer = await fs.readFile(templatePath);
    
    const filledDocxBuffer = await generateDocx(templateBuffer, fieldData);
    
    const docxFileName = `${Date.now()}-${randomUUID().slice(0,8)}.docx`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});
    await fs.writeFile(path.join(uploadsDir, docxFileName), filledDocxBuffer);

    let newDocId;
    try {
        const [newDoc] = await db.insert(documents).values({
          templateId: templateId, userId: userId, title: docName, name: docName, data: fieldData, docxPath: `/uploads/${docxFileName}`
        } as any).returning();
        newDocId = newDoc.id;
    } catch (dbError) {
        const [newDoc] = await db.insert(documents).values({
           templateId: templateId, userId: userId, title: docName, data: fieldData, docxPath: `/uploads/${docxFileName}`
        } as any).returning();
        newDocId = newDoc.id;
    }

    revalidatePath('/dashboard');
    return { success: true, documentId: newDocId };
  } catch (error) {
    console.error("Save Error:", error);
    return { success: false, error: String(error) };
  }
}

// 🌟 2. ฟังก์ชันอัปเดตเอกสารเดิม (Save ทับ)
export async function updateDocument(documentId: string, fieldData: any) {
  try {
    const doc = await db.query.documents.findFirst({ where: eq(documents.id, documentId), with: { template: true } });
    if (!doc) throw new Error("ไม่พบเอกสารเดิม");

    const cleanPath = doc.template.docxPath.replace(/^\//, ''); 
    const templatePath = path.join(process.cwd(), cleanPath.startsWith('public/') ? cleanPath : `public/${cleanPath}`);
    const templateBuffer = await fs.readFile(templatePath);
    
    const filledDocxBuffer = await generateDocx(templateBuffer, fieldData);
    
    const docxFileName = doc.docxPath ? path.basename(doc.docxPath) : `${Date.now()}-updated.docx`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});
    await fs.writeFile(path.join(uploadsDir, docxFileName), filledDocxBuffer);

    await db.update(documents).set({ data: fieldData, docxPath: `/uploads/${docxFileName}` }).where(eq(documents.id, documentId));
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// 🌟 3. ฟังก์ชันบันทึกการตั้งค่า Input (เฟืองตั้งค่า)
export async function updateFieldConfig(fieldId: string, type: string, options: string[]) {
  try {
    await db.update(templateFields).set({ type: type, options: options }).where(eq(templateFields.id, fieldId));
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}