import PizZip from "pizzip";

/**
 * ดึง {{field}} จากไฟล์ DOCX
 * - ไม่พึ่ง API ภายในของ docxtemplater
 * - เสถียร ใช้ได้ระยะยาว
 */
export function extractFieldsFromDocx(
  buffer: Buffer
): string[] {
  const zip = new PizZip(buffer);

  const documentXml =
    zip.files["word/document.xml"]?.asText();

  if (!documentXml) {
    return [];
  }

  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const fields = new Set<string>();

  let match;
  while ((match = regex.exec(documentXml)) !== null) {
    fields.add(match[1]);
  }

  return Array.from(fields);
}
