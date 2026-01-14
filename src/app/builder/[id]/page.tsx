import { getTemplateWithFields } from "@/lib/db/queries/builder";

export default async function BuilderPage({
  params,
}: {
  params: { id: string };
}) {
  const { template, fields } = await getTemplateWithFields(params.id);

  if (!template) {
    return <div>ไม่พบ Template</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>{template.name}</h1>

      <form>
        {fields.map((f) => (
          <div key={f.id} style={{ marginBottom: 12 }}>
            <label>{f.name}</label>
            <br />
            <input
              name={f.name}
              style={{ width: 300 }}
            />
          </div>
        ))}

        <button>สร้างเอกสาร</button>
      </form>
    </div>
  );
}
