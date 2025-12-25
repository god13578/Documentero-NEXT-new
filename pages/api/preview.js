import fs from "fs";
import path from "path";
import mammoth from "mammoth";

/**
 * UX constants
 * เราใช้เป็น "ประมาณการ" ไม่ใช่ Word engine
 */
const A4_HEIGHT_PX = 1122; // ~297mm ที่ 96dpi
const PAGE_PADDING_PX = 96; // padding บน-ล่างรวม
const CONTENT_MAX_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_PX;

/**
 * Split HTML by Word Page Break (Ctrl+Enter)
 */
function splitByPageBreak(html) {
  // mammoth มักแปลง page break เป็น <p style="page-break-after:always">
  return html.split(
    /<p[^>]*page-break-after\s*:\s*always[^>]*><\/p>/i
  );
}

export default async function handler(req, res) {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).send("Missing template name");
    }

    const templatePath = path.join(
      process.cwd(),
      "templates",
      `${name}.docx`
    );

    if (!fs.existsSync(templatePath)) {
      return res.status(404).send("Template not found");
    }

    // 1) DOCX -> HTML (structure first)
    const result = await mammoth.convertToHtml({
      path: templatePath,
    });

    let html = result.value;

    // 2) Wrap fields (STEP 3 compatible)
    html = html.replace(/\{([^\}]+)\}/g, (_, field) => {
      const safe = field.trim();
      return `<span class="doc-field" data-field="${safe}">{${safe}}</span>`;
    });

    // 3) Split by real Word page breaks
    const logicalPages = splitByPageBreak(html);

    /**
     * 4) UX fallback page splitting
     * เราจะไม่คำนวณ text จริงใน server
     * แต่จะใช้ client-side CSS column trick
     * เพื่อ "ตัดสายตา" ให้ user เข้าใจว่ามีหลายหน้า
     */
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

          /* UX fallback:
             ถ้าเนื้อหายาวเกินหน้า
             จะถูก flow ต่อไปในหน้าใหม่ทางสายตา */
          column-width: 210mm;
          column-gap: 0;
        }

        p {
          margin: 0 0 8px 0;
        }

        /* ---------- Images (ครุฑ / โลโก้) ---------- */
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
          transition:
            background 120ms ease,
            box-shadow 120ms ease;
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

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(finalHtml);
  } catch (err) {
    console.error(err);
    res.status(500).send("Preview generation failed");
  }
}
