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

function extractVariablesSuper(filePath: string): string[] {
  try {
    const content = require("fs").readFileSync(filePath, "binary");
    const zip = new PizZip(content);
    const xmlFile = (zip as any).file("word/document.xml");
    if (!xmlFile) return [];

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

    return Array.from(found);
  } catch (err) {
    console.error("extractVariablesSuper error:", err);
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    
    // Get template info from database first
    const { db } = await import("@/lib/db/client");
    const { templates } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    
    const templateRecord = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!templateRecord[0]) {
      return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });
    }

    const filePath = path.isAbsolute(templateRecord[0].docxPath)
      ? templateRecord[0].docxPath
      : path.join(process.cwd(), templateRecord[0].docxPath);

    // Extract variables from DOCX
    const variables = extractVariablesSuper(filePath);
    
    // Create schema from variables (like V1)
    const schema = variables.map((variable, index) => ({
      variable,
      label: variable,
      type: "text",
      order: index
    }));

    return NextResponse.json({
      ok: true,
      schema,
      version: 1,
      variables
    });
  } catch (error) {
    console.error("Error getting schema:", error);
    return NextResponse.json({ ok: false, error: "Failed to get schema" }, { status: 500 });
  }
}
