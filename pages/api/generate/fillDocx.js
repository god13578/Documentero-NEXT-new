import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

/**
 * เติมข้อมูลลง Word template
 * @param {string} templateName - เช่น memo.docx
 * @param {object} fields - { เรื่อง: "...", เรียน: "..." }
 * @returns {Buffer} docx buffer
 */
export function fillDocx(templateName, fields) {
  const templatePath = path.join(
    process.cwd(),
    "templates",
    templateName
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template not found");
  }

  // อ่านไฟล์ Word
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  try {
    doc.render(fields);
  } catch (error) {
    console.error("DOCX render error:", error);
    throw new Error("DOCX template render failed");
  }

  const buffer = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return buffer;
}
