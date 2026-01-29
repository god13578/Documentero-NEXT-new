'use client';
import React, { useMemo } from 'react';

interface Props {
  htmlTemplate: string;
  values: Record<string, any>;
  onFieldClick: (field: string) => void;
}

export default function RealtimePreview({ htmlTemplate, values, onFieldClick }: Props) {
  
  const processedHtml = useMemo(() => {
    if (!htmlTemplate) return '';

    // Advanced Regex: Matches { content } allowing HTML tags inside (e.g. <b>{</b> var <b>}</b>)
    // Capture group 1 is the content inside braces
    return htmlTemplate.replace(/\{{1,2}((?:[^{}]|&nbsp;|<[^>]+>)*?)\}{1,2}/g, (match, rawKey) => {
      // Strip HTML tags from the key to get the variable name
      const cleanKey = rawKey.replace(/<[^>]+>|&nbsp;/g, '').trim();
      
      // If empty or just symbols, ignore
      if (!cleanKey || cleanKey.length === 0) return match;

      const val = values[cleanKey];
      const isFilled = val !== undefined && val !== null && val !== '';
      
      // Display: Value (if filled) OR Original Match (if empty)
      // Note: We use 'match' to preserve original formatting (bold/italic) inside the bracket if user hasn't typed yet
      const displayText = isFilled ? val : match;
      const className = `doc-field ${isFilled ? 'filled' : ''}`;

      return `<span class="${className}" data-field="${cleanKey}">${displayText}</span>`;
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
    <div className="w-full bg-gray-100 py-10 px-4 flex justify-center min-h-full overflow-y-auto">
      <div 
        className="document-page"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: processedHtml || '<div class="text-center p-10 text-gray-400">Loading Preview...</div>' }}
      />
    </div>
  );
}