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

  if (!doc) {
    return new NextResponse("ไม่พบเอกสาร", { status: 404 });
  }

  const buffer = await fs.readFile(doc.docxPath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${doc.title}.docx"`,
    },
  });
}
