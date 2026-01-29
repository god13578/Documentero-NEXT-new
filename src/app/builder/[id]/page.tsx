"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DynamicFieldBuilder from "../../../../components/DynamicFieldBuilder";
import RealtimePreview from "../../../../components/RealtimePreview";
import { Loader2, FileText, Save, Download } from "lucide-react";
import { formatThaiDate } from "../../../../utils/thaidate-helper";

export default function BuilderPage() {
  const params = useParams();
  const templateId = params?.id as string;
  
  const [template, setTemplate] = useState<any>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [htmlTemplate, setHtmlTemplate] = useState<string>("");

  useEffect(() => {
    if (!templateId) return;
    
    async function loadTemplateData() {
      try {
        setLoading(true);
        
        // Load template data, schema, and HTML preview in parallel
        const [templateRes, schemaRes, htmlRes] = await Promise.all([
          fetch(`/api/templates/${templateId}`),
          fetch(`/api/templates/${templateId}/schema`),
          fetch(`/api/builder/${templateId}/preview-html`, { method: 'POST' })
        ]);

        const tmpl = await templateRes.json();
        setTemplate(tmpl);

        const schema = await schemaRes.json();
        if (schema.schema) {
          const fieldNames = schema.schema.map((s: any) => s.variable);
          setFields(fieldNames);
          
          // Initialize form data with empty values
          const initialData: Record<string, any> = {};
          fieldNames.forEach((field: string) => {
            initialData[field] = "";
          });
          setFormData(initialData);
        }

        const htmlData = await htmlRes.json();
        if (htmlData.html) {
          setHtmlTemplate(htmlData.html);
        }
        
      } catch (error) {
        console.error("Error loading template:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTemplateData();
  }, [templateId]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldClick = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      // Save draft logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Draft saved:", formData);
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDocument = async () => {
    try {
      // Generate document logic here
      console.log("Generating document:", formData);
    } catch (error) {
      console.error("Error generating document:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">กำลังโหลดแม่แบบเอกสาร...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">ไม่พบแม่แบบเอกสาร</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {template?.name || "กำลังโหลดแม่แบบ..."}
          </h1>
          <p className="text-xs text-slate-400">ID: {templateId}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                บันทึกร่าง
              </>
            )}
          </button>
          <button 
            onClick={handleGenerateDocument}
            className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-700/20 hover:bg-blue-800 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            สร้างเอกสารราชการ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Input Form */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-semibold mb-6 text-slate-700 border-l-4 border-blue-600 pl-4">
            ข้อมูลสำหรับกรอกลงในแม่แบบ
          </h2>
          <DynamicFieldBuilder 
            fields={fields} 
            values={formData}
            onChange={handleFieldChange}
            onFocusField={setFocusedField}
          />
        </section>

        {/* Right Side: Document Preview (Sticky) */}
        <section className="relative">
          <div className="sticky top-[100px]">
            <h2 className="text-sm font-medium mb-3 text-slate-500 uppercase tracking-wider">
              ตัวอย่างเอกสารแบบเรียลไทม์
            </h2>
            <RealtimePreview 
              htmlTemplate={htmlTemplate} 
              values={formData} 
              focusedField={focusedField}
              onFieldClick={handleFieldClick}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
