import Link from "next/link";
import { db } from "@/lib/db/client";
import { documents, templates, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function DocumentHistoryPage() {
  const rows = await db
    .select({
      id: documents.id,
      title: documents.title,
      createdAt: documents.createdAt,
      docxPath: documents.docxPath,
      pdfPath: documents.pdfPath,
      templateName: templates.name,
      fullName: users.fullName,
    })
    .from(documents)
    .leftJoin(templates, eq(documents.templateId, templates.id))
    .leftJoin(users, eq(documents.createdBy, users.id))
    .orderBy(desc(documents.createdAt));

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">ประวัติเอกสาร</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">เรื่อง</th>
            <th className="border p-2">Template</th>
            <th className="border p-2">ผู้สร้าง</th>
            <th className="border p-2">วันที่</th>
            <th className="border p-2">ไฟล์</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">{r.title}</td>
              <td className="border p-2">{r.templateName}</td>
              <td className="border p-2">{r.fullName}</td>
              <td className="border p-2">
                {r.createdAt.toLocaleDateString("th-TH")}
              </td>
              <td className="border p-2 space-x-2">
                <Link
                  href={`/api/files/docx/${r.id}`}
                  className="text-blue-600 underline"
                >
                  DOCX
                </Link>
                {r.pdfPath && (
                  <Link
                    href={`/api/files/pdf/${r.id}`}
                    className="text-red-600 underline"
                  >
                    PDF
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
