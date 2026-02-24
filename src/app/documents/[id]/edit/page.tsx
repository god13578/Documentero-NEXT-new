// Route: Document Editor for a document instance. See README.md for architecture contract.
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { BuilderField } from "@/lib/schema/builder";
import { formatThaiDate } from "@/lib/utils/thaidate";
import { loadDocumentValues, saveDocumentValues, loadTemplateFields } from "./actions";
import { createHardenedDocx, ensureThaiFontLink, PDF_MARGINS_PT, THAI_FONT_FAMILY } from "@/lib/document/hardening";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderWithValues = (
  templateContent: string,
  fields: BuilderField[],
  values: Record<string, any>
) => {
  const fieldMap = new Map<string, BuilderField>();
  fields.forEach((f) => fieldMap.set(f.name, f));

  const replaced = templateContent.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, name) => {
    const key = String(name);
    const field = fieldMap.get(key);
    const raw = values[key];

    if (!field) return "";

    let display = "";
    if (raw === undefined || raw === null || raw === "") {
      display = "";
    } else if (field.type === "date") {
      display = formatThaiDate(raw, "short");
    } else {
      display = String(raw);
    }

    return escapeHtml(display);
  });

  return replaced.replace(/\n/g, "<br />");
};

export default function DocumentEditorPage() {
  const params = useParams();
  const documentId = params?.id as string;

  const [templateContent, setTemplateContent] = useState<string>("");
  const [templateName, setTemplateName] = useState<string>("");
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const htmlRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const pdfDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    ensureThaiFontLink();
  }, []);

  useEffect(() => {
    if (!documentId) return;
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [templateRes, savedValues] = await Promise.all([
          fetch(`/api/templates/${documentId}`, { cache: "no-store" }),
          loadDocumentValues(documentId),
        ]);

        if (!templateRes.ok) throw new Error("Failed to load template");
        const template = await templateRes.json();
        const content = template?.fieldConfig?.content ?? "";
        if (active) {
          setTemplateContent(content);
          setTemplateName(template?.name ?? "");
        }

        if (active && template?.id) {
          const templateFields = await loadTemplateFields(template.id);
          if (Array.isArray(templateFields)) {
            setFields(templateFields);
            const initial: Record<string, any> = {};
            templateFields.forEach((f: BuilderField) => {
              const existingVal = savedValues?.data?.[f.name];
              if (existingVal !== undefined) {
                initial[f.name] = existingVal;
              } else {
                initial[f.name] = f.type === "boolean" ? false : "";
              }
            });
            setValues(initial);
          } else {
            setFields([]);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [documentId]);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      const html = renderWithValues(templateContent, fields, values);
      setHtmlPreview(html);
    }, 300);
  }, [templateContent, fields, values]);

  useEffect(() => {
    if (!htmlRef.current) return;
    if (pdfDebounceRef.current) {
      window.clearTimeout(pdfDebounceRef.current);
    }
    pdfDebounceRef.current = window.setTimeout(() => generatePdf(), 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlPreview]);

  const generatePdf = async () => {
    if (!htmlRef.current) return;
    try {
      setGeneratingPdf(true);
      const canvas = await html2canvas(htmlRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const availableWidth = pageWidth - PDF_MARGINS_PT.left - PDF_MARGINS_PT.right;
      const availableHeight = pageHeight - PDF_MARGINS_PT.top - PDF_MARGINS_PT.bottom;
      const ratio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      pdf.addImage(imgData, "PNG", PDF_MARGINS_PT.left, PDF_MARGINS_PT.top, imgWidth, imgHeight);

      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text(`หน้า ${i} / ${totalPages}` as string, pageWidth / 2, pageHeight - PDF_MARGINS_PT.bottom / 2, {
          align: "center",
        });
      }
      const url = pdf.output("datauristring");
      setPdfUrl(url);
    } catch {
      setPdfUrl(null);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleInputChange = (field: BuilderField, value: any) => {
    setValues((prev) => ({ ...prev, [field.name]: value }));
  };

  const renderFieldInput = (field: BuilderField) => {
    const label = field.label || field.name;
    const value = values[field.name];

    if (field.type === "boolean") {
      return (
        <label className="flex items-center gap-2 text-sm text-slate-700" key={field.name}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => handleInputChange(field, e.target.checked)}
            className="h-4 w-4"
          />
          {label}
        </label>
      );
    }

    const commonProps = {
      id: field.name,
      name: field.name,
      value: value ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field, e.target.value),
      className: "w-full border rounded px-3 py-2 text-sm",
    };

    if (field.type === "number") {
      return (
        <div className="flex flex-col gap-1" key={field.name}>
          <label htmlFor={field.name} className="text-sm text-slate-700 font-medium">
            {label}
          </label>
          <input type="number" {...commonProps} />
        </div>
      );
    }

    if (field.type === "date") {
      return (
        <div className="flex flex-col gap-1" key={field.name}>
          <label htmlFor={field.name} className="text-sm text-slate-700 font-medium">
            {label}
          </label>
          <input type="date" {...commonProps} />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1" key={field.name}>
        <label htmlFor={field.name} className="text-sm text-slate-700 font-medium">
          {label}
        </label>
        <input type="text" {...commonProps} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">กำลังโหลด...</div>
    );
  }

  const handleSave = async () => {
    if (!documentId) return;
    try {
      setSaving(true);
      await saveDocumentValues(documentId, values);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${templateName || "document"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDocx = async () => {
    const html = renderWithValues(templateContent, fields, values);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html.replace(/<br\s*\/?>(\s*)/gi, "\n$1");
    const textContent = tempDiv.textContent || "";
    const lines = textContent.split(/\n+/).filter((line) => line.length > 0);
    const doc = createHardenedDocx(templateName || documentId, lines.length ? lines : [textContent]);
    const { Packer } = await import("docx");
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${templateName || "document"}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto bg-white border rounded-lg shadow-sm p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">แก้ไขเอกสาร: {templateName || documentId}</h1>
          <div className="flex gap-2">
            <span className="px-2 py-1 text-xs rounded-full border bg-slate-50 text-slate-600">Document Editor (Live PDF)</span>
            <button
              className="px-3 py-1 rounded text-sm border bg-blue-600 text-white disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              className="px-3 py-1 rounded text-sm border bg-white text-slate-700 disabled:opacity-50"
              onClick={handleExportPdf}
              disabled={!pdfUrl}
            >
              Export PDF
            </button>
            <button
              className="px-3 py-1 rounded text-sm border bg-white text-slate-700"
              onClick={handleExportDocx}
            >
              Export DOCX
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            {fields.length === 0 && (
              <div className="text-sm text-slate-500">ไม่พบฟิลด์สำหรับเอกสารนี้</div>
            )}
            {fields.map((field) => renderFieldInput(field))}
          </div>
          <div className="flex flex-col gap-3">
            <div className="border rounded-lg p-3 bg-slate-50">
              <div className="text-sm text-slate-600 mb-2">ตัวอย่าง HTML</div>
              <div
                ref={htmlRef}
                className="bg-white border rounded p-4 min-h-[200px] text-sm text-slate-800"
                style={{ fontFamily: THAI_FONT_FAMILY, paddingTop: "2.5cm", paddingBottom: "2.5cm", paddingLeft: "3cm", paddingRight: "2cm" }}
                dangerouslySetInnerHTML={{ __html: htmlPreview || "<div class='text-slate-400'>กรอกข้อมูลเพื่อดูตัวอย่าง</div>" }}
              />
            </div>
            <div className="border rounded-lg p-3 bg-slate-50">
              <div className="text-sm text-slate-600 mb-2 flex items-center justify-between">
                <span>ตัวอย่าง PDF</span>
                {generatingPdf && <span className="text-xs text-blue-600">กำลังสร้าง...</span>}
              </div>
              <div className="bg-white border rounded min-h-[300px] flex items-center justify-center">
                {pdfUrl ? (
                  <iframe title="PDF Preview" src={pdfUrl} className="w-full h-[400px]" />
                ) : (
                  <div className="text-sm text-slate-400">ยังไม่มีตัวอย่าง PDF</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
