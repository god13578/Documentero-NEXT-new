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
    <div className="w-full relative bg-gray-100" style={{ minHeight: '800px', height: '90vh' }}>
      {loading && (
        <div className="absolute top-4 right-4 z-10 bg-white/95 px-4 py-2 rounded-full shadow-lg border border-blue-200 flex items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={16} />
          <span className="text-sm font-medium text-blue-600">กำลังอัปเดตพรีวิว...</span>
        </div>
      )}
      
      {pdfUrl ? (
        <div className="w-full h-full rounded-lg shadow-xl overflow-hidden border border-gray-300">
          <iframe 
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
            className="w-full h-full border-0 bg-white"
            style={{ minHeight: '800px', height: '90vh' }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-lg font-medium">กำลังสร้างพรีวิว PDF...</p>
          <p className="text-sm text-gray-400 mt-2">กรุณารอสักครู่</p>
        </div>
      )}
    </div>
  );
}
