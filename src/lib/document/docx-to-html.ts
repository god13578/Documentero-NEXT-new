import mammoth from "mammoth";
import fs from "fs/promises";

export async function docxToHtml(
  docxPath: string
): Promise<string> {
  const buffer = await fs.readFile(docxPath);

  const result = await mammoth.convertToHtml(
    { buffer },
    {
      styleMap: [
        "p => p",
      ],
    }
  );

  return result.value;
}
