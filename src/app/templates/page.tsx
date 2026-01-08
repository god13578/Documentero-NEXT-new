"use client";

import { useFormState } from "react-dom";
import { uploadTemplate } from "./actions";

export default function TemplatesPage() {
  const [state, action] = useFormState(uploadTemplate, null);

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">เพิ่ม Template</h1>

      <form action={action} className="space-y-4">
        <input
          name="name"
          placeholder="ชื่อ Template"
          className="border p-2 w-full"
        />

        <input
          type="file"
          name="file"
          accept=".docx"
          className="border p-2 w-full"
        />

        {state?.error && (
          <p className="text-red-600">{state.error}</p>
        )}

        <button className="bg-green-600 text-white px-4 py-2">
          อัปโหลด
        </button>
      </form>
    </div>
  );
}
