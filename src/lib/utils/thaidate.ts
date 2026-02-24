export const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export const THAI_MONTHS_ABBR = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

export function toThaiNumerals(num: number | string): string {
  const str = num.toString();
  return str.replace(/[0-9]/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[parseInt(d)]);
}

export function formatThaiDate(date: Date, useThaiNumerals = false): string {
  const day = date.getDate();
  const month = THAI_MONTHS[date.getMonth()];
  const year = date.getFullYear() + 543;

  let dayStr = day.toString();
  let yearStr = year.toString();

  if (useThaiNumerals) {
    dayStr = toThaiNumerals(dayStr);
    yearStr = toThaiNumerals(yearStr);
  }

  return `${dayStr} ${month} ${yearStr}`;
}

export function getCurrentThaiDate(): string {
  return formatThaiDate(new Date());
}
