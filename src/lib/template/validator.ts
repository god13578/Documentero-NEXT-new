import type { BuilderField } from "@/lib/schema/builder";

export type TemplateError = {
  message: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
};

export function validateTemplate(content: string, fields: BuilderField[]): TemplateError[] {
  const allowed = new Set(fields.map((f) => f.name));
  const errors: TemplateError[] = [];
  const lines = content.split(/\r?\n/);

  lines.forEach((line, lineIndex) => {
    let i = 0;
    while (i < line.length) {
      if (line.startsWith("{{", i)) {
        const close = line.indexOf("}}", i + 2);
        if (close === -1) {
          errors.push({
            message: "Unclosed template expression",
            startLine: lineIndex + 1,
            endLine: lineIndex + 1,
            startColumn: i + 1,
            endColumn: line.length + 1,
          });
          break;
        }

        const raw = line.slice(i + 2, close);
        const name = raw.trim();

        if (name.length === 0) {
          errors.push({
            message: "Empty template expression",
            startLine: lineIndex + 1,
            endLine: lineIndex + 1,
            startColumn: i + 1,
            endColumn: close + 2,
          });
        } else if (!allowed.has(name)) {
          errors.push({
            message: `Unknown field "${name}"`,
            startLine: lineIndex + 1,
            endLine: lineIndex + 1,
            startColumn: i + 1,
            endColumn: close + 2,
          });
        }

        i = close + 2;
        continue;
      }

      if (line.startsWith("}}", i)) {
        errors.push({
          message: "Unexpected closing braces",
          startLine: lineIndex + 1,
          endLine: lineIndex + 1,
          startColumn: i + 1,
          endColumn: i + 3,
        });
        i += 2;
        continue;
      }

      i += 1;
    }
  });

  return errors;
}
