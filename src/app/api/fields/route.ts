import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import { DOMParser } from "xmldom";

function collectText(node: any): string {
  let out = "";
  const children = node.childNodes || [];
  for (let i = 0; i < children.length; i++) {
    const ch = children[i];
    if (ch.nodeType === 1 && (ch.localName === "t" || String(ch.nodeName).endsWith(":t"))) {
      out += ch.textContent || "";
    } else if (ch.childNodes && ch.childNodes.length) {
      out += collectText(ch);
    }
  }
  return out;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template") || searchParams.get("templateId");

  if (!template) {
    return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
  }

  try {
    // Find template path from DB (by id or name)
    const { db } = await import("@/lib/db/client");
    const { templates } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    let templateRecord = await db
      .select()
      .from(templates)
      .where(eq(templates.id, template))
      .limit(1);

    if (!templateRecord[0]) {
      templateRecord = await db
        .select()
        .from(templates)
        .where(eq(templates.name, template))
        .limit(1);
    }

    let filePath: string | null = null;
    if (templateRecord[0]?.docxPath) {
      filePath = path.isAbsolute(templateRecord[0].docxPath)
        ? templateRecord[0].docxPath
        : path.join(process.cwd(), templateRecord[0].docxPath);
    }

    if (!filePath) {
      return NextResponse.json({ fields: [] }); // Return empty instead of error
    }

    // Read and parse DOCX file (old method)
    const content = await fs.readFile(filePath, "binary");
    const zip = new PizZip(content);
    const xmlFile = (zip as any).file("word/document.xml");
    if (!xmlFile) return NextResponse.json({ fields: [] });

    const xml = xmlFile.asText();
    const doc = new DOMParser().parseFromString(xml, "text/xml");

    const allTexts: string[] = [];
    const pNodes = doc.getElementsByTagName("w:p");
    for (let i = 0; i < pNodes.length; i++) {
      const p = pNodes[i];
      const t = collectText(p).replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
      if (t) allTexts.push(t);
    }
    const sdtNodes = doc.getElementsByTagName("w:sdt");
    for (let i = 0; i < sdtNodes.length; i++) {
      const t = collectText(sdtNodes[i]).replace(/\s+/g, " ").trim();
      if (t) allTexts.push(t);
    }

    const big = allTexts.join("\n");
    const found = new Set<string>();
    const re = /{{\s*([^{}]+?)\s*}}|{\s*([^{}]+?)\s*}/g;
    let m;
    while ((m = re.exec(big)) !== null) {
      const v = (m[1] || m[2] || "").trim();
      if (v) found.add(v);
    }

    return NextResponse.json({ fields: Array.from(found) });
  } catch (error) {
    console.error("Error extracting fields:", error);
    return NextResponse.json({ fields: [] }); // Return empty instead of error
  }
}
