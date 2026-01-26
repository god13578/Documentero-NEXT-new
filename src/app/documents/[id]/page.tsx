import { db } from "@/lib/db/client";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, params.id),
  });

  if (!doc) return <div>ไม่พบเอกสาร</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>{doc.name}</h1>

      <a href={`/api/files/docx/${doc.id}`}>
        <button>ดาวน์โหลด DOCX</button>
      </a>

      <br />
      <br />

      <button disabled>ดาวน์โหลด PDF (เร็ว ๆ นี้)</button>
    </div>
  );
}
