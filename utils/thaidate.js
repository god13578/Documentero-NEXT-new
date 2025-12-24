// utils/thaidate.js
export function toThaiDateString(dateInput) {
  // dateInput: Date object or ISO string or 'YYYY-MM-DD'
  const monthsThai = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  let d;
  if (!dateInput) return "";
  if (typeof dateInput === "string") d = new Date(dateInput);
  else if (dateInput instanceof Date) d = dateInput;
  else d = new Date(dateInput);

  if (isNaN(d.getTime())) return "";

  const day = d.getDate();
  const month = monthsThai[d.getMonth()];
  const yearBE = d.getFullYear() + 543;
  return `${day} ${month} พ.ศ. ${yearBE}`;
}

// ตัวช่วย แปลง string dd/mm/yyyy หรือ yyyy-mm-dd -> Date
export function parseDateFlexible(str) {
  if (!str) return null;
  // try ISO first
  const iso = new Date(str);
  if (!isNaN(iso.getTime())) return iso;
  // try dd/mm/yyyy or d/m/yyyy
  const m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    let dd = parseInt(m[1],10), mm = parseInt(m[2],10)-1, yy = parseInt(m[3],10);
    if (yy < 100) { yy += 2000; }
    return new Date(yy, mm, dd);
  }
  return null;
}
