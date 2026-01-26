"use client";

import { useState, useEffect } from "react";

interface RealtimePreviewProps {
  templateId: string;
  values: Record<string, string>;
}

export default function RealtimePreview({ templateId, values }: RealtimePreviewProps) {
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPreview() {
      setLoading(true);
      try {
        const response = await fetch(`/api/preview?template=${templateId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values }),
        });

        if (response.ok) {
          const html = await response.text();
          setPreview(html);
        }
      } catch (error) {
        console.error("Error fetching preview:", error);
      } finally {
        setLoading(false);
      }
    }

    if (templateId) {
      fetchPreview();
    }
  }, [templateId, values]);

  return (
    <div style={{
      border: "2px solid #e2e8f0",
      borderRadius: 8,
      padding: 20,
      minHeight: 400,
      backgroundColor: "#f8fafc"
    }}>
      {loading ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          color: "#718096"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            <p>กำลังโหลดตัวอย่าง...</p>
          </div>
        </div>
      ) : preview ? (
        <div
          style={{
            fontFamily: "THSarabun, sans-serif",
            fontSize: "16px",
            lineHeight: "1.5",
            color: "#2d3748",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "4px",
            minHeight: "300px"
          }}
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      ) : (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          color: "#718096"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <p>ตัวอย่างเอกสารจะปรากฏที่นี่</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              กรอกข้อมูลเพื่อดูตัวอย่างแบบ real-time
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
