export function formatThaiDate(date: string | Date | undefined | null, format: 'short' | 'full' = 'short'): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const thaiDays = [
    "วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"
  ];

  const day = d.getDate();
  const month = thaiMonths[d.getMonth()];
  const year = d.getFullYear() + 543;
  const weekday = thaiDays[d.getDay()];

  if (format === 'full') {
    // Output: วันศุกร์ที่ 6 มกราคม 2568
    return `${weekday}ที่ ${day} ${month} ${year}`;
  } else {
    // Output: 6 มกราคม 2568
    return `${day} ${month} ${year}`;
  }
}