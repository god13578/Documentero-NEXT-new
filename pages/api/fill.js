import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export const config = {
  api: {
    bodyParser: { sizeLimit: "10mb" },
  },
};

function fillDocx(template, data) {
  const templatePath = path.join(process.cwd(), "templates", template);
  const content = fs.readFileSync(templatePath, "binary");

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true });

  doc.render(data);

  const buf = doc.getZip().generate({ type: "nodebuffer" });

  const outName = `${Date.now()}-${template}`;
  const outPath = path.join(process.cwd(), "public", "uploads", outName);

  fs.writeFileSync(outPath, buf);
  return outName;
}

export default async function handler(req, res) {
  try {
    const { template, data } = req.body;

    const fileName = fillDocx(template, data);

    return res.status(200).json({
      ok: true,
      docxUrl: `/uploads/${fileName}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(200).json({
      ok: false,
      error: err.message,
    });
  }
}
