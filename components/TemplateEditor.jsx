import { useEffect, useRef, useState } from "react";

/* =========================
   Preview helper (Documentero style)
========================= */
function applyPreviewData(html, data) {
  let out = html;
  Object.entries(data).forEach(([key, value]) => {
    const safeValue =
      value && value.trim() !== "" ? value : `{${key}}`;
    out = out.replaceAll(`{${key}}`, safeValue);
  });
  return out;
}

export default function TemplateEditor({
  template,
  onFill,
  onPreviewUrl,
  onPreviewHtml,
}) {
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [labels, setLabels] = useState({});
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState("ready");

  // 🔵 preview state (NEW)
  const [basePreview, setBasePreview] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");

  /* =========================
     Load fields (เดิม)
  ========================= */
  useEffect(() => {
    if (!template) return;

    fetch(`/api/fields?template=${encodeURIComponent(template)}`)
      .then((r) => r.json())
      .then((d) => {
        const f = d.fields || [];
        setFields(f);

        const initValues = {};
        const initLabels = {};
        f.forEach((k) => {
          initValues[k] = "";
          initLabels[k] = k;
        });

        // restore draft
        const saved = localStorage.getItem(`draft-${template}`);
        if (saved) {
          Object.assign(initValues, JSON.parse(saved));
        }

        setValues(initValues);
        setLabels(initLabels);
      });
  }, [template]);

  /* =========================
     Load preview.html (NEW)
  ========================= */
  useEffect(() => {
    if (!template) return;

    const name = template.replace(/\.docx$/i, "");
    fetch(`/api/preview?name=${name}`)
      .then((r) => r.text())
      .then((html) => {
        setBasePreview(html);
      })
      .catch(() => {
        setBasePreview("");
      });
  }, [template]);

  /* =========================
     Live preview (STATE ONLY)
  ========================= */
  useEffect(() => {
    if (!basePreview) return;
    const merged = applyPreviewData(basePreview, values);
    setPreviewHtml(merged);
    onPreviewHtml?.(merged);
  }, [values, basePreview, onPreviewHtml]);

  /* =========================
     Autosave (เดิม)
  ========================= */
  useEffect(() => {
    if (!template) return;
    localStorage.setItem(`draft-${template}`, JSON.stringify(values));
  }, [values, template]);

  /* =========================
     Handlers
  ========================= */
  function setVal(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
    // ❌ ไม่เรียก PDF / LibreOffice ตรงนี้แล้ว
  }

  async function handleGeneratePdf() {
    try {
      setStatus("generating");
      const res = await onFill(template, values, true);
      if (res?.pdfUrl) {
        onPreviewUrl(res.pdfUrl + "?t=" + Date.now());
      }
    } finally {
      setStatus("ready");
    }
  }

  async function handleGenerateDocx() {
    const res = await onFill(template, values, false);
    if (res?.docxUrl) {
      window.open(res.docxUrl, "_blank");
    }
  }

  function startEditLabel(key) {
    setEditing(key);
  }

  function saveLabel(key, newLabel) {
    setLabels((prev) => ({
      ...prev,
      [key]: newLabel || key,
    }));
    setEditing(null);
  }

  /* =========================
     Render (UI เดิม)
  ========================= */
  return (
    <div className="p-4 space-y-3 max-h-[78vh] overflow-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Template: {template}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateDocx}
            className="px-3 py-1 bg-gray-600 text-white rounded"
          >
            Generate DOCX
          </button>
          <button
            onClick={handleGeneratePdf}
            disabled={status === "generating"}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            {status === "generating" ? "Generating..." : "Generate PDF"}
          </button>
        </div>
      </div>

      {fields.map((key) => (
        <div key={key} className="mb-3">
          <div className="flex items-center justify-between mb-1">
            {!editing || editing !== key ? (
              <>
                <label className="font-medium">{labels[key]}</label>
                <button
                  onClick={() => startEditLabel(key)}
                  className="text-xs text-blue-600"
                >
                  edit
                </button>
              </>
            ) : (
              <input
                className="border p-1 rounded w-full"
                defaultValue={labels[key]}
                onBlur={(e) => saveLabel(key, e.target.value)}
                autoFocus
              />
            )}
          </div>

          <input
            className="border w-full p-2 rounded"
            value={values[key] || ""}
            onChange={(e) => setVal(key, e.target.value)}
            placeholder={`ใส่ค่า ${labels[key]}`}
          />
        </div>
      ))}
    </div>
  );
}
