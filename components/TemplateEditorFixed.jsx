import { useEffect, useRef, useState } from "react";

/* =========================
   Helper: merge values into preview HTML
========================= */
function applyValues(html, values) {
  let out = html;
  Object.entries(values).forEach(([key, value]) => {
    const safe =
      value && typeof value === 'string' && value.trim() !== "" ? value : `{${key}}`;
    out = out.replaceAll(`{${key}}`, safe);
  });
  return out;
}

export default function TemplateEditorFixed({
  templateId,
  templateName,
  onFill,
  onPreviewHtml,
}) {
  const editorRef = useRef(null);
  const isSwitchingField = useRef(false);

  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [labels, setLabels] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [generateState, setGenerateState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [basePreview, setBasePreview] = useState("");

  /* =========================
     Load fields
  ========================= */
  useEffect(() => {
    if (!templateId) return;

    fetch(`/api/templates/${templateId}/fields`)
      .then((r) => r.json())
      .then((d) => {
        console.log("Fields response:", d); // Debug log
        const f = d || [];
        // Extract field names from new structure
        const fieldNames = f.map(field => field.name);
        console.log("Field names:", fieldNames); // Debug log
        setFields(fieldNames);

        const initValues = {};
        const initLabels = {};
        fieldNames.forEach((k) => {
          initValues[k] = "";
          initLabels[k] = k;
        });

        setValues(initValues);
        setLabels(initLabels);
      })
      .catch((error) => {
        console.error("Error loading fields:", error);
      });
  }, [templateId]);

  /* =========================
     Load preview HTML (from mammoth)
  ========================= */
  useEffect(() => {
    if (!templateId) return;
    fetch(`/api/preview?template=${encodeURIComponent(templateId)}`)
      .then((r) => r.text())
      .then((html) => {
        console.log("Preview HTML loaded"); // Debug log
        setBasePreview(html);
      })
      .catch((error) => {
        console.error("Error loading preview:", error);
      });
  }, [templateId]);

  /* =========================
     Push preview (values + highlight)
  ========================= */
  useEffect(() => {
    if (!basePreview) return;

    // 1) merge values
    let html = applyValues(basePreview, values);

    // Apply THSarabun font style
    html = html.replace(
      /<body[^>]*>/,
      '<body style="font-family: THSarabun, sans-serif; font-size: 16px; line-height: 1.5;">'
    );

    // 2) focus-only highlight
    if (activeField) {
      const re = new RegExp(
        `<span class="doc-field" data-field="${activeField}">([\\s\\S]*?)<\\/span>`,
        "g"
      );
    
      html = html.replace(
        re,
        `<span class="doc-field active" data-field="${activeField}">$1</span>`
      );
    }

    // Update preview container
    const previewContainer = document.getElementById("preview-container");
    if (previewContainer) {
      previewContainer.innerHTML = html;
    }
  }, [basePreview, values, activeField]);

  /* =========================
     Helpers
  ========================= */
  function scrollToInput(field) {
    const el = editorRef.current?.querySelector(
      `input[name="${field}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* =========================
     Handlers
  ========================= */
  function handleFocus(field) {
    isSwitchingField.current = true;
    setActiveField(field);
    scrollToInput(field);

    // reset หลัง event loop
    setTimeout(() => {
      isSwitchingField.current = false;
    }, 0);
  }

  function handleBlur() {
    // ถ้า blur เพราะกำลังสลับ field → อย่า clear
    if (isSwitchingField.current) return;

    setActiveField(null);
  }

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerateDocx() {
    if (!onFill) return;

    const res = await onFill(templateId, values, false);
    if (res?.docxUrl) {
      window.open(res.docxUrl, "_blank");
    }
  }

  const handleGeneratePdf = async () => {
    try {
      setGenerateState("loading");
      setErrorMessage("");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: templateId,
          fields: values,
        }),
      });

      if (!res.ok) {
        throw new Error("Generate failed");
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.pdf";
      a.click();
      window.URL.revokeObjectURL(url);

      setGenerateState("idle");
    } catch (err) {
      console.error(err);
      setGenerateState("error");
      setErrorMessage("ไม่สามารถสร้างเอกสารได้ กรุณาลองใหม่");
    }
  };

  /* =========================
     Render
  ========================= */
  return (
    <div
      ref={editorRef}
      className="p-4 space-y-3 max-h-[78vh] overflow-auto"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Template: {templateName}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateDocx}
            className="px-3 py-1 bg-gray-700 text-white rounded"
          >
            Generate DOCX
          </button>
          <button
            onClick={handleGeneratePdf}
            disabled={generateState === "loading"}
            className={`px-3 py-1 rounded text-white transition
              ${generateState === "loading"
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
              }`}
          >
            {generateState === "loading"
              ? "กำลังสร้าง PDF..."
              : "ดาวน์โหลด PDF"}
          </button>
        </div>

        {generateState === "error" && (
          <div style={{ color: "red", marginTop: 8 }}>
            ❌ {errorMessage}
          </div>
        )}
      </div>

      {/* Debug info */}
      <div style={{ fontSize: 12, color: "#718096", marginBottom: 16 }}>
        Fields found: {fields.length} | Template ID: {templateId}
      </div>

      {fields.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: 40,
          color: "#718096",
          backgroundColor: "#f8fafc",
          borderRadius: 8,
          border: "2px dashed #e2e8f0"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
          <p style={{ margin: 0 }}>ไม่พบ Fields ใน Template</p>
          <p style={{ margin: "8px 0 0 0", fontSize: 14 }}>
            ลองคลิก "🔄 แยก Fields ใหม่" ในหน้า Edit Template
          </p>
        </div>
      ) : (
        fields.map((key) => (
          <div key={key}>
            <label className="block font-medium mb-1">
              {labels[key]}
            </label>
            
            <input
              name={key}
              className={`border w-full p-2 rounded transition${
                activeField === key
                  ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                  : "border-gray-300"
              }`}
              value={values[key] || ""}
              onFocus={() => handleFocus(key)}
              onBlur={handleBlur}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={`ใส่ค่า ${labels[key]}`}
            />
          </div>
        ))
      )}
    </div>
  );
}
