"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TemplateList({ onSelect }) {
  const [list, setList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    const r = await fetch("/api/templates");
    const data = await r.json();
    setList(data.templates || []);
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Templates</h3>

      <div className="space-y-2">
        {list.map((t) => (
          <div
            key={t}
            className="bg-white p-3 rounded shadow hover:shadow-md cursor-pointer"
            onClick={async () => {
              try {
                if (onSelect) onSelect(t);
                const res = await fetch("/api/documents", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ templateId: t }),
                });
                const data = await res.json();
                const documentId = data?.documentId;
                if (documentId) {
                  router.push(`/documents/${documentId}/edit`);
                }
              } catch (err) {
                console.error("Failed to create document", err);
              }
            }}
          >
            <div className="font-medium">{t}</div>
            <div className="text-xs text-gray-500">Click to select</div>
          </div>
        ))}
      </div>
    </div>
  );
}
