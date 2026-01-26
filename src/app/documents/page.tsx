"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Document {
  id: string;
  title: string;
  createdAt: Date | null;
  templateName: string | null;
  templateId: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const response = await fetch("/api/documents/list");
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        } else {
          console.error("Failed to fetch documents");
        }
      } catch (error) {
        console.error("Error loading documents:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a 
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: "#4299e1",
              textDecoration: "none",
              fontSize: 16,
              fontWeight: "500"
            }}
          >
            ← กลับหน้าแรก
          </a>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              color: "#2d3748", 
              margin: 0,
              fontSize: 32,
              fontWeight: "bold"
            }}>
              📚 จัดการเอกสาร
            </h1>
            <p style={{ 
              color: "#718096", 
              margin: "8px 0 0 0",
              fontSize: 16
            }}>
              Document Management System
            </p>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div style={{
        background: "white",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ color: "#2d3748", marginBottom: 20 }}>📄 เอกสารทั้งหมด</h2>
        
        {documents.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: 40,
            color: "#718096",
            background: "#f7fafc",
            borderRadius: 8,
            border: "2px dashed #e2e8f0"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
            <p style={{ margin: 0 }}>ยังไม่มีเอกสารในระบบ</p>
            <p style={{ margin: "8px 0 0 0", fontSize: 14 }}>
              สร้างเอกสารจาก template เพื่อเริ่มต้น
            </p>
          </div>
        ) : (
          <div style={{
            overflow: "hidden",
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{
                    padding: 16,
                    textAlign: "left",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#2d3748",
                    fontWeight: "600"
                  }}>
                    ชื่อเอกสาร
                  </th>
                  <th style={{
                    padding: 16,
                    textAlign: "left",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#2d3748",
                    fontWeight: "600"
                  }}>
                    Template
                  </th>
                  <th style={{
                    padding: 16,
                    textAlign: "left",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#2d3748",
                    fontWeight: "600"
                  }}>
                    วันที่สร้าง
                  </th>
                  <th style={{
                    padding: 16,
                    textAlign: "center",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#2d3748",
                    fontWeight: "600"
                  }}>
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr 
                    key={doc.id}
                    style={{
                      background: index % 2 === 0 ? "white" : "#f8fafc",
                      transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#edf2f7";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = index % 2 === 0 ? "white" : "#f8fafc";
                    }}
                  >
                    <td style={{
                      padding: 16,
                      borderBottom: "1px solid #e2e8f0",
                      color: "#2d3748",
                      fontWeight: "500"
                    }}>
                      {doc.title}
                    </td>
                    <td style={{
                      padding: 16,
                      borderBottom: "1px solid #e2e8f0",
                      color: "#718096"
                    }}>
                      {doc.templateName || "N/A"}
                    </td>
                    <td style={{
                      padding: 16,
                      borderBottom: "1px solid #e2e8f0",
                      color: "#718096"
                    }}>
                      {doc.createdAt && new Date(doc.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td style={{
                      padding: 16,
                      borderBottom: "1px solid #e2e8f0",
                      textAlign: "center"
                    }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <a
                          href={`/api/files/${doc.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "6px 12px",
                            background: "#4299e1",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: 6,
                            fontSize: 14,
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
                          📄 ดาวน์โหลด
                        </a>
                        <button
                          onClick={() => {
                            // TODO: Implement delete functionality
                            alert('กำลังพัฒนาฟีเจอร์ลบเอกสาร');
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "6px 12px",
                            background: "#e53e3e",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = "#c53030";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "#e53e3e";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
