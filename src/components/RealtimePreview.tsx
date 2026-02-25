'use client';
import React, { useMemo, useEffect, useRef } from 'react';

interface Props {
  htmlTemplate: string;
  values: any;
  focusedField: string | null;
  onFieldClick?: (fieldName: string) => void;
}

export default function RealtimePreview({ htmlTemplate, values, focusedField, onFieldClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const previewHtml = useMemo(() => {
    if (!htmlTemplate) return "<div class='text-center text-slate-400 mt-20'>กำลังเตรียมเอกสาร...</div>";
    
    let output = htmlTemplate;

    Object.keys(values).forEach(key => {
      const val = values[key] 
        ? `<span class='font-bold text-black'>${values[key]}</span>`
        : `<span class='text-slate'>[${key}]</span>`;
      
      const regex = new RegExp(`{${key}}`, 'g');
      output = output.replace(regex, `<span data-field="${key}" class="preview-hl bg-[#fef08a] cursor-pointer hover:bg-[#fde047] transition-all duration-300 rounded px-1 inline-block">${val}</span>`);
    });

    output = output.replace(/<p><\/p>/g, '<p><br/></p>');
    output = output.replace(/<p>\s*<\/p>/g, '<p><br/></p>');

    return output;
  }, [htmlTemplate, values]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const allFields = containerRef.current.querySelectorAll('.preview-hl');
    allFields.forEach((el: any) => {
      el.style.backgroundColor = '#fef08a';
      el.style.transform = 'scale(1)';
      el.style.boxShadow = 'none';
      el.style.zIndex = '0';
    });

    if (focusedField) {
      const targets = containerRef.current.querySelectorAll(`[data-field="${focusedField}"]`);
      targets.forEach((target: any) => {
        target.style.backgroundColor = '#facc15'; 
        target.style.transform = 'scale(1.1)'; 
        target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)';
        target.style.zIndex = '10';
        target.style.position = 'relative';
      });
    }
  }, [focusedField]);

  const handlePreviewClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const fieldSpan = target.closest('.preview-hl');
    if (fieldSpan && onFieldClick) {
      const fieldName = fieldSpan.getAttribute('data-field');
      if (fieldName) onFieldClick(fieldName);
    }
  };

  return (
    // 🌟 เพิ่ม print:block print:p-0 เข้าไปเพื่อไม่ให้เบราว์เซอร์ค้าง
    <div className="flex justify-center w-full min-h-full pb-20 pt-8 print:block print:p-0 print:m-0 print:bg-white">
      <div 
        className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-[0_15px_35px_rgba(0,0,0,0.15)] text-black font-sarabun text-[16pt] print:shadow-none print:w-full print:min-h-0 print:p-0 print:m-0"
        onClick={handlePreviewClick}
      >
        <div 
          ref={containerRef}
          className="prose max-w-none break-words leading-relaxed
                     prose-p:my-1 prose-p:min-h-[1.5em]
                     prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-black prose-table:my-4
                     prose-td:border prose-td:border-black prose-td:p-2 prose-td:align-top
                     prose-img:max-h-[110px] prose-img:w-auto prose-img:mx-auto prose-img:my-2
                     [&_.page-break]:my-8 [&_.page-break_hr]:border-dashed [&_.page-break_hr]:border-slate-300 print:[&_.page-break]:break-after-page print:[&_.page-break_hr]:hidden"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </div>
  );
}