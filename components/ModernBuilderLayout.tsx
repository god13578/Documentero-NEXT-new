'use client';
import React, { useState } from 'react';
import { ArrowLeft, Save, Download, FileText, Monitor, FileType } from 'lucide-react';
import DynamicFieldBuilder, { FieldConfigMap } from './DynamicFieldBuilder';
import PdfPreview from './PdfPreview';
import RealtimePreview from './RealtimePreview';
import { useRouter } from 'next/navigation';

interface Props {
  templateId: string;
  templateName: string;
  fields: string[];
  values: Record<string, any>;
  fieldConfig: FieldConfigMap;
  htmlTemplate: string;
  focusedField: string | null;
  saving: boolean;
  onValueChange: (k: string, v: any) => void;
  onConfigChange: (c: FieldConfigMap) => void;
  onFieldClick: (f: string) => void;
  onSave: () => void;
  onGenerateDocx: () => void;
  onGeneratePdf: () => void;
}

export default function ModernBuilderLayout({
  templateId, templateName, fields, values, fieldConfig,
  htmlTemplate, focusedField, saving,
  onValueChange, onConfigChange, onFieldClick,
  onSave, onGenerateDocx, onGeneratePdf
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'web' | 'pdf'>('web');

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden font-sans">
      
      {/* 1. Header Bar */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <span className="font-bold text-gray-700 flex items-center gap-2 text-sm">
            <FileText size={16} className="text-blue-600" /> {templateName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onSave} disabled={saving} className="px-3 py-1.5 text-xs font-medium border rounded hover:bg-gray-50 text-gray-600">
            {saving ? 'Saving...' : 'Save Config'}
          </button>
          <div className="h-5 w-px bg-gray-300 mx-1" />
          <button onClick={onGenerateDocx} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm">
            <Download size={14} /> Word
          </button>
          <button onClick={onGeneratePdf} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 shadow-sm">
            <Download size={14} /> PDF
          </button>
        </div>
      </header>

      {/* 2. Main Workspace (Split Layout) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Inputs (Scrollable) */}
        <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col z-20 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
          <div className="px-4 py-3 border-b bg-gray-50/80 backdrop-blur sticky top-0 z-10">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Variables</h2>
          </div>
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

        {/* RIGHT PANEL: Preview (Scrollable + Tabs) */}
        <div className="flex-1 bg-gray-100 flex flex-col overflow-hidden relative">
          
          {/* TABS (Sticky Top of Preview) */}
          <div className="h-12 flex items-center justify-center bg-white/80 backdrop-blur border-b z-10 shrink-0">
            <div className="flex p-1 bg-gray-200/50 rounded-lg">
              <button 
                onClick={() => setActiveTab('web')}
                className={`flex items-center gap-2 px-4 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'web' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Monitor size={14} /> Live Web
              </button>
              <button 
                onClick={() => setActiveTab('pdf')}
                className={`flex items-center gap-2 px-4 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'pdf' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FileType size={14} /> PDF Print
              </button>
            </div>
          </div>

          {/* PREVIEW CONTENT */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
            <div className={`transition-all duration-300 w-full max-w-[850px] ${activeTab === 'pdf' ? 'h-full' : ''}`}>
              {activeTab === 'web' ? (
                <RealtimePreview 
                  htmlTemplate={htmlTemplate} 
                  values={values} 
                  onFieldClick={onFieldClick} 
                />
              ) : (
                <div className="bg-white shadow-xl rounded h-full overflow-hidden border">
                  <PdfPreview templateId={templateId} values={values} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
