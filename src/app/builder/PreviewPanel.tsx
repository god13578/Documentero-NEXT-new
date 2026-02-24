"use client";

type ViewMode = "html" | "pdf";

type Props = {
  htmlContent: string;
  pdfUrl: string | null;
  generatingPdf: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  htmlRef: React.RefObject<HTMLDivElement>;
};

export default function PreviewPanel({
  htmlContent,
  pdfUrl,
  generatingPdf,
  viewMode,
  onViewModeChange,
  htmlRef,
}: Props) {
  return (
    <div className="h-full flex flex-col bg-slate-50 border-t">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-white">
        <div className="font-semibold text-slate-700">Preview</div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded text-sm border ${
              viewMode === "html" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700"
            }`}
            onClick={() => onViewModeChange("html")}
          >
            HTML
          </button>
          <button
            className={`px-3 py-1 rounded text-sm border ${
              viewMode === "pdf" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700"
            }`}
            onClick={() => onViewModeChange("pdf")}
          >
            PDF
          </button>
        </div>
      </div>

      {viewMode === "html" ? (
        <div className="flex-1 overflow-auto p-4">
          <div
            ref={htmlRef}
            className="bg-white shadow-sm rounded border border-slate-200 p-4 text-slate-800 min-h-[400px]"
            dangerouslySetInnerHTML={{ __html: htmlContent || "<div class='text-slate-400 italic'>ไม่มีข้อมูลในเทมเพลต</div>" }}
          />
        </div>
      ) : (
        <div className="flex-1 bg-slate-100 flex items-center justify-center p-4">
          {generatingPdf ? (
            <div className="text-sm text-slate-600">กำลังสร้าง PDF...</div>
          ) : pdfUrl ? (
            <iframe title="PDF Preview" src={pdfUrl} className="w-full h-full bg-white border rounded" />
          ) : (
            <div className="text-sm text-slate-500">ไม่มี PDF ให้แสดง</div>
          )}
        </div>
      )}
    </div>
  );
}
