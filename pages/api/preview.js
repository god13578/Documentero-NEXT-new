import fs from "fs";
import path from "path";
import mammoth from "mammoth";

export default async function handler(req, res) {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).send("Missing template name");

    const templatePath = path.join(
      process.cwd(),
      "templates",
      `${name}.docx`
    );

    if (!fs.existsSync(templatePath)) {
      return res.status(404).send("Template not found");
    }

    const result = await mammoth.convertToHtml({ path: templatePath });
    let html = result.value;

    /**
     * STEP 3.1 CORE
     * wrap {field} => span.doc-field
     * ใช้ regex แบบ conservative (ไม่กิน tag)
     */
    html = html.replace(/\{([^\}]+)\}/g, (m, field) => {
      const safe = field.trim();
      return `<span class="doc-field" data-field="${safe}">{${safe}}</span>`;
    });

    html = `
      <style>
        .doc-field {
          background: rgba(255, 230, 150, 0.45);
          padding: 1px 3px;
          border-radius: 3px;
          cursor: pointer;
          transition: background 0.15s, outline 0.15s;
        }
        .doc-field.active {
          background: rgba(255, 200, 80, 0.9);
          outline: 2px solid orange;
        }
      </style>

      <div class="doc-preview" style="
        font-family: Arial, sans-serif;
        padding: 40px;
        line-height: 1.6;
      ">
        ${html}
      </div>
    `;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Preview generation failed");
  }
}
