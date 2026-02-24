import type { BuilderField } from "@/lib/schema/builder";
import { formatThaiDate } from "@/lib/utils/thaidate";

export type RenderResult = {
  html: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export function renderTemplate(content: string, fields: BuilderField[]): RenderResult {
  const samples = new Map<string, string>();
  fields.forEach((f) => {
    const sample = f.type === "date" ? formatThaiDate(new Date(), "short") : f.label || f.name;
    samples.set(f.name, sample);
  });

  const replaced = content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, name) => {
    const key = String(name);
    const val = samples.get(key) ?? "";
    return escapeHtml(val);
  });

  const html = replaced.replace(/\n/g, "<br />");

  return { html };
}
