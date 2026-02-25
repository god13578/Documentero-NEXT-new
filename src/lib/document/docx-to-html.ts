import mammoth from 'mammoth';
import fs from 'fs';

export async function docxToHtml(filePath: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath);
    
    // ใช้ Mammoth สกัด HTML พร้อมรักษาโครงสร้าง ตาราง รูปภาพ
    const result = await mammoth.convertToHtml({ buffer: buffer }, {
      styleMap: [
        "p[style-name='Page Break'] => div.page-break > hr", // รับรู้การแบ่งหน้า
        "table => table", // รับรู้ตาราง
        "tr => tr",
        "td => td",
      ],
      // แปลงรูปภาพใน Word ให้ออกมาแสดงบนเว็บได้เลย
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read("base64").then(function(imageBuffer) {
          return {
            src: "data:" + image.contentType + ";base64," + imageBuffer,
            style: "max-width: 100%; height: auto; margin: 10px auto; display: block;"
          };
        });
      })
    });

    return result.value;
  } catch (error) {
    console.error("Mammoth docxToHtml Error:", error);
    return `<div class="text-slate-400 text-center mt-20">ไม่สามารถแสดงภาพตัวอย่างได้</div>`;
  }
}