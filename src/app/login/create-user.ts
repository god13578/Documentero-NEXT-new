import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";

async function main() {
  const passwordHash = await hashPassword("1234");

  await db.insert(users).values({
    username: "staff",
    fullName: "เจ้าหน้าที่สำนักงาน",
    passwordHash,
  });

  console.log("สร้างผู้ใช้เรียบร้อย");
  process.exit(0);
}

main();
