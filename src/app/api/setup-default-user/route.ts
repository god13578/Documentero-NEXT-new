import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';

export async function POST() {
  try {
    // Create default user
    await db.insert(users).values({
      id: 1,
      email: 'admin@example.com',
      password: 'password', // In production, use hashed password
      name: 'Admin User',
    }).onConflictDoNothing();

    return NextResponse.json({ success: true, message: 'Default user created' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
