import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

/**
 * อ่าน {{field}} จากไฟล์ .docx
 */
export function extractFieldsFromDocx(buffer: Buffer): string[] {
  const zip = new PizZip(buffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // getTags() ให้ object แบบ { name: {}, position: {}, ... }
  const tags = doc.getTags();

  return Object.keys(tags);
}
