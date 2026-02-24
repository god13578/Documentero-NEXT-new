/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ชี้ไปที่ src (สำคัญมาก เพราะเราย้ายไฟล์มานี่แล้ว)
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    
    // เผื่อไฟล์เก่าที่ยังหลงเหลือ
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // เพิ่มฟอนต์สารบรรณ
        sarabun: ['var(--font-sarabun)', 'sans-serif'],
      },
    },
  },
  plugins: [
    // เรียกใช้ปลั๊กอินที่เราเพิ่งลงไปในข้อ 1
    require('@tailwindcss/typography'),
  ],
};