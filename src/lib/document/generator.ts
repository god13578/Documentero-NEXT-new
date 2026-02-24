import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export async function generateDocx(templateBuffer: Buffer, data: any): Promise<Buffer> {
  try {
    const zip = new PizZip(templateBuffer);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Render document (replace {placeholders} with data)
    doc.setData(data);
    doc.render();

    // Generate the output buffer
    const output = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    return output;
  } catch (error: any) {
    console.error("Docxtemplater Error:", error);
    if (error.properties && error.properties.errors) {
        error.properties.errors.forEach((e: any) => console.error(e));
    }
    throw new Error("Failed to generate document: " + error.message);
  }
}

// Placeholder for PDF generation call (we will connect to API later)
// This function assumes you have a separate service or API to convert Docx to PDF
export async function generatePdf(docxBuffer: Buffer): Promise<Buffer> {
    // For now, let's return DOCX buffer or implement a mock
    // In a real scenario, you'd call Gotenberg or LibreOffice here
    // This is just a placeholder to prevent build errors
    return docxBuffer; 
}
