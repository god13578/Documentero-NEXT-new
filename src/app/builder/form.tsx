"use client";

export default function BuilderForm({
  action,
}: {
  action: (formData: FormData) => Promise<any>;
}) {
  return (
    <form
      action={action}
      encType="multipart/form-data"
      style={{ padding: 40 }}
    >
      <h1>สร้าง Template</h1>

      <input name="name" placeholder="ชื่อ Template" />

      <input name="file" type="file" accept=".docx" />

      <button>Upload</button>
    </form>
  );
}
