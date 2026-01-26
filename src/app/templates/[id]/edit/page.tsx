"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DynamicFieldBuilder from "../../../../../components/DynamicFieldBuilder";
import Link from "next/link";

interface TemplateField {
  id: string;
  name: string;
  fieldType: "text" | "date" | "fulldate" | "select" | "multiselect";
  fieldOptions?: Array<{ label: string; value: string }>;
  fieldDependencies?: Array<{ field: string; condition: string; action: string }>;
  defaultValue?: string;
  isRequired: boolean;
  fieldOrder: number;
}

export default function TemplateEditPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<any>(null);
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTemplate() {
      try {
        // Load template info
        const templateResponse = await fetch(`/api/templates/${templateId}`);
        if (templateResponse.ok) {
          const templateData = await templateResponse.json();
          setTemplate(templateData);
        }

        // Load template fields
        const fieldsResponse = await fetch(`/api/templates/${templateId}/fields`);
        if (fieldsResponse.ok) {
          const fieldsData = await fieldsResponse.json();
          setFields(fieldsData);
        }
      } catch (error) {
        console.error("Error loading template:", error);
      } finally {
        setLoading(false);
      }
    }

    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const handleFieldsChange = (newFields: TemplateField[]) => {
    setFields(newFields);
  };

  const reextractFields = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/templates/${templateId}/reextract`, {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        alert(`แยก Fields สำเร็จ! พบ ${result.fieldCount} fields:\n${result.fieldsFound.join(", ")}`);
        
        // Reload fields
        const fieldsResponse = await fetch(`/api/templates/${templateId}/fields`);
        if (fieldsResponse.ok) {
          const fieldsData = await fieldsResponse.json();
          setFields(fieldsData);
        }
      } else {
        alert("เกิดข้อผิดพลาดในการแยก fields");
      }
    } catch (error) {
      console.error("Error re-extracting fields:", error);
      alert("เกิดข้อผิดพลาดในการแยก fields");
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/templates/${templateId}/fields`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });

      if (response.ok) {
        alert("บันทึก Template สำเร็จ!");
        router.push(`/builder/${templateId}`);
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold">กำลังโหลด...</h2>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold">ไม่พบ Template</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/builder/${templateId}`}
              className="text-blue-500 hover:text-blue-700 flex items-center"
            >
              ← กลับ
            </Link>
            <div>
              <h1 className="text-2xl font-bold">📝 แก้ไข Template</h1>
              <p className="text-gray-600">{template.name}</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={saveTemplate}
              disabled={saving}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {saving ? "กำลังบันทึก..." : "💾 บันทึก Template"}
            </button>
            
            <button
              onClick={reextractFields}
              disabled={loading}
              className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 disabled:bg-gray-400"
            >
              {loading ? "กำลังแยก Fields..." : "🔄 แยก Fields ใหม่"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Field Builder */}
        <div className="lg:col-span-2">
          <DynamicFieldBuilder
            templateId={templateId}
            fields={fields}
            onFieldsChange={handleFieldsChange}
          />
        </div>

        {/* Preview & Info */}
        <div className="space-y-6">
          {/* Template Info */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-4">📋 ข้อมูล Template</h3>
            <div className="space-y-2 text-sm">
              <div><strong>ชื่อ:</strong> {template.name}</div>
              <div><strong>จำนวน Fields:</strong> {fields.length}</div>
              <div><strong>สร้างเมื่อ:</strong> {new Date(template.createdAt).toLocaleDateString("th-TH")}</div>
            </div>
          </div>

          {/* Field Types Legend */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-4">🎯 ประเภท Fields</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Text:</strong> ข้อความธรรมดา</div>
              <div><strong>Date:</strong> วันที่ (1 มกราคม 2568)</div>
              <div><strong>Full Date:</strong> วันที่เต็ม (วันจันทร์ที่ 2 มกราคม 2568)</div>
              <div><strong>Select:</strong> Dropdown เลือกอย่างเดียว</div>
              <div><strong>Multi Select:</strong> Checkbox เลือกได้หลายอัน</div>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold mb-4 text-blue-800">💡 เคล็ดลับการใช้งาน</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• คลิก ✏️ เพื่อแก้ไข field</li>
              <li>• เพิ่ม options สำหรับ Select/Multi Select</li>
              <li>• กำหนด Required Fields ได้</li>
              <li>• บันทึกเป็นประจำเพื่อไม่สูญเสียข้อมูล</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
