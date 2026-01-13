"use server";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function loginAction(formData: FormData) {
  const username = formData.get("username")?.toString();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { ok: false };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) {
    return { ok: false };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { ok: false };
  }

  createSession(user.id);

  return { ok: true };
}
