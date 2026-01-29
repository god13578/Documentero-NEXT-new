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
  const [debouncedValues, setDebouncedValues] = useState<Record<string, any>>({});
  const [fieldConfig, setFieldConfig] = useState<any>({});
  const [htmlTemplate, setHtmlTemplate] = useState<string>('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Debounce: Update preview 300ms after typing stops
  useEffect(() => {
    const handler = setTimeout(() => {
      const processed = { ...values };
      Object.keys(fieldConfig).forEach(key => {
        const config = fieldConfig[key];
        if (processed[key] && (config.type === 'date' || config.type === 'fulldate')) {
          processed[key] = formatThaiDate(processed[key], config.type === 'fulldate' ? 'full' : 'short');
        }
      });
      setDebouncedValues(processed);
    }, 300);
    return () => clearTimeout(handler);
  }, [values, fieldConfig]);

  useEffect(() => {
    if (!templateId) return;
    async function load() {
      try {
        setLoading(true);
        // Load Template, Fields, and Raw HTML
        const [tmplRes, schemaRes, htmlRes] = await Promise.all([
          fetch(`/api/templates/${templateId}`),
          fetch(`/api/templates/${templateId}/schema`),
          fetch(`/api/builder/${templateId}/preview-html`, { method: 'POST' })
        ]);

        const tmpl = await tmplRes.json();
        setTemplate(tmpl);
        setFieldConfig(tmpl.fieldConfig || {});

        const html = await htmlRes.json();
        if(html.html) setHtmlTemplate(html.html);

        const schema = await schemaRes.json();
        if(schema.schema) {
          const f = schema.schema.map((s: any) => s.variable);
          setFields(f);
          const init: any = {};
          f.forEach((k: string) => init[k] = '');
          setValues(init);
          setDebouncedValues(init);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    load();
  }, [templateId]);

  const handleDownload = async (type: 'docx' | 'pdf') => {
    const endpoint = type === 'pdf' ? 'generate-pdf' : 'generate';
    await fetch(`/api/builder/${templateId}/${endpoint}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ values: debouncedValues })
    }).then(async res => {
      if(res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${template.name}.${type}`; a.click();
      } else alert('Error');
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/templates/${templateId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ fieldConfig })
    });
    setSaving(false);
    alert('Saved');
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;
  if (!template) return <div>Template not found</div>;

  return (
    <ModernBuilderLayout
      templateId={templateId}
      templateName={template.name}
      fields={fields}
      values={values} // Fast input
      previewValues={debouncedValues} // Smooth preview
      fieldConfig={fieldConfig}
      htmlTemplate={htmlTemplate}
      focusedField={focusedField}
      saving={saving}
      onValueChange={(k: string, v: any) => setValues(p => ({...p, [k]: v}))}
      onConfigChange={setFieldConfig}
      onFieldClick={setFocusedField}
      onFieldFocus={setFocusedField}
      onSave={handleSave}
      onGenerateDocx={() => handleDownload('docx')}
      onGeneratePdf={() => handleDownload('pdf')}
    />
  );
}
