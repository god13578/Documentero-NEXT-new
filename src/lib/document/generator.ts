import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export async function generateDocx(
  templatePath: string,
  data: Record<string, any>,
  outputPath: string
) {
  const content = await fs.readFile(templatePath);
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.setData(data);

  try {
    doc.render();
  } catch (error) {
    throw new Error("ไม่สามารถสร้างเอกสารได้");
  }

  const buffer = doc.getZip().generate({
    type: "nodebuffer",
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);
}
