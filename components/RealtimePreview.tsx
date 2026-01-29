'use client';
import React, { useMemo } from 'react';

interface Props {
  htmlTemplate: string;
  values: Record<string, any>;
  onFieldClick: (field: string) => void;
  focusedField?: string | null;
}

export default function RealtimePreview({ htmlTemplate, values, onFieldClick, focusedField }: Props) {
  const processedHtml = useMemo(() => {
    if (!htmlTemplate) return '';
    // Regex matches {var}, { var }, {{var}}, and allows HTML tags inside braces
    return htmlTemplate.replace(/\{{1,2}((?:[^{}]|&nbsp;|<[^>]+>)*?)\}{1,2}/g, (match, rawKey) => {
      const cleanKey = rawKey.replace(/<[^>]+>|&nbsp;/g, '').trim();
      if (!cleanKey) return match;

      const val = values[cleanKey];
      const isFilled = val !== undefined && val !== null && val !== '';
      const display = isFilled ? val : `{${cleanKey}}`;
      const isFocused = focusedField === cleanKey;
      
      // Add focused class for highlighting
      const className = `doc-field ${isFilled ? 'filled' : ''} ${isFocused ? 'focused' : ''}`;

      return `<span class="${className}" data-field="${cleanKey}">${display}</span>`;
    });
  }, [htmlTemplate, values, focusedField]);

  const handleClick = (e: React.MouseEvent) => {
    const field = (e.target as HTMLElement).closest('.doc-field')?.getAttribute('data-field');
    if (field) {
      e.preventDefault();
      onFieldClick(field);
    }
  };

  return (
    <div className="w-full bg-gray-200/80 py-8 flex justify-center min-h-full">
      <div 
        className="document-page"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: processedHtml || '<div class="text-gray-400 text-center mt-20">Loading...</div>' }}
      />
    </div>
  );
}