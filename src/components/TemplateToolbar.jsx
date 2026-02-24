export default function TemplateToolbar({ name }) {
  return (
    <div className="bg-white border-b px-4 py-2 flex items-center gap-3">
      <span className="font-medium">Template:</span>
      <span className="text-accent">{name || "None selected"}</span>
    </div>
  );
}
