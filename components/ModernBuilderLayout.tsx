'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DynamicFieldBuilder, { FieldConfigMap } from './DynamicFieldBuilder';
import PdfPreview from './PdfPreview';
import { 
  ArrowLeft, Save, Download, FileText, FileType, Monitor 
} from 'lucide-react';

interface Props {
  templateId: string;
  templateName: string;
  fields: string[];
  values: Record<string, any>;
  fieldConfig: FieldConfigMap;
  focusedField: string | null;
  previewMode: 'word' | 'pdf-live';
  saving: boolean;
  onValueChange: (k: string, v: any) => void;
  onConfigChange: (c: FieldConfigMap) => void;
  onSetPreviewMode: (m: 'word' | 'pdf-live') => void;
  onSave: () => void;
  onGenerateDocx: () => void;
  onGeneratePdf: () => void;
}

export default function ModernBuilderLayout({
  templateId, templateName, fields, values, fieldConfig, focusedField,
  previewMode, saving, onValueChange, onConfigChange, onSetPreviewMode,
  onSave, onGenerateDocx, onGeneratePdf
}: Props) {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" /> {templateName}
            </h1>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => onSetPreviewMode('pdf-live')}
            className={`flex items-center px-3 py-1.5 text-xs font-medium rounded ${previewMode === 'pdf-live' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          >
            <FileType size={14} className="mr-1.5" /> PDF Preview
          </button>
          {/* ซ่อนปุ่ม Web View ไว้ก่อนถ้ายังไม่ใช้ */}
          {/* <button onClick={() => onSetPreviewMode('word')} ... >Web View</button> */}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onSave} disabled={saving} className="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Config'}
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button onClick={onGenerateDocx} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
            <Download size={16} /> Word
          </button>
          <button onClick={onGeneratePdf} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2">
            <Download size={16} /> PDF
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Inputs */}
        <div className="w-[400px] bg-white border-r flex flex-col z-10">
          <div className="flex-1 overflow-y-auto p-5">
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

        {/* Right: Preview */}
        <div className="flex-1 bg-gray-100 overflow-hidden relative flex flex-col">
          <div className="flex-1 p-8 overflow-auto flex justify-center">
            <div className="w-full h-full max-w-[1000px] bg-white shadow-lg rounded-lg border overflow-hidden">
               <PdfPreview templateId={templateId} values={values} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
