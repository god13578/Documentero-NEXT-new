"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ModernBuilderLayout from '../../../../components/ModernBuilderLayout';
import { Loader2 } from 'lucide-react';
import { formatThaiDate } from '../../../../utils/thaidate-helper';

export default function BuilderPage() {
  const params = useParams();
  const templateId = params?.id as string;
  const [template, setTemplate] = useState<any>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [fieldConfig, setFieldConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    async function load() {
      try {
        setLoading(true);
        // Load Template
        const tRes = await fetch(`/api/templates/${templateId}`);
        const tData = await tRes.json();
        setTemplate(tData);
        setFieldConfig(tData.fieldConfig || {});

        // Load Schema (Fields)
        const sRes = await fetch(`/api/templates/${templateId}/schema`);
        const sData = await sRes.json();
        if (sData.schema) {
          const fNames = sData.schema.map((s: any) => s.variable);
          setFields(fNames);
          // Init values
          const initVals: any = {};
          fNames.forEach((f: string) => initVals[f] = '');
          setValues(initVals);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    load();
  }, [templateId]);

  const getProcessedValues = () => {
    const processed = { ...values };
    // Apply Date Formatting logic before sending to Preview/Generation
    Object.keys(fieldConfig).forEach(key => {
      const config = fieldConfig[key];
      if (processed[key]) {
        if (config.type === 'date') processed[key] = formatThaiDate(processed[key], 'short');
        if (config.type === 'fulldate') processed[key] = formatThaiDate(processed[key], 'full');
      }
    });
    return processed;
  };

  const handleDownload = async (type: 'docx' | 'pdf') => {
    const endpoint = type === 'pdf' ? 'generate-pdf' : 'generate';
    const res = await fetch(`/api/builder/${templateId}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({ values: getProcessedValues() })
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}.${type}`;
      a.click();
    } else { alert('Download failed'); }
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/templates/${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify({ fieldConfig })
    });
    setSaving(false);
    alert('บันทึกการตั้งค่าเรียบร้อย');
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!template) return <div>Template not found</div>;

  return (
    <ModernBuilderLayout
      templateId={templateId}
      templateName={template.name}
      fields={fields}
      values={values}
      fieldConfig={fieldConfig}
      saving={saving}
      onValueChange={(k: string, v: any) => setValues(p => ({...p, [k]: v}))}
      onConfigChange={setFieldConfig}
      onSave={handleSave}
      onGenerateDocx={() => handleDownload('docx')}
      onGeneratePdf={() => handleDownload('pdf')}
    />
  );
}
