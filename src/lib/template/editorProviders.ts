import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import type { BuilderField } from "@/lib/schema/builder";

let cachedFields: BuilderField[] | null = null;
let fieldsPromise: Promise<BuilderField[]> | null = null;

async function loadFields(): Promise<BuilderField[]> {
  if (cachedFields) return cachedFields;
  if (fieldsPromise) return fieldsPromise;

  fieldsPromise = (async () => {
    try {
      const res = await fetch("/api/builder/fields", { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      cachedFields = list;
      return list;
    } catch {
      cachedFields = [];
      return [];
    } finally {
      fieldsPromise = null;
    }
  })();

  return fieldsPromise;
}

function findField(name: string | undefined, fields: BuilderField[]): BuilderField | undefined {
  if (!name) return undefined;
  return fields.find((f) => f.name === name);
}

function isWithinMustache(model: monaco.editor.ITextModel, position: monaco.Position) {
  const line = model.getLineContent(position.lineNumber);
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    const start = match.index + 1; // 0-based index for first '{'
    const end = match.index + match[0].length;
    const col = position.column - 1; // convert to 0-based
    if (col >= start && col <= end) {
      return match[1];
    }
  }
  return undefined;
}

let providersRegistered = false;

export function registerDocumenteroProviders(monacoInstance: typeof monaco) {
  if (providersRegistered) return;

  monacoInstance.languages.registerCompletionItemProvider("documentero", {
    triggerCharacters: ["{"],
    async provideCompletionItems(model, position) {
      const range = new monacoInstance.Range(position.lineNumber, position.column - 1, position.lineNumber, position.column - 1);
      const textBefore = model.getValueInRange(
        new monacoInstance.Range(position.lineNumber, Math.max(1, position.column - 2), position.lineNumber, position.column)
      );
      if (!textBefore.endsWith("{{")) {
        return { suggestions: [] };
      }

      const fields = await loadFields();
      const suggestions = fields.map((field) => ({
        label: field.name,
        kind: monacoInstance.languages.CompletionItemKind.Field,
        insertText: `{{${field.name}}}`,
        range,
        sortText: `a_${field.name}`,
        detail: `${field.label || field.name} (${field.type})${field.required ? " · required" : ""}`,
      }));

      return { suggestions };
    },
  });

  monacoInstance.languages.registerHoverProvider("documentero", {
    async provideHover(model, position) {
      const fields = await loadFields();
      const name = isWithinMustache(model, position);
      const field = findField(name, fields);
      if (!field) return { contents: [] };

      const requiredText = field.required ? "Required" : "Optional";
      const contents = [
        { value: `**${field.label || field.name}**` },
        { value: "Type: `" + field.type + "`" },
        { value: requiredText },
      ];

      return { contents };
    },
  });

  providersRegistered = true;
}
