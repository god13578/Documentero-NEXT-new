'use server';

import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { ok: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.username, username));

    if (!user) {
      return { ok: false, error: 'ชื่อผู้ใช้ไม่ถูกต้อง' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return { ok: false, error: 'รหัสผ่านไม่ถูกต้อง' };
    }

    createSession(user.id);

  } catch (error) {
    console.error('Login error:', error);
    return { ok: false, error: 'เกิดข้อผิดพลาดในระบบ' };
  }

  redirect('/');
}
