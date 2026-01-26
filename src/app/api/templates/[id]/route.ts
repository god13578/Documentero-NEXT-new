import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, params.id))
      .limit(1);

    if (!template[0]) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template[0]);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 });
  }
}
