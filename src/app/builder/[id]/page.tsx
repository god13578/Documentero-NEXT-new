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
        const tRes = await fetch(`/api/templates/${templateId}`);
        const tData = await tRes.json();
        setTemplate(tData);
        setFieldConfig(tData.fieldConfig || {});

        const sRes = await fetch(`/api/templates/${templateId}/schema`);
        const sData = await sRes.json();
        if (sData.ok && sData.schema) {
          const fNames = sData.schema.map((s: any) => s.variable);
          setFields(fNames);
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
    Object.keys(fieldConfig).forEach(key => {
      const config = fieldConfig[key];
      if (processed[key]) {
        if (config.type === 'date') processed[key] = formatThaiDate(processed[key], 'short');
        if (config.type === 'fulldate') processed[key] = formatThaiDate(processed[key], 'full');
      }
    });
    return processed;
  };

  const handleDownloadWord = async () => {
    const res = await fetch(`/api/builder/${templateId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: getProcessedValues() })
    });
    if(res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name}.docx`;
        a.click();
    }
  };

  const handlePreviewPdf = async () => {
     // Since opening a new tab with POST data is tricky, we use a trick:
     // 1. Generate a temporary ID or store values in session/local storage?
     // 2. OR simpler: just fetch blob and open URL.
     
     const w = window.open('', '_blank');
     if(w) w.document.write('Loading PDF Preview...');

     try {
        const res = await fetch(`/api/builder/${templateId}/preview-pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: getProcessedValues() })
        });
        if(res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            if(w) w.location.href = url;
        } else {
            if(w) w.close();
            alert('Failed to generate PDF Preview');
        }
     } catch(e) {
        if(w) w.close();
        console.error(e);
     }
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/templates/${templateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldConfig })
    });
    setSaving(false);
    alert('Settings Saved');
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
      onValueChange={(k, v) => setValues(p => ({...p, [k]: v}))}
      onConfigChange={setFieldConfig}
      onFieldClick={() => {}} 
      focusedField={null}
      onSave={handleSave}
      onGenerateDocx={handleDownloadWord}
      onPreviewPdf={handlePreviewPdf}
    />
  );
}
