import { db } from '../src/lib/db/client';
import { users } from '../src/lib/db/schema';
import { hashPassword } from '../src/lib/auth/password';

async function main() {
  console.log('🌱 Creating admin user...');
  
  const password = await hashPassword('admin1234');

  try {
    await db.insert(users).values({
      username: 'admin',
      passwordHash: password,
      fullName: 'ผู้ดูแลระบบ',
      role: 'admin',
    });
    console.log('✅ User "admin" created successfully!');
  } catch (e) {
    console.error('❌ Error creating user:', e);
  }
  process.exit(0);
}

main();
