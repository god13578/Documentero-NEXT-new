"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ModernBuilderLayout from '../../../../components/ModernBuilderLayout';
import { FieldConfigMap } from '../../../../components/DynamicFieldBuilder';
import { FileText, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
}

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params?.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [fieldConfig, setFieldConfig] = useState<FieldConfigMap>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Default preview mode เป็น 'pdf-live'
  const [previewMode, setPreviewMode] = useState<'word' | 'pdf-live'>('pdf-live');

  useEffect(() => {
    if (!templateId) return;
    const loadData = async () => {
      try {
        setLoading(true);
        // Load Template Info
        const tmplRes = await fetch(`/api/templates/${templateId}`);
        if (!tmplRes.ok) throw new Error('Failed to load template');
        const tmplData = await tmplRes.json();
        setTemplate(tmplData);
        setFieldConfig(tmplData.fieldConfig || {});

        // Load Schema
        const schemaRes = await fetch(`/api/templates/${templateId}/schema`);
        if (schemaRes.ok) {
          const schemaData = await schemaRes.json();
          if (schemaData.ok && schemaData.schema) {
            const fieldNames = schemaData.schema.map((s: any) => s.variable);
            setFields(fieldNames);
            // Init values
            const initialValues: Record<string, any> = {};
            fieldNames.forEach((field: string) => initialValues[field] = '');
            setValues(initialValues);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [templateId]);

  const handleDownload = async (format: 'docx' | 'pdf') => {
    if (!template) return;
    const endpoint = format === 'pdf' ? 'generate-pdf' : 'generate';
    try {
      const res = await fetch(`/api/builder/${templateId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name}.${format === 'pdf' ? 'pdf' : 'docx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('เกิดข้อผิดพลาดในการดาวน์โหลด');
      }
    } catch (e) {
      alert('Error downloading file');
    }
  };

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    try {
      await fetch(`/api/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldConfig }),
      });
      alert('บันทึกเรียบร้อย');
    } catch (e) {
      alert('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!template) return <div>Template not found</div>;

  return (
    <ModernBuilderLayout
      templateId={templateId}
      templateName={template.name}
      fields={fields}
      values={values}
      fieldConfig={fieldConfig}
      focusedField={focusedField}
      previewMode={previewMode}
      onValueChange={(k, v) => setValues(prev => ({ ...prev, [k]: v }))}
      onConfigChange={setFieldConfig}
      onSetPreviewMode={setPreviewMode}
      onSave={handleSave}
      saving={saving}
      onGenerateDocx={() => handleDownload('docx')}
      onGeneratePdf={() => handleDownload('pdf')}
    />
  );
}
