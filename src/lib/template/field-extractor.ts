import PizZip from 'pizzip';

export async function extractFieldsFromDocx(buffer: Buffer): Promise<string[]> {
  try {
    const zip = new PizZip(buffer);
    const matches = new Set<string>();
    
    // ค้นหาในไฟล์ XML ทั้งหมด (เพื่อเก็บ Field ที่อยู่ใน Header, Footer, และเนื้อหาหลัก)
    for (const filename of Object.keys(zip.files)) {
      if (filename.startsWith('word/') && filename.endsWith('.xml')) {
        const xmlContent = zip.file(filename)?.asText();
        if (xmlContent) {
          // 1. ลบ XML Tags ขยะทั้งหมด เพื่อให้ข้อความเชื่อมต่อกัน (เช่น <w:t>{</w:t><w:t>ชื่อ</w:t><w:t>}</w:t> กลายเป็น {ชื่อ})
          const plainText = xmlContent.replace(/<[^>]+>/g, '');
          
          // 2. ใช้ Regex ดึงคำที่อยู่ในปีกกา {}
          const regex = /\{([^{}]+)\}/g;
          let match;
          while ((match = regex.exec(plainText)) !== null) {
            // ตัดช่องว่างหน้า-หลังทิ้ง เช่น { เรียน } กลายเป็น เรียน
            const fieldName = match[1].trim();
            
            // 3. กรองข้อมูลที่ถูกต้อง (ไม่ว่าง, ยาวไม่เกิน 100 ตัวอักษร, ไม่มีเครื่องหมายแปลกๆ)
            if (fieldName && fieldName.length > 0 && fieldName.length < 100 && !fieldName.includes('=')) {
              matches.add(fieldName);
            }
          }
        }
      }
    }

    const result = Array.from(matches);
    console.log("🎯 Extracted Fields:", result); // โชว์ใน Terminal ว่าดึงอะไรมาได้บ้าง
    return result;
  } catch (error) {
    console.error("❌ Extraction error:", error);
    return []; // ถ้าพังก็ไม่ทำให้แอปแครช
  }
}