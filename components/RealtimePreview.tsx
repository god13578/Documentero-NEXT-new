'use client';
import React, { useMemo } from 'react';

interface Props {
  htmlTemplate: string;
  values: Record<string, any>;
  onFieldClick: (field: string) => void;
}

export default function RealtimePreview({ htmlTemplate, values, onFieldClick }: Props) {
  
  // This memoized function replaces {placeholders} with <span class="doc-field"> instantly
  const processedHtml = useMemo(() => {
    if (!htmlTemplate) return '';

    // Regex to match { variable } or {{ variable }}
    return htmlTemplate.replace(/\{{1,2}\s*([^{}<>]+?)\s*\}{1,2}/g, (match, key) => {
      const cleanKey = key.trim().replace(/&nbsp;/g, '');
      const val = values[cleanKey];
      const isFilled = val !== undefined && val !== null && val !== '';
      
      // Determine display text
      const displayText = isFilled ? val : `{${cleanKey}}`;
      const className = `doc-field ${isFilled ? 'filled' : ''}`;

      return `<span class="${className}" data-field="${cleanKey}">${displayText}</span>`;
    });
  }, [htmlTemplate, values]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const fieldElem = target.closest('.doc-field');
    if (fieldElem) {
      e.preventDefault();
      const field = fieldElem.getAttribute('data-field');
      if (field) onFieldClick(field);
    }
  };

  return (
    <div className="w-full bg-gray-100 py-10 px-4 flex justify-center min-h-full overflow-y-auto">
      <div 
        className="document-page"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: processedHtml || '<div class="text-center text-gray-400 mt-20">Loading Template...</div>' }}
      />
    </div>
  );
}