'use client';
import React, { useMemo } from 'react';

interface Props {
  htmlTemplate: string;
  values: Record<string, any>;
  onFieldClick: (field: string) => void;
}

export default function RealtimePreview({ htmlTemplate, values, onFieldClick }: Props) {
  
  // Memoize HTML generation with improved regex for whitespace handling
  const processedHtml = useMemo(() => {
    if (!htmlTemplate) return '';

    // Improved regex to handle potential whitespace inside braces: /\{\s*([^}]+)\s*\}/g
    // This replaces variables with styled spans that are clickable
    return htmlTemplate.replace(/\{\s*([^}]+)\s*\}/g, (match, key) => {
      const cleanKey = key.trim();
      const val = values[cleanKey];
      const display = val ? val : match; // Show value if exists, else show placeholder
      
      // Styling: Yellow highlight, cursor pointer
      const style = "background-color: #fef08a; border-bottom: 2px dashed #eab308; cursor: pointer; padding: 0 2px; border-radius: 2px;";
      
      return `<span class="preview-var-highlight" style="${style}" data-field="${cleanKey}">${display}</span>`;
    });
  }, [htmlTemplate, values]); // Only re-run when template or values change

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Check if clicked element is our variable highlight
    if (target.classList.contains('preview-var-highlight') || target.closest('.preview-var-highlight')) {
      const field = target.getAttribute('data-field') || target.closest('.preview-var-highlight')?.getAttribute('data-field');
      if (field) {
        onFieldClick(field);
      }
    }
  };

  return (
    <div 
      className="w-full min-h-full bg-white shadow-sm p-10 prose max-w-none"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: processedHtml || '<div class="text-center text-gray-400 mt-20">Loading Template...</div>' }}
    />
  );
}