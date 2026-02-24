'use client';
import React from 'react';

interface Props {
  templateId: string;
  values: any;
}

export default function PdfPreview({ templateId, values }: Props) {
  // Serialize data to send via query params
  const queryString = new URLSearchParams({
    data: JSON.stringify(values)
  }).toString();

  return (
    <div className="w-full h-[85vh] bg-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
      <div className="bg-slate-900 text-slate-400 text-xs px-4 py-2 flex justify-between items-center border-b border-slate-700">
        <span>PDF Preview Mode</span>
        <span className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
        </span>
      </div>
      <iframe 
        src={`/api/builder/${templateId}/preview-pdf?${queryString}`}
        className="w-full flex-1 border-none bg-slate-100"
        title="PDF Document Preview"
      />
    </div>
  );
}
