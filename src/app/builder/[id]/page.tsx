"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DynamicFieldBuilder, { FieldConfigMap } from '../../../../components/DynamicFieldBuilder';
import RealtimePreview from '../../../../components/RealtimePreview';
import { formatThaiDate } from '../../../../utils/thaidate-helper';
import { ArrowLeft, Save, Download, FileText } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  docxPath: string;
  originalName?: string;
  fieldConfig?: FieldConfigMap;
  createdAt: string;
  updatedAt: string;
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
  const [htmlTemplate, setHtmlTemplate] = useState<string>('');

  // Load template and fields
  useEffect(() => {
    if (!templateId) return;

    async function loadData() {
      try {
        // Load template info
        const templateRes = await fetch(`/api/templates/${templateId}`);
        if (templateRes.ok) {
          const templateData = await templateRes.json();
          setTemplate(templateData);
          setFieldConfig(templateData.fieldConfig || {});
        }

        // Load fields from template
        const fieldsRes = await fetch(`/api/templates/${templateId}/schema`);
        if (fieldsRes.ok) {
          const schemaData = await fieldsRes.json();
          if (schemaData.ok && schemaData.schema) {
            const fieldNames = schemaData.schema.map((s: any) => s.variable);
            setFields(fieldNames);
            
            // Initialize values
            const initialValues: Record<string, any> = {};
            fieldNames.forEach((field: string) => {
              initialValues[field] = '';
            });
            setValues(initialValues);
          }
        }

        // Load HTML preview
        const previewRes = await fetch(`/api/preview?template=${templateId}`);
        if (previewRes.ok) {
          const html = await previewRes.text();
          setHtmlTemplate(html);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [templateId]);

  const handleValueChange = (key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleConfigChange = (newConfig: FieldConfigMap) => {
    setFieldConfig(newConfig);
  };

  const handleFieldClick = (field: string) => {
    setFocusedField(field);
  };

  const handleSave = async () => {
    if (!template) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fieldConfig,
        }),
      });

      if (response.ok) {
        alert('บันทึกการตั้งค่าสำเร็จแล้ว');
      } else {
        alert('บันทึกไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDocx = async () => {
    if (!template) return;

    try {
      const response = await fetch(`/api/builder/${templateId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name}.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('สร้างเอกสารไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Generate error:', error);
      alert('เกิดข้อผิดพลาดในการสร้างเอกสาร');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบ Template</h2>
          <p className="text-gray-500">Template ที่คุณต้องการไม่มีอยู่ในระบบ</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Document Builder</h1>
                <p className="text-sm text-gray-500">{template.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button
                onClick={handleGenerateDocx}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                ดาวน์โหลด DOCX
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Field Builder */}
        <div className="w-1/2 bg-white border-r overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 z-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">ตั้งค่า Field</h2>
            <p className="text-sm text-gray-500">คลิกที่ช่องสีเหลืองในเอกสารเพื่อแก้ไข</p>
          </div>
          
          <DynamicFieldBuilder
            fields={fields}
            values={values}
            fieldConfig={fieldConfig}
            onChange={handleValueChange}
            onConfigChange={handleConfigChange}
            focusedField={focusedField}
          />
        </div>

        {/* Preview */}
        <div className="w-1/2 overflow-hidden">
          <div className="sticky top-0 bg-white border-b p-4 z-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Live Preview (Word View)</h2>
            <p className="text-sm text-gray-500">คลิกที่ช่องสีเหลืองเพื่อแก้ไขข้อมูล • เทียบข้างๆ กับช่องกรอก</p>
          </div>
          
          <div className="h-full overflow-hidden">
            <RealtimePreview
              htmlTemplate={htmlTemplate}
              values={values}
              fieldConfig={fieldConfig}
              onFieldClick={handleFieldClick}
              hoveredField={focusedField}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
