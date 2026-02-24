"use client";

import type { TemplateError } from "@/lib/template/validator";

type Props = {
  errors: TemplateError[];
  onSelect: (line: number, column: number) => void;
};

export default function ErrorPanel({ errors, onSelect }: Props) {
  if (!errors.length) {
    return (
      <div className="border-t bg-slate-50 px-3 py-2 text-xs text-slate-500">
        ไม่มีข้อผิดพลาดในแม่แบบ
      </div>
    );
  }

  return (
    <div className="border-t bg-white px-3 py-2 space-y-1 max-h-32 overflow-auto text-sm">
      {errors.map((err, idx) => (
        <button
          key={`${err.startLine}-${err.startColumn}-${idx}`}
          className="w-full text-left hover:bg-slate-100 rounded px-2 py-1 text-slate-800"
          onClick={() => onSelect(err.startLine, err.startColumn)}
        >
          <div className="font-medium text-rose-600">{err.message}</div>
          <div className="text-xs text-slate-500">บรรทัด {err.startLine}</div>
        </button>
      ))}
    </div>
  );
}
