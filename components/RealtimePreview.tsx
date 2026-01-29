'use client';
import React, { useMemo, useEffect, useRef } from 'react';

interface Props {
  htmlTemplate: string;
  values: Record<string, any>;
  onFieldClick: (field: string) => void;
  focusedField?: string | null;
}

export default function RealtimePreview({ htmlTemplate, values, onFieldClick, focusedField }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const focusedElementRef = useRef<HTMLSpanElement | null>(null);

  const processedHtml = useMemo(() => {
    if (!htmlTemplate) return '';
    
    // Advanced regex to match {variable}, {{variable}}, and HTML tags inside braces
    return htmlTemplate.replace(/\{{1,2}((?:[^{}]|&nbsp;|<[^>]+>)*?)\}{1,2}/g, (match, rawKey) => {
      const cleanKey = rawKey.replace(/<[^>]+>|&nbsp;/g, '').trim();
      if (!cleanKey) return match;

      const val = values[cleanKey];
      const isFilled = val !== undefined && val !== null && val !== '';
      const display = isFilled ? val : `{${cleanKey}}`;
      const isFocused = focusedField === cleanKey;
      
      // Build CSS classes for the field
      const classes = [
        'doc-field',
        isFilled ? 'filled' : '',
        isFocused ? 'focused' : '',
        'transition-all duration-300 cursor-pointer'
      ].filter(Boolean).join(' ');

      return `<span class="${classes}" data-field="${cleanKey}">${display}</span>`;
    });
  }, [htmlTemplate, values, focusedField]);

  // Scroll focused field into view
  useEffect(() => {
    if (focusedField && previewRef.current) {
      // Find the focused element
      const focusedElement = previewRef.current.querySelector(`[data-field="${focusedField}"]`) as HTMLSpanElement;
      focusedElementRef.current = focusedElement;
      
      if (focusedElement) {
        // Scroll the element into view smoothly
        setTimeout(() => {
          focusedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        }, 100);
      }
    }
  }, [focusedField]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const fieldElement = target.closest('.doc-field');
    
    if (fieldElement) {
      const field = fieldElement.getAttribute('data-field');
      if (field) {
        e.preventDefault();
        onFieldClick(field);
      }
    }
  };

  if (!htmlTemplate) {
    return (
      <div className="w-full bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center" style={{ height: '90vh' }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">กำลังโหลดเอกสาร...</p>
          <p className="text-slate-400 text-sm mt-1">กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Preview Container */}
      <div 
        ref={previewRef}
        className="w-full bg-slate-100 rounded-xl border border-slate-200 overflow-auto shadow-inner"
        style={{ height: '90vh' }}
        onClick={handleClick}
      >
        <div className="py-8 flex justify-center min-h-full">
          <div 
            className="document-page shadow-xl bg-white"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        </div>
      </div>

      {/* Custom CSS for field highlighting */}
      <style jsx>{`
        .doc-field {
          display: inline-block;
          min-width: 30px;
          padding: 2px 6px;
          margin: 0 2px;
          border-radius: 4px;
          cursor: pointer;
          text-align: center;
          transition: all 0.3s ease;
          font-weight: 500;
          position: relative;
        }

        /* Default state - Yellow highlight for empty fields */
        .doc-field:not(.filled) {
          background-color: rgba(254, 240, 138, 0.8); /* Yellow-200 */
          border: 1px dashed #ca8a04; /* Yellow-600 */
          color: #854d0e; /* Yellow-800 */
        }

        /* Filled state - Green underline */
        .doc-field.filled {
          background-color: transparent;
          border: none;
          color: #1f2937; /* Gray-800 */
          text-decoration: underline;
          text-decoration-style: dotted;
          text-decoration-color: #22c55e; /* Green-500 */
          text-decoration-thickness: 2px;
        }

        /* Focused state - Blue glow with animation */
        .doc-field.focused {
          background-color: rgba(59, 130, 246, 0.25) !important; /* Blue-500 with opacity */
          border: 2px solid #3b82f6 !important; /* Blue-500 */
          border-radius: 6px !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          transform: scale(1.05) !important;
          animation: pulse-blue 2s infinite;
          z-index: 10;
          position: relative;
        }

        /* Hover effects */
        .doc-field:hover:not(.focused) {
          transform: scale(1.02);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .doc-field.filled:hover {
          text-decoration-color: #16a34a; /* Green-600 */
          text-decoration-style: solid;
        }

        /* Pulse animation for focused fields */
        @keyframes pulse-blue {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.25), 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }

        /* Document page styles */
        .document-page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm 25mm;
          margin: 0 auto;
          background-color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          color: #1f2937;
          font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
          line-height: 1.6;
          overflow-wrap: break-word;
        }

        /* Image alignment in document */
        .document-page img {
          display: block;
          margin: 0 auto 10px auto;
          max-width: 100px;
          height: auto;
        }

        .document-page p:has(img) {
          text-align: center;
        }
      `}</style>
    </>
  );
}