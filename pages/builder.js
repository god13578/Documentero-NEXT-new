import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import TemplateList from "../components/TemplateList";
import TemplateEditor from "../components/TemplateEditor";
import TemplateToolbar from "../components/TemplateToolbar";
import DocumentPreview from "../components/DocumentPreview";

// PDF viewer (client only)
const PDFViewer = dynamic(() => import("../components/PDFViewer"), {
  ssr: false,
});

export default function Builder() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [previewHtml, setPreviewHtml] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

  // ----------------------------
  // Reset preview เมื่อเปลี่ยน template
  // ----------------------------
  useEffect(() => {
    setPreviewHtml("");
    setPdfUrl(null);
  }, [selectedTemplate]);

  // ----------------------------
  // Backend fill API (SAFE)
  // ----------------------------
  async function onFill(template, data, toPdf = false) {
    try {
      const res = await fetch("/api/fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template, // ✅ ชื่อ field ตรงกับ API แล้ว
          data,
          toPdf,
        }),
      });

      const json = await res.json();

      // ❗ ไม่ throw – แค่ส่งผลกลับ
      return json;
    } catch (err) {
      console.error("Fill API error:", err);
      return {
        ok: false,
        error: err.message,
      };
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* TOP BAR */}
      <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar open={sidebarOpen} />

        {/* MAIN */}
        <main className="flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* LEFT PANEL */}
            <div className="col-span-4 bg-white rounded shadow h-full overflow-y-auto p-3">
              <TemplateToolbar name={selectedTemplate} />

              <TemplateList
                onSelect={(name) => {
                  setSelectedTemplate(name);
                }}
              />

              {selectedTemplate && (
                <TemplateEditor
                  template={selectedTemplate}
                  onFill={onFill}
                  onPreviewHtml={setPreviewHtml}
                />
              )}
            </div>

            {/* RIGHT PANEL */}
            <div className="col-span-8 bg-white rounded shadow h-full p-4 flex flex-col">
              <h3 className="font-semibold mb-2">
                {pdfUrl ? "PDF Preview" : "Live Preview"}
              </h3>

              <div className="border rounded flex-1 overflow-hidden">
                {pdfUrl ? (
                  <PDFViewer url={pdfUrl} />
                ) : (
                  <DocumentPreview html={previewHtml} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
