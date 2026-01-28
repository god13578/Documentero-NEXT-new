'use client';
import React from 'react';
import { ArrowLeft, Save, Download, FileType } from 'lucide-react';
import DynamicFieldBuilder from './DynamicFieldBuilder';
import PdfPreview from './PdfPreview';
import { useRouter } from 'next/navigation';

export default function ModernBuilderLayout({
  templateId, templateName, fields, values, fieldConfig,
  focusedField, saving, onValueChange, onConfigChange,
  onSave, onGenerateDocx, onGeneratePdf
}: any) {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
          <h1 className="font-bold text-lg text-gray-800">{templateName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onSave} disabled={saving} className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50">
            {saving ? 'Saving...' : 'Save Config'}
          </button>
          <button onClick={onGenerateDocx} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Word
          </button>
          <button onClick={onGeneratePdf} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">
            PDF
          </button>
        </div>
      </header>

      {/* Main Content: Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Input Panel */}
        <div className="w-[400px] bg-white border-r flex flex-col z-10 shadow-lg">
          <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700"> กรอกข้อมูล (Fill Data) </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <DynamicFieldBuilder 
              fields={fields} 
              values={values} 
              fieldConfig={fieldConfig} 
              onChange={onValueChange} 
              onConfigChange={onConfigChange}
              focusedField={focusedField}
            />
          </div>
        </div>

        {/* RIGHT: Preview Panel */}
        <div className="flex-1 bg-gray-200/80 p-8 overflow-y-auto flex justify-center">
          <div className="w-full max-w-[1000px] h-full min-h-[800px] bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-300">
             <PdfPreview templateId={templateId} values={values} />
          </div>
        </div>
      </div>
    </div>
  );
}
