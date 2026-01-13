import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";

async function main() {
  const passwordHash = await hashPassword("1234");

  await db.insert(users).values({
    username: "staff",
    passwordHash,
    fullName: "เจ้าหน้าที่ระบบ",
  });

  console.log("User created: staff / 1234");
  process.exit(0);
}

main();
