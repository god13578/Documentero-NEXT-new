// components/DocumentPreview.jsx
export default function DocumentPreview({ html }) {
  if (!html) {
    return (
      <div className="p-6 text-gray-400">
        No preview content
      </div>
    );
  }

  return (
    <div className="document-preview-wrapper">
      <div
        className="document-preview"
        // NOTE:
        // - ใช้กับ HTML ที่คุณควบคุมเอง (template)
        // - ไม่ใช้กับ input ผู้ใช้ดิบ ๆ
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
