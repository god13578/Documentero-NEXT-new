'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { formatThaiDate } from '../utils/thaidate-helper';
import { FieldConfigMap } from './DynamicFieldBuilder';

interface RealtimePreviewProps {
  htmlTemplate: string; // The raw HTML from docx-to-html (still contains {{keys}})
  values: Record<string, any>;
  fieldConfig: FieldConfigMap;
  onFieldClick: (field: string) => void;
  hoveredField?: string | null;
}

export default function RealtimePreview({ 
  htmlTemplate, 
  values, 
  fieldConfig,
  onFieldClick,
  hoveredField 
}: RealtimePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Process HTML: Inject values and wrapper spans
  const processedHtml = useMemo(() => {
    if (!htmlTemplate) return '';

    // Regex to find {{variable}}
    // We replace it with <span data-field="variable" class="...">CurrentValue</span>
    return htmlTemplate.replace(/\{([^}]+)\}/g, (match, p1) => {
      const fieldName = p1.trim();
      let value = values[fieldName];

      // Format value based on config
      const config = fieldConfig[fieldName];
      
      if (value) {
        if (config?.type === 'date') {
          value = formatThaiDate(value, 'short');
        } else if (config?.type === 'fulldate') {
          value = formatThaiDate(value, 'full');
        }
      }

      const displayValue = value || match; // Show {{key}} if empty, or show value
      const isFilled = !!value;

      // Class for styling
      // bg-yellow-200 for highlighting fields
      // hover:bg-yellow-400 for interaction
      const classes = `
        doc-field 
        ${isFilled ? 'bg-yellow-100 text-black' : 'bg-yellow-300 text-gray-700'} 
        ${hoveredField === fieldName ? 'bg-orange-400 text-white font-bold' : ''}
        px-1 rounded cursor-pointer 
        border-b-2 border-yellow-400
        hover:bg-yellow-400 transition-colors
        inline-block min-w-[30px] text-center
      `;

      return `<span 
        data-field="${fieldName}" 
        class="${classes}"
        title="แก้ไข ${fieldName}"
      >${displayValue}</span>`;
    });
  }, [htmlTemplate, values, fieldConfig, hoveredField]);

  // Attach event listeners for Click-to-Edit
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const field = target.getAttribute('data-field');
      if (field) {
        e.stopPropagation();
        onFieldClick(field);
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [onFieldClick, processedHtml]);

  // Add global styles for the preview content to ensure it looks like a document
  return (
    <div className="w-full h-full overflow-auto bg-gray-100">
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg min-h-[297mm]" style={{ 
        padding: '25mm 20mm 25mm 30mm',
        boxSizing: 'border-box',
        margin: '12px auto'
      }}>
        <div 
          ref={containerRef}
          className="document-content"
          style={{
            fontFamily: '"TH Sarabun New", "Sarabun", Arial, sans-serif',
            fontSize: '16pt',
            lineHeight: '1.6',
            color: '#000',
            columnWidth: '210mm',
            columnGap: '0'
          }}
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
        
        {/* Override component styles with API styles */}
        <style jsx global>{`
          .document-content p {
            margin: 0 0 8px 0;
          }
          
          .document-content table {
            border-collapse: collapse;
            width: 100%;
          }
          
          .document-content td, .document-content th {
            border: 1px solid black;
            padding: 4px 8px;
          }
          
          .document-content img {
            max-width: 110px;
            height: auto;
            display: block;
            margin: 0 auto 8px auto;
          }
          
          /* Word-like field styling */
          .doc-field {
            background: rgba(255, 235, 160, 0.25) !important;
            padding: 1px 3px !important;
            border-radius: 3px !important;
            cursor: pointer !important;
            transition: background 120ms ease, box-shadow 120ms ease !important;
          }
          
          .doc-field:hover {
            background: rgba(255, 220, 120, 0.35) !important;
          }
          
          .doc-field.bg-orange-400 {
            background: rgba(255, 200, 90, 0.7) !important;
            box-shadow: 0 0 0 2px rgba(255, 170, 60, 0.6) !important;
          }
        `}</style>
      </div>
    </div>
  );
}