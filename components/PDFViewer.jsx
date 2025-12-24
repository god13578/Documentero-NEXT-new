export default function PDFViewer({ pdfUrl, previewHtml }) {
  if (pdfUrl) {
    return (
      <iframe
        src={pdfUrl}
        className="w-full h-[90vh] border"
        title="PDF Preview"
      />
    );
  }

  return (
    <div className="border p-6 bg-white h-[90vh] overflow-auto">
      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
    </div>
  );
}
