import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import { DOMParser } from "xmldom";

export default function handler(req, res) {
  const { template } = req.query;
  if (!template) return res.status(400).json({ ok:false, error: "template query required" });

  try {
    const filePath = path.join(process.cwd(), "templates", template);
    if (!fs.existsSync(filePath)) return res.status(404).json({ ok:false, error: "template not found" });

    const content = fs.readFileSync(filePath, "binary");
    const zip = new PizZip(content);
    const xmlFile = zip.file("word/document.xml");
    if (!xmlFile) return res.json({ ok: true, fields: [] });

    const xml = xmlFile.asText();
    const doc = new DOMParser().parseFromString(xml, "text/xml");

    function collectText(node) {
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

    const allTexts = [];
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
    const found = new Set();
    const re = /{{\s*([^{}]+?)\s*}}|{\s*([^{}]+?)\s*}/g;
    let m;
    while ((m = re.exec(big)) !== null) {
      const v = (m[1] || m[2] || "").trim();
      if (v) found.add(v);
    }

    return res.json({ ok: true, fields: Array.from(found) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok:false, error: err.message });
  }
}
