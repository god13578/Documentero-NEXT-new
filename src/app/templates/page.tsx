"use client";

import { useState } from "react";

export default function FillTemplate({
  template,
  fields,
}: {
  template: any;
  fields: { id: string; name: string }[];
}) {

  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/generate-docx", {
        method: "POST",
        body: JSON.stringify({
          values
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
        return;
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = template.name + ".docx";
      a.click();

    } catch (e: any) {
      alert("Generate ไม่สำเร็จ: " + e.message);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>{template?.name}</h1>

      {fields.map(f => (
        <div key={f.id} style={{ marginBottom: 12 }}>
          <label>{f.name}</label>

          <input
            style={{ width: 400 }}
            value={values[f.name] || ""}
            onChange={e =>
              handleChange(f.name, e.target.value)
            }
          />
        </div>
      ))}

      <button onClick={handleSubmit}>
        สร้างเอกสาร
      </button>
    </div>
  );
}
