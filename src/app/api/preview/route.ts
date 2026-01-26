import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import mammoth from "mammoth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("template") || searchParams.get("name");

  if (!templateId) {
    return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
  }

  try {
    // Get template from database - try by ID first, then by name
    let template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    // If not found by ID, try by name
    if (!template[0]) {
      template = await db
        .select()
        .from(templates)
        .where(eq(templates.name, templateId))
        .limit(1);
    }

    if (!template[0]) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Read template file
    const buffer = await fs.readFile(template[0].docxPath);
    
    // Convert to HTML
    const result = await mammoth.convertToHtml({ buffer });
    let html = result.value;

    // Apply THSarabun font style
    html = html.replace(
      /<body[^>]*>/,
      '<body style="font-family: THSarabun, sans-serif; font-size: 16px; line-height: 1.5;">'
    );

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });

  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("template");
  const { values } = await request.json();

  if (!templateId) {
    return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
  }

  try {
    // Get template from database
    const template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!template[0]) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Read template file
    const buffer = await fs.readFile(template[0].docxPath);
    
    // Convert to HTML
    const result = await mammoth.convertToHtml({ buffer });
    let html = result.value;

    // Replace placeholders with values
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      html = html.replace(regex, String(value || `{${key}}`));
    });

    // Apply THSarabun font style
    html = html.replace(
      /<body[^>]*>/,
      '<body style="font-family: THSarabun, sans-serif; font-size: 16px; line-height: 1.5;">'
    );

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });

  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
