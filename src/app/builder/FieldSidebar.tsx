"use client";

import { useEffect, useState } from "react";
import type { BuilderField } from "@/lib/schema/builder";

async function fetchBuilderFields(templateId?: string): Promise<BuilderField[]> {
  if (!templateId) return [];

  const res = await fetch(`/api/builder/fields?templateId=${encodeURIComponent(templateId)}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function FieldSidebar({ templateId }: { templateId?: string }) {
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadFields = async () => {
      try {
        const data = await fetchBuilderFields(templateId);
        if (active) {
          setFields(data);
        }
      } catch {
        if (active) {
          setFields([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFields();

    return () => {
      active = false;
    };
  }, [templateId]);

  return (
    <aside className="h-full border-r p-3 space-y-2 text-sm">
      <div className="font-medium mb-2">Fields</div>
      {loading ? (
        <div className="text-xs text-muted-foreground">กำลังโหลดฟิลด์...</div>
      ) : fields.length === 0 ? (
        <div className="rounded border border-dashed px-2 py-2 text-xs text-muted-foreground">
          ไม่มีฟิลด์ในแม่แบบนี้
        </div>
      ) : (
        fields.map((field) => (
          <div
            key={field.name}
            className="rounded border px-2 py-1 cursor-pointer hover:bg-muted"
          >
            {`{{${field.name}}}`}
            <span className="ml-2 text-xs text-muted-foreground">{field.type}</span>
          </div>
        ))
      )}
    </aside>
  );
}
