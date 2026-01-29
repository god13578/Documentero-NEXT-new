"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ModernBuilderLayout from '../../../../components/ModernBuilderLayout';
import { FieldConfigMap } from '../../../../components/DynamicFieldBuilder';
import { Loader2 } from 'lucide-react';
import { formatThaiDate } from '../../../../utils/thaidate-helper';

export default function BuilderPage() {
  const params = useParams();
  const templateId = params?.id as string;
  
  const [template, setTemplate] = useState<any>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [debouncedValues, setDebouncedValues] = useState<Record<string, any>>({}); // For Preview
  const [fieldConfig, setFieldConfig] = useState<FieldConfigMap>({});
  const [htmlTemplate, setHtmlTemplate] = useState<string>('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Debounce Logic: Update preview values only after user stops typing for 200ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValues(values);
    }, 200); // 200ms delay for preview update
    return () => clearTimeout(timer);
  }, [values]);

  useEffect(() => {
    if (!templateId) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [tmplRes, schemaRes, htmlRes] = await Promise.all([
          fetch(`/api/templates/${templateId}`),
          fetch(`/api/templates/${templateId}/schema`),
          fetch(`/api/builder/${templateId}/preview-html`, { method: 'POST' })
        ]);

        const tmplData = await tmplRes.json();
        setTemplate(tmplData);
        setFieldConfig(tmplData.fieldConfig || {});

        const htmlData = await htmlRes.json();
        if (htmlData.html) setHtmlTemplate(htmlData.html);

        const schemaData = await schemaRes.json();
        if (schemaData.schema) {
          const fNames = schemaData.schema.map((s: any) => s.variable);
          setFields(fNames);
          const initialValues: any = {};
          fNames.forEach((f: string) => initialValues[f] = '');
          setValues(initialValues);
          setDebouncedValues(initialValues);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    loadData();
  }, [templateId]);

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
    alert('Settings Saved');
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!template) return <div>Not Found</div>;

  return (
    <ModernBuilderLayout
      templateId={templateId}
      templateName={template.name}
      fields={fields}
      values={values} // Immediate update for Inputs
      previewValues={debouncedValues} // Delayed update for Preview
      fieldConfig={fieldConfig}
      htmlTemplate={htmlTemplate}
      focusedField={focusedField}
      saving={saving}
      onValueChange={(k, v) => setValues(p => ({...p, [k]: v}))}
      onConfigChange={setFieldConfig}
      onFieldClick={setFocusedField}
      onSave={handleSave}
      onGenerateDocx={() => handleDownload('docx')}
      onGeneratePdf={() => handleDownload('pdf')}
    />
  );
}
