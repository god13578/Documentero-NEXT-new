import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { templates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";

// UX constants from old project
const A4_HEIGHT_PX = 1122;
const PAGE_PADDING_PX = 96;
const CONTENT_MAX_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_PX;

function splitByPageBreak(html: string) {
  return html.split(
    /<p[^>]*page-break-after\s*:\s*always[^>]*><\/p>/i
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("template") || searchParams.get("name");

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    // Get template from database - try by ID first, then by name
    let template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

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

    // Read template file (support relative paths from DB)
    const docxPath = path.isAbsolute(template[0].docxPath)
      ? template[0].docxPath
      : path.join(process.cwd(), template[0].docxPath);
    const buffer = await fs.readFile(docxPath);

    // 1) DOCX -> HTML (structure first)
    const result = await mammoth.convertToHtml({ buffer });
    let html = result.value;

    // 2) Wrap fields (STEP 3 compatible)
    html = html.replace(/\{([^\}]+)\}/g, (_, field) => {
      const safe = field.trim();
      return `<span class="doc-field" data-field="${safe}">{${safe}}</span>`;
    });

    // 3) Split by real Word page breaks
    const logicalPages = splitByPageBreak(html);

    // 4) UX fallback page splitting
    const wrappedPages = logicalPages.map((pageHtml) => {
      return `
        <div class="page">
          <div class="page-content">
            ${pageHtml}
          </div>
        </div>
      `;
    });

    // 5) Final HTML with UX-first styles
    const finalHtml = `
      <style>
        /* ---------- Base ---------- */
        body {
          margin: 0;
          padding: 20px 0;
          background: #f2f2f2;
        }

        /* ---------- Page ---------- */
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 12px auto;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.15);
          box-sizing: border-box;
          padding: 25mm 20mm 25mm 30mm;
        }

        /* ---------- Content ---------- */
        .page-content {
          font-family: "TH Sarabun New", "Sarabun", Arial, sans-serif;
          font-size: 16pt;
          line-height: 1.6;
          color: #000;
          column-width: 210mm;
          column-gap: 0;
        }

        p {
          margin: 0 0 8px 0;
        }

        /* ---------- Images ---------- */
        img {
          max-width: 110px;
          height: auto;
          display: block;
          margin: 0 auto 8px auto;
        }

        /* ---------- Fields ---------- */
        .doc-field {
          background: rgba(255, 235, 160, 0.25);
          padding: 1px 3px;
          border-radius: 3px;
          cursor: pointer;
          transition: background 120ms ease, box-shadow 120ms ease;
        }

        .doc-field:hover {
          background: rgba(255, 220, 120, 0.35);
        }

        .doc-field.active {
          background: rgba(255, 200, 90, 0.7);
          box-shadow: 0 0 0 2px rgba(255, 170, 60, 0.6);
        }
      </style>

      ${wrappedPages.join("\n")}
    `;

    return new NextResponse(finalHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });

  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
