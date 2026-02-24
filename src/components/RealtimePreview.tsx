'use client';
import React, { useMemo, useEffect, useRef } from 'react';

interface Props {
  htmlTemplate: string;
  values: any;
  focusedField: string | null;
}

export default function RealtimePreview({ htmlTemplate, values, focusedField }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // แปลง HTML Template ให้เป็น Live Preview
  const previewHtml = useMemo(() => {
    let output = htmlTemplate || "<div class='flex flex-col items-center justify-center h-full text-slate-300 mt-20 italic'>...ยังไม่มีข้อมูลตัวอย่าง...</div>";
    
    Object.keys(values).forEach(key => {
      // ถ้ามีค่า ให้แสดงค่า ถ้าไม่มี ให้แสดง [key] สีเทา
      const val = values[key] 
        ? `<span class='font-semibold text-blue-900'>${values[key]}</span>`
        : `<span class='text-slate-300 bg-slate-50 px-1 rounded select-none text-[0.9em]'>[${key}]</span>`;
      
      // ใส่ ID เพื่อให้ Jump ไปหาได้
      const regex = new RegExp(`{${key}}`, 'g');
      output = output.replace(regex, `<span id="preview-field-${key}" data-field="${key}" class="transition-all duration-300 decoration-clone inline-block border-b-2 border-transparent">${val}</span>`);
    });
    return output;
  }, [htmlTemplate, values]);

  // ระบบ Auto-Scroll และ Highlight
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Clear Old Highlights
    const allFields = containerRef.current.querySelectorAll('[data-field]');
    allFields.forEach((el: any) => {
      el.style.backgroundColor = 'transparent';
      el.style.borderColor = 'transparent';
      el.style.transform = 'scale(1)';
    });

    // 2. Apply New Highlight
    if (focusedField) {
      const target = containerRef.current.querySelector(`#preview-field-${focusedField}`);
      if (target) {
        // Scroll อย่างนุ่มนวล
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight Effect
        (target as HTMLElement).style.backgroundColor = '#fef9c3'; // yellow-100
        (target as HTMLElement).style.borderColor = '#eab308'; // yellow-500
        (target as HTMLElement).style.color = '#854d0e'; // yellow-900
        (target as HTMLElement).style.padding = '2px 4px';
        (target as HTMLElement).style.borderRadius = '4px';
        (target as HTMLElement).style.transform = 'scale(1.1)';
        (target as HTMLElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      }
    }
  }, [focusedField]);

  return (
    <div className="flex justify-center min-h-full pb-20 perspective-1000">
      {/* กระดาษ A4 */}
      <div className="bg-white w-[210mm] min-h-[297mm] p-[25mm] 
                      shadow-[0_20px_50px_rgba(0,0,0,0.1)] 
                      border border-slate-200/50 
                      text-black font-sarabun text-[16pt] leading-[1.6]
                      transition-transform duration-500 ease-out origin-top
                      ">
        <div 
          ref={containerRef}
          className="prose max-w-none break-words empty:hidden"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </div>
  );
}