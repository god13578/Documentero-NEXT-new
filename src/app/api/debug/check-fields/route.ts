import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templateFields } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Get all template fields
    const allFields = await db.select().from(templateFields);
    
    return NextResponse.json({
      totalFields: allFields.length,
      fields: allFields,
      templates: allFields.map(f => f.templateId)
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug failed" }, { status: 500 });
  }
}
