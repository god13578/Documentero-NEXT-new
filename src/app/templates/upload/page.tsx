"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadTemplatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("อัปโหลด Template สำเร็จ!");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 500 }}>
      <h1>อัปโหลด Template</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>ชื่อ Template:</label>
          <br />
          <input 
            name="name" 
            placeholder="ใส่ชื่อ Template" 
            required
            style={{ 
              width: "100%", 
              padding: 8, 
              marginTop: 4,
              border: "1px solid #ccc",
              borderRadius: 4
            }} 
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>ไฟล์ Template (.docx):</label>
          <br />
          <input 
            name="file" 
            type="file" 
            accept=".docx" 
            required
            style={{ marginTop: 4 }}
          />
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: 16 }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ color: "green", marginBottom: 16 }}>
            ✅ {success}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            backgroundColor: isLoading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "กำลังอัปโหลด..." : "อัปโหลด"}
        </button>
      </form>
    </div>
  );
}
