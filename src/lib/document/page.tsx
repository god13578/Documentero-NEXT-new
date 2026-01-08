import Link from "next/link";
import { db } from "@/lib/db/client";

export default async function DocumentsPage() {
  const templates = await db.query.templates.findMany();

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">สร้างเอกสาร</h1>

      <ul className="space-y-2">
        {templates.map((t) => (
          <li key={t.id}>
            <Link
              href={`/documents/${t.id}`}
              className="text-blue-600 underline"
            >
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
