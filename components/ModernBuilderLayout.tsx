'use client';
import React from 'react';
import { ArrowLeft, Save, Download, FileText, Eye } from 'lucide-react';
import DynamicFieldBuilder, { FieldConfigMap } from './DynamicFieldBuilder';
import RealtimePreview from './RealtimePreview';
import { useRouter } from 'next/navigation';

interface Props {
  templateId: string;
  templateName: string;
  fields: string[];
  values: Record<string, any>;
  fieldConfig: FieldConfigMap;
  focusedField: string | null;
  saving: boolean;
  onValueChange: (k: string, v: any) => void;
  onConfigChange: (c: FieldConfigMap) => void;
  onFieldClick: (f: string) => void;
  onSave: () => void;
  onGenerateDocx: () => void;
  onPreviewPdf: () => void; // New prop for opening PDF tab
}

export default function ModernBuilderLayout({
  templateId, templateName, fields, values, fieldConfig,
  focusedField, saving, onValueChange, onConfigChange, onFieldClick,
  onSave, onGenerateDocx, onPreviewPdf
}: Props) {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
             <h1 className="font-bold text-gray-800 flex items-center gap-2">
               <FileText className="text-blue-600" size={18} /> {templateName}
             </h1>
             <span className="text-xs text-gray-400">Builder Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onPreviewPdf} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
            <Eye size={16} /> Preview PDF (New Tab)
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button onClick={onSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
            {saving ? 'Saving...' : 'Save Config'}
          </button>
          <button onClick={onGenerateDocx} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md">
            <Download size={16} /> Download Word
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Input Form */}
        <div className="w-[450px] bg-white border-r flex flex-col z-10 shadow-xl">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
             <span className="font-semibold text-gray-700">Form Data</span>
             <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{fields.length} Fields</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
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

        {/* Right: HTML Preview (Live) */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden flex flex-col">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full shadow-sm text-xs font-medium text-gray-500 z-10 border">
            Live Web Preview
          </div>
          <div className="flex-1 overflow-auto p-10 flex justify-center custom-scrollbar">
             <RealtimePreview 
               htmlTemplate="" // Assuming we fetch this or just render simple layout
               values={values}
               fieldConfig={fieldConfig}
               onFieldClick={onFieldClick}
               hoveredField={focusedField}
             />
          </div>
        </div>
      </div>
    </div>
  );
}
