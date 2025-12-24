import { useEffect, useState } from "react";

export default function TemplateList({ onSelect }) {
  const [list, setList] = useState([]);

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
            onClick={() => onSelect(t)}
          >
            <div className="font-medium">{t}</div>
            <div className="text-xs text-gray-500">Click to select</div>
          </div>
        ))}
      </div>
    </div>
  );
}
