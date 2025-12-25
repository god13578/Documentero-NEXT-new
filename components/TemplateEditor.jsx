import { useEffect, useRef, useState } from "react";

/* =========================
   Helper: merge values into preview HTML
========================= */
function applyValues(html, values) {
  let out = html;
  Object.entries(values).forEach(([key, value]) => {
    const safe =
      value && value.trim() !== "" ? value : `{${key}}`;
    out = out.replaceAll(`{${key}}`, safe);
  });
  return out;
}

export default function TemplateEditor({
  template,
  onFill,
  onPreviewHtml,
}) {
  const editorRef = useRef(null);

  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [labels, setLabels] = useState({});
  const [activeField, setActiveField] = useState(null);

  const [basePreview, setBasePreview] = useState("");

  /* =========================
     Load fields
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

        setValues(initValues);
        setLabels(initLabels);
      });
  }, [template]);

  /* =========================
     Load preview HTML (from mammoth)
  ========================= */
  useEffect(() => {
    if (!template) return;
    const name = template.replace(/\.docx$/i, "");
    fetch(`/api/preview?name=${name}`)
      .then((r) => r.text())
      .then(setBasePreview);
  }, [template]);

  /* =========================
     Push preview (values + highlight)
  ========================= */
  useEffect(() => {
    if (!basePreview) return;

    // 1) merge values
    let html = applyValues(basePreview, values);

    // 2) focus-only highlight
    if (activeField) {
      html = html.replace(
        new RegExp(
          `<span class="doc-field" data-field="${activeField}">([\\s\\S]*?)<\\/span>`
        ),
        `<span class="doc-field active" data-field="${activeField}">$1</span>`
      );
    }

    onPreviewHtml(html);
  }, [basePreview, values, activeField, onPreviewHtml]);

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
    setActiveField(field);
    scrollToInput(field);
  }

  function handleBlur() {
    setActiveField(null); // hide highlight
  }

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerateDocx() {
    if (!onFill) return;

    const res = await onFill(template, values, false);
    if (res?.docxUrl) {
      window.open(res.docxUrl, "_blank");
    }
  }

  /* =========================
     Render
  ========================= */
  return (
    <div
      ref={editorRef}
      className="p-4 space-y-3 max-h-[78vh] overflow-auto"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Template: {template}</h3>
        <button
          onClick={handleGenerateDocx}
          className="px-3 py-1 bg-gray-700 text-white rounded"
        >
          Generate DOCX
        </button>
      </div>

      {fields.map((key) => (
        <div key={key}>
          <label className="block font-medium mb-1">
            {labels[key]}
          </label>
          <input
            name={key}
            className="border w-full p-2 rounded"
            value={values[key] || ""}
            onFocus={() => handleFocus(key)}
            onBlur={handleBlur}
            onChange={(e) =>
              handleChange(key, e.target.value)
            }
            placeholder={`ใส่ค่า ${labels[key]}`}
          />
        </div>
      ))}
    </div>
  );
}
