'use client';
import React, { useState } from 'react';
import { ArrowLeft, Save, Download, FileText, Eye, Printer } from 'lucide-react';
import DynamicFieldBuilder, { FieldConfigMap } from './DynamicFieldBuilder';
import PdfPreview from './PdfPreview';
import RealtimePreview from './RealtimePreview';
import { useRouter } from 'next/navigation';

interface Props {
  templateId: string;
  templateName: string;
  fields: string[];
  values: Record<string, any>;
  previewValues: Record<string, any>; // Added for debounced preview
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

export default function ModernBuilderLayout(props: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'web' | 'pdf'>('web');

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gray-100 font-sans">
      
      {/* HEADER */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-indigo-600" /> {props.templateName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={props.onSave} disabled={props.saving} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
            {props.saving ? 'Saving...' : 'Save Config'}
          </button>
          {/* Download Buttons Restored */}
          <button onClick={props.onGenerateDocx} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition">
            <Download size={16} /> Word
          </button>
          <button onClick={props.onGeneratePdf} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 shadow-sm transition">
            <Download size={16} /> PDF
          </button>
        </div>
      </header>

      {/* BODY - Split Layout */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* LEFT: Inputs - Forced Width */}
        <div className="min-w-[400px] w-[400px] bg-white border-r flex flex-col z-20 shadow-xl">
          <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700 sticky top-0">
            Data Entry
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <DynamicFieldBuilder 
              fields={props.fields}
              values={props.values}
              fieldConfig={props.fieldConfig}
              onChange={props.onValueChange}
              onConfigChange={props.onConfigChange}
              focusedField={props.focusedField}
            />
          </div>
        </div>

        {/* RIGHT: Preview - Forced Flex */}
        <div className="flex-1 w-full flex flex-col bg-gray-100 relative overflow-hidden">
          
          {/* Tabs Bar - Sticky at Top */}
          <div className="h-12 bg-white/80 backdrop-blur border-b flex justify-center items-center shrink-0 z-10 sticky top-0">
            <div className="flex bg-gray-200 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('web')}
                className={`px-4 py-1 text-xs font-bold rounded ${activeTab === 'web' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
              >
                <Eye size={14} className="inline mr-1"/> Live Web (Fast)
              </button>
              <button 
                onClick={() => setActiveTab('pdf')}
                className={`px-4 py-1 text-xs font-bold rounded ${activeTab === 'pdf' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
              >
                <Printer size={14} className="inline mr-1"/> PDF Print
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
            <div className={`transition-all duration-300 w-full max-w-[850px] ${activeTab === 'pdf' ? 'h-full' : 'h-fit min-h-[1000px]'}`}>
              {activeTab === 'web' ? (
                <RealtimePreview 
                  htmlTemplate={props.htmlTemplate} 
                  values={props.previewValues} // Use debounced values
                  onFieldClick={props.onFieldClick} 
                />
              ) : (
                <div className="bg-white h-full shadow-lg rounded overflow-hidden">
                  <PdfPreview templateId={props.templateId} values={props.values} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
