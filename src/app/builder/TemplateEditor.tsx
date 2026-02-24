"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { registerDocumenteroLanguage } from "@/lib/template/language";
import { registerDocumenteroProviders } from "@/lib/template/editorProviders";
import { validateTemplate, type TemplateError } from "@/lib/template/validator";
import { renderTemplate } from "@/lib/template/renderer";
import ErrorPanel from "@/app/builder/ErrorPanel";
import PreviewPanel from "@/app/builder/PreviewPanel";
import type { BuilderField } from "@/lib/schema/builder";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { loadTemplateAction, saveTemplateAction } from "./actions";
import Link from "next/link";

type ViewMode = "html" | "pdf";

type TemplateEditorProps = {
  templateId?: string;
};

export default function TemplateEditor({ templateId }: TemplateEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const debounceRef = useRef<number | null>(null);
  const pdfDebounceRef = useRef<number | null>(null);
  const htmlPreviewRef = useRef<HTMLDivElement | null>(null);

  const [fields, setFields] = useState<BuilderField[]>([]);
  const [errors, setErrors] = useState<TemplateError[]>([]);
  const [htmlPreview, setHtmlPreview] = useState<string>("เรียน {{fullname}}\n\nตำแหน่ง {{position}}");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("html");
  const [saving, setSaving] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState<string>("");

  useEffect(() => {
    let active = true;

    const loadFields = async () => {
      try {
        const res = await fetch("/api/builder/fields", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data)) {
          setFields(data);
        }
      } catch {
        if (active) setFields([]);
      }
    };

    loadFields();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!templateId) return;
    let active = true;

    const loadTemplate = async () => {
      try {
        setLoadingTemplate(true);
        const existing = await loadTemplateAction(templateId);
        if (active && existing && editorRef.current) {
          editorRef.current.setValue(existing.content || "");
          runProcessing(existing.content || "");
          setTemplateName(existing.name || "");
        }
      } finally {
        if (active) setLoadingTemplate(false);
      }
    };

    loadTemplate();

    return () => {
      active = false;
    };
  }, [templateId]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const current = editorRef.current.getValue();
      runProcessing(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  useEffect(() => {
    if (!htmlPreviewRef.current) return;
    if (pdfDebounceRef.current) {
      window.clearTimeout(pdfDebounceRef.current);
    }
    pdfDebounceRef.current = window.setTimeout(() => generatePdf(), 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlPreview]);

  const applyMarkers = (list: TemplateError[]) => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const markers = list.map((err) => ({
      message: err.message,
      severity: monacoRef.current!.MarkerSeverity.Error,
      startLineNumber: err.startLine,
      startColumn: err.startColumn,
      endLineNumber: err.endLine,
      endColumn: err.endColumn,
    }));

    monacoRef.current.editor.setModelMarkers(model, "documentero-validation", markers);
  };

  const runProcessing = (value: string | undefined) => {
    const text = value ?? "";
    const validation = validateTemplate(text, fields);
    setErrors(validation);
    applyMarkers(validation);

    const rendered = renderTemplate(text, fields);
    setHtmlPreview(rendered.html);
  };

  const scheduleProcessing = (value: string | undefined) => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => runProcessing(value), 250);
  };

  const generatePdf = async () => {
    if (!htmlPreviewRef.current) return;
    try {
      setGeneratingPdf(true);
      const canvas = await html2canvas(htmlPreviewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      const url = pdf.output("datauristring");
      setPdfUrl(url);
    } catch {
      setPdfUrl(null);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco as typeof Monaco;
    registerDocumenteroProviders(monaco as typeof Monaco);
    runProcessing(editor.getValue());
  };

  const handleChange: OnChange = (value) => {
    scheduleProcessing(value);
  };

  const handleSelectError = (line: number, column: number) => {
    if (!editorRef.current) return;
    editorRef.current.revealPositionInCenter({ lineNumber: line, column });
    editorRef.current.setPosition({ lineNumber: line, column });
    editorRef.current.focus();
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleSave = async () => {
    if (errors.length > 0 || saving || !templateId || !editorRef.current) return;
    try {
      setSaving(true);
      const content = editorRef.current.getValue();
      await saveTemplateAction(templateId, content ?? "");
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    const filename = `${templateName || "template"}.pdf`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      <ResizablePanel defaultSize={60} minSize={40}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white">
            <div className="text-sm text-slate-600">
              {loadingTemplate
                ? "กำลังโหลด..."
                : templateId
                  ? `Template: ${templateName || templateId}`
                  : "Template ใหม่"}
            </div>
            <div className="flex gap-2">
              {templateId && (
                <Link
                  href={`/documents/${templateId}/edit`}
                  className="px-3 py-1 rounded text-sm border bg-white text-blue-700 hover:bg-blue-50"
                >
                  Open Document Editor
                </Link>
              )}
              <button
                className="px-3 py-1 rounded text-sm border bg-blue-600 text-white disabled:opacity-50"
                onClick={handleSave}
                disabled={errors.length > 0 || saving || !templateId}
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
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="documentero"
              defaultValue={`เรียน {{fullname}}\n\nตำแหน่ง {{position}}`}
              theme="vs-dark"
              beforeMount={registerDocumenteroLanguage}
              onMount={handleMount}
              onChange={handleChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
              }}
            />
          </div>
          <ErrorPanel errors={errors} onSelect={handleSelectError} />
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={40} minSize={25}>
        <PreviewPanel
          htmlContent={htmlPreview}
          pdfUrl={pdfUrl}
          generatingPdf={generatingPdf}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          htmlRef={htmlPreviewRef}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
