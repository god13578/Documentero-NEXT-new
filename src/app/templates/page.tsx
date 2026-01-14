import { db } from "@/lib/db/client";
import { templates } from "@/lib/db/schema";
import Link from "next/link";

export default async function TemplatesPage() {
  const list = await db.select().from(templates);

  return (
    <div style={{ padding: 40 }}>
      <h1>Templates</h1>

      <ul>
        {list.map((t) => (
          <li key={t.id}>
            <Link href={`/templates/${t.id}`}>
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
