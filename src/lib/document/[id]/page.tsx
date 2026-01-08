import { db } from "@/lib/db/client";
import { templateFields } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createDocument } from "../actions";

export default async function CreateDocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const fields = await db.query.templateFields.findMany({
    where: eq(templateFields.templateId, params.id),
    orderBy: templateFields.orderIndex,
  });

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">กรอกข้อมูลเอกสาร</h1>

      <form action={createDocument.bind(null, params.id)}>
        {fields.map((f) => (
          <div key={f.id} className="mb-4">
            <label className="block mb-1">
              {f.fieldLabel}
            </label>

            {f.fieldType === "textarea" ? (
              <textarea
                name={f.fieldKey}
                className="border p-2 w-full"
              />
            ) : (
              <input
                name={f.fieldKey}
                className="border p-2 w-full"
              />
            )}
          </div>
        ))}

        <button className="bg-blue-600 text-white px-4 py-2">
          สร้างเอกสาร
        </button>
      </form>
    </div>
  );
}
