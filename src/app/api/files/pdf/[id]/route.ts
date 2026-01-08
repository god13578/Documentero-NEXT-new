import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, params.id),
  });

  if (!doc || !doc.pdfPath) {
    return new NextResponse("ไม่พบไฟล์ PDF", { status: 404 });
  }

  const buffer = await fs.readFile(doc.pdfPath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${doc.title}.pdf"`,
    },
  });
}
