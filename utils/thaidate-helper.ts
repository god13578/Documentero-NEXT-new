const THAI_MONTHS_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

export function formatThaiDate(dateString: string, type: 'full' | 'short' | 'iso' = 'iso'): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original if invalid

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear() + 543;

  if (type === 'full') {
    // 1 มกราคม 2569
    return `${day} ${THAI_MONTHS_FULL[month]} ${year}`;
  } else if (type === 'short') {
    // 1 ม.ค. 2568
    return `${day} ${THAI_MONTHS_SHORT[month]} ${year}`;
  }
  
  // Default ISO-like but Buddhist year (optional usage)
  return `${day}/${month + 1}/${year}`;
}

export function getCurrentDateISO(): string {
  return new Date().toISOString().split('T')[0];
}