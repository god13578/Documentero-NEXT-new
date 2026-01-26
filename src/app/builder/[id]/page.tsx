"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TemplateEditor from "../../../../components/TemplateEditor";
import DocumentPreview from "../../../../components/DocumentPreview";

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

interface Template {
  id: string;
  name: string;
  docxPath: string;
  createdAt: Date | null;
}

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = (params?.id as string) || "";

  const [template, setTemplate] = useState<Template | null>(null);
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Load template
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
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (templateId) {
      loadData();
    }
  }, [templateId]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          background: "white",
          borderRadius: 12,
          padding: 40,
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h2 style={{ color: "#2d3748", margin: 0 }}>กำลังโหลด...</h2>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          background: "white",
          borderRadius: 12,
          padding: 40,
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ color: "#2d3748", margin: 0 }}>ไม่พบ Template</h2>
          <p style={{ color: "#718096", margin: "8px 0 0 0" }}>
            Template ที่คุณต้องการไม่มีอยู่ในระบบ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: 20
    }}>
      {/* Header */}
      <div style={{
        background: "white",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => router.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#6b7280",
              color: "white",
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              fontSize: 14,
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#4b5563";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#6b7280";
            }}
          >
            ← ย้อนกลับ
          </button>
          
          <div>
            <h1 style={{ 
              color: "#2d3748", 
              margin: 0,
              fontSize: 24,
              fontWeight: "bold"
            }}>
              📝 Document Builder
            </h1>
            <p style={{ 
              color: "#718096", 
              margin: "4px 0 0 0",
              fontSize: 16
            }}>
              Template: {template.name}
            </p>
          </div>
          <a
            href={`/templates/${template.id}/edit`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#9f7aea",
              color: "white",
              padding: "8px 16px",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#805ad5";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#9f7aea";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ✏️ แก้ไข Template
          </a>
          
          {/* Debug info */}
          <div style={{ fontSize: 12, color: "#718096" }}>
            Template ID: {template.id}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", gap: 24 }}>
        {/* Template Editor */}
        <div style={{ flex: 1 }}>
          <TemplateEditor
            templateId={template.name}
            templateName={template.name}
            onFill={() => {}}
            onPreviewHtml={(html) => setPreviewHtml(html)}
          />
        </div>
        
        {/* Preview */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: "white",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}>
            <h2 style={{ color: "#2d3748", marginBottom: 20 }}>👁️ Live Preview</h2>
            <div
              style={{
                border: "2px solid #e2e8f0",
                borderRadius: 8,
                minHeight: 400,
                backgroundColor: "#f2f2f2",
                padding: 8
              }}
            >
              <DocumentPreview html={previewHtml} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
