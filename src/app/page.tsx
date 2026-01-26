"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Template {
  id: string;
  name: string;
  docxPath: string;
  createdAt: Date | null;
}

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`คุณต้องการลบ template "${templateName}" ใช่หรือไม่?\n\nการลบจะไม่สามารถกู้คืนได้`)) {
      return;
    }

    setDeletingId(templateId);
    
    try {
      const response = await fetch(`/api/templates/${templateId}/delete`, {
        method: "DELETE"
      });

      if (response.ok) {
        // Remove template from state
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        alert(`ลบ template "${templateName}" สำเร็จแล้ว`);
      } else {
        const error = await response.json();
        alert(`ไม่สามารถลบ template: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("เกิดข้อผิดพลาดในการลบ template");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch("/api/templates/list");
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        } else {
          console.error("Failed to fetch templates");
        }
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

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
        <h1 style={{ 
          color: "#2d3748", 
          margin: 0,
          fontSize: 32,
          fontWeight: "bold"
        }}>
          🏛️ ระบบจัดการเอกสารราชการ
        </h1>
        <p style={{ 
          color: "#718096", 
          margin: "8px 0 0 0",
          fontSize: 16
        }}>
          Document Management System for Government Services
        </p>
      </div>

      {/* Actions */}
      <div style={{
        background: "white",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ color: "#2d3748", marginBottom: 16 }}>📋 จัดการระบบ</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <Link 
            href="/templates/upload"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#4299e1",
              color: "white",
              padding: "12px 24px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#3182ce";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#4299e1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ➕ อัปโหลด Template ใหม่
          </Link>
          
          <Link 
            href="/documents"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#48bb78",
              color: "white",
              padding: "12px 24px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#38a169";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#48bb78";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            📚 จัดการเอกสาร
          </Link>
        </div>
      </div>

      {/* Templates List */}
      <div style={{
        background: "white",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ color: "#2d3748", marginBottom: 20 }}>📄 Templates ที่มีอยู่</h2>
        
        {templates.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: 40,
            color: "#718096",
            background: "#f7fafc",
            borderRadius: 8,
            border: "2px dashed #e2e8f0"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
            <p style={{ margin: 0 }}>ยังไม่มี Template ในระบบ</p>
            <p style={{ margin: "8px 0 0 0", fontSize: 14 }}>
              คลิก "อัปโหลด Template ใหม่" เพื่อเริ่มต้น
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16
          }}>
            {templates.map((template) => (
              <div
                key={template.id}
                style={{
                  padding: 20,
                  background: "#f8fafc",
                  border: "2px solid #e2e8f0",
                  borderRadius: 8,
                  color: "#2d3748",
                  transition: "all 0.2s",
                  position: "relative"
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: 18, 
                  fontWeight: "600",
                  color: "#2d3748"
                }}>
                  {template.name}
                </h3>
                <p style={{ 
                  margin: "8px 0 16px 0", 
                  fontSize: 14, 
                  color: "#718096"
                }}>
                  คลิกเพื่อสร้างเอกสารจาก template นี้
                </p>
                
                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href={`/builder/${template.id}`}
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#4299e1",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: 6,
                      textDecoration: "none",
                      fontSize: 14,
                      fontWeight: "500",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#3182ce";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#4299e1";
                    }}
                  >
                    🚀 สร้างเอกสาร
                  </Link>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id, template.name);
                    }}
                    disabled={deletingId === template.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: deletingId === template.id ? "#fc8181" : "#e53e3e",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "none",
                      fontSize: 14,
                      fontWeight: "500",
                      cursor: deletingId === template.id ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      opacity: deletingId === template.id ? 0.7 : 1
                    }}
                    onMouseOver={(e) => {
                      if (deletingId !== template.id) {
                        e.currentTarget.style.background = "#c53030";
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = deletingId === template.id ? "#fc8181" : "#e53e3e";
                    }}
                  >
                    {deletingId === template.id ? "⏳" : "🗑️"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
