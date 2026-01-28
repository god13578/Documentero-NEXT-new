'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export default function PdfPreview({ templateId, values }: { templateId: string, values: any }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/builder/${templateId}/preview-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values }),
        });
        
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(prev => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch (error) {
        console.error('Preview error', error);
      } finally {
        setLoading(false);
      }
    }, 1500); // ดีเลย์ 1.5 วินาที เพื่อไม่ให้โหลดถี่เกินไปเวลาพิมพ์

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [values, templateId]);

  return (
    <div className="w-full h-full relative bg-gray-200">
      {loading && (
        <div className="absolute top-4 right-4 z-10 bg-white/90 px-3 py-1 rounded-full shadow border flex items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={14} />
          <span className="text-xs font-medium text-blue-600">Updating...</span>
        </div>
      )}
      
      {pdfUrl ? (
        <iframe src={`${pdfUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-0" />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Generating Preview...</p>
        </div>
      )}
    </div>
  );
}
