import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SESSION_NAME = "doc_session";

export function createSession(userId: string) {
  cookies().set(SESSION_NAME, userId, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  });
}

export function getSession() {
  return cookies().get(SESSION_NAME)?.value;
}

export function destroySession() {
  cookies().delete(SESSION_NAME);
}
