import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("doc_session");
  const { pathname } = req.nextUrl;

  // อนุญาตหน้า login
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // ยังไม่ login → ส่งไป login
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // login แล้ว → ใช้ต่อได้
  return NextResponse.next();
}
