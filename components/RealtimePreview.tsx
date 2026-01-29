'use client';
import React, { useMemo } from 'react';

interface Props {
  htmlTemplate: string;
  values: Record<string, any>;
  onFieldClick: (field: string) => void;
}

export default function RealtimePreview({ htmlTemplate, values, onFieldClick }: Props) {
  
  // Replace {variable} with styled spans instantly
  const processedHtml = useMemo(() => {
    if (!htmlTemplate) return '';

    // Regex to find { variable } ignoring inner tags
    return htmlTemplate.replace(/\{{1,2}((?:[^{}]|&nbsp;|<[^>]+>)*?)\}{1,2}/g, (match, rawKey) => {
      const cleanKey = rawKey.replace(/<[^>]+>|&nbsp;/g, '').trim();
      if (!cleanKey) return match;

      const val = values[cleanKey];
      const isFilled = val !== undefined && val !== null && val !== '';
      const display = isFilled ? val : `{${cleanKey}}`;
      const className = `doc-field ${isFilled ? 'filled' : ''}`;

      return `<span class="${className}" data-field="${cleanKey}">${display}</span>`;
    });
  }, [htmlTemplate, values]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const fieldElem = target.closest('.doc-field');
    if (fieldElem) {
      const field = fieldElem.getAttribute('data-field');
      if (field) {
        e.preventDefault();
        onFieldClick(field);
      }
    }
  };

  return (
    <div className="w-full bg-gray-200 py-10 px-4 flex justify-center min-h-full">
      {/* The Paper */}
      <div 
        className="document-page"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: processedHtml || '<div class="text-center text-gray-400 mt-10">Generating Preview...</div>' }}
      />
    </div>
  );
}