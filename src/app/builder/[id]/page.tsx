"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DynamicFieldBuilder, { FieldConfigMap } from '../../../../components/DynamicFieldBuilder';
import PdfPreview from '../../../../components/PdfPreview';
import { ArrowLeft, Save, Download, FileText, Loader2 } from 'lucide-react';
import { formatThaiDate } from '../../../../utils/thaidate-helper';

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params?.id as string;
  const [template, setTemplate] = useState<any>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [fieldConfig, setFieldConfig] = useState<FieldConfigMap>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const tmplRes = await fetch(`/api/templates/${templateId}`);
        const tmplData = await tmplRes.json();
        setTemplate(tmplData);
        setFieldConfig(tmplData.fieldConfig || {});

        const schemaRes = await fetch(`/api/templates/${templateId}/schema`);
        const schemaData = await schemaRes.json();
        if (schemaData.schema) {
          const fieldNames = schemaData.schema.map((s: any) => s.variable);
          setFields(fieldNames);
          const initialValues: any = {};
          fieldNames.forEach((f: string) => initialValues[f] = '');
          setValues(initialValues);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    loadData();
  }, [templateId]);

  // Helper to format values before sending to PDF
  const getProcessedValues = () => {
    const processed = { ...values };
    Object.keys(fieldConfig).forEach(key => {
      const config = fieldConfig[key];
      if (processed[key] && (config.type === 'date' || config.type === 'fulldate')) {
        processed[key] = formatThaiDate(processed[key], config.type === 'fulldate' ? 'full' : 'short');
      }
    });
    return processed;
  };

  const handleDownload = async (format: 'docx' | 'pdf') => {
    const endpoint = format === 'pdf' ? 'generate-pdf' : 'generate';
    try {
      const res = await fetch(`/api/builder/${templateId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: getProcessedValues() }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name}.${format}`;
        a.click();
      } else { alert('Download failed'); }
    } catch (e) { alert('Error downloading'); }
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/templates/${templateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldConfig }),
    });
    setSaving(false);
    alert('บันทึกการตั้งค่าเรียบร้อย');
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!template) return <div>Template not found</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      <header className="h-16 bg-white border-b flex items-center justify-between px-4 shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
          <h1 className="text-sm font-bold text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-600" /> {template.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2"><Save size={16} /> {saving ? 'Saving...' : 'Save Config'}</button>
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          <button onClick={() => handleDownload('docx')} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Download size={16} /> DOCX</button>
          <button onClick={() => handleDownload('pdf')} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"><Download size={16} /> PDF</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Inputs */}
        <div className="w-[450px] bg-white border-r flex flex-col z-10 shadow-lg">
          <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700">Fill Data</div>
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            <DynamicFieldBuilder
              fields={fields}
              values={values}
              fieldConfig={fieldConfig}
              onChange={(k, v) => setValues(p => ({...p, [k]: v}))}
              onConfigChange={setFieldConfig}
              focusedField={focusedField}
            />
          </div>
        </div>
        {/* Right: PDF Preview */}
        <div className="flex-1 bg-gray-100 p-8 flex justify-center overflow-hidden relative">
           <div className="w-full h-full max-w-[1000px] bg-white shadow-xl rounded-lg overflow-hidden border">
             {/* Pass processed values to preview to see formatted dates */}
             <PdfPreview templateId={templateId} values={getProcessedValues()} />
           </div>
        </div>
      </div>
    </div>
  );
}
