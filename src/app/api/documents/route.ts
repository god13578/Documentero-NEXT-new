import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { documents, templates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const templateId = body?.templateId as string | undefined;
    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }

    const template = await db.query.templates.findFirst({ where: eq(templates.id, templateId) });
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const existing = await db.query.documents.findFirst({ where: eq(documents.id, templateId) });

    if (!existing) {
      await db.insert(documents).values({
        id: templateId,
        templateId,
        name: template.name,
        docxPath: template.docxPath,
        pdfPath: null,
        data: {},
      });
    }

    return NextResponse.json({ documentId: templateId });
  } catch (error) {
    console.error("Failed to create document from template", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
