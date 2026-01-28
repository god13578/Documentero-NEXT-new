'use client';
import React, { useMemo } from 'react';

interface Props {
  htmlTemplate: string;
  values: Record<string, any>;
  onFieldClick: (field: string) => void;
}

export default function RealtimePreview({ htmlTemplate, values, onFieldClick }: Props) {
  
  // Magic Function: Replace {var} with highlightable <span>
  const processedHtml = useMemo(() => {
    if (!htmlTemplate) return '';

    // Regex handles {var} and {{var}}
    return htmlTemplate.replace(/\{{1,2}([^}]+)\}{1,2}/g, (match, key) => {
      const cleanKey = key.trim();
      const val = values[cleanKey];
      
      // If user typed something, show it. Otherwise show placeholder {key}
      const displayText = val ? val : match;
      
      // Styling: 
      // - Yellow background + Dashed underline = Field
      // - Hover effect = Clickable
      return `<span 
        class="field-highlight cursor-pointer bg-yellow-200/50 border-b-2 border-yellow-400 hover:bg-yellow-300 text-gray-900 px-1 rounded transition-colors"
        data-field="${cleanKey}"
        title="Click to edit ${cleanKey}"
      >${displayText}</span>`;
    });
  }, [htmlTemplate, values]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Check if clicked element is our special span (or inside it)
    const fieldSpan = target.closest('.field-highlight');
    if (fieldSpan) {
      const fieldName = fieldSpan.getAttribute('data-field');
      if (fieldName) {
        onFieldClick(fieldName);
      }
    }
  };

  if (!htmlTemplate) return <div className="p-10 text-center text-gray-400">Generating Preview...</div>;

  return (
    <div 
      className="w-full min-h-[1000px] bg-white shadow-lg p-[50px] prose max-w-none"
      onClick={handleClick}
      // Use standard prose styling but allow our custom spans
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}