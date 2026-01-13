import { getTemplates } from "@/lib/db/queries/templates";

export default async function HomePage() {
  const templates = await getTemplates();

  return (
    <div style={{ padding: 30 }}>
      <h1>Documentero</h1>

      <a href="/builder">➕ สร้าง Template ใหม่</a>

      <h2>Templates</h2>

      <ul>
        {templates.map((t) => (
          <li key={t.id}>
            <a href={`/builder/${t.id}`}>{t.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
