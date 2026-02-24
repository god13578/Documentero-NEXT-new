type MonarchLanguage = {
  tokenizer: {
    root: Array<any>;
    comment: Array<any>;
    template: Array<any>;
  };
};

type Monaco = {
  languages: {
    register: (language: { id: string }) => void;
    setMonarchTokensProvider: (languageId: string, language: MonarchLanguage) => void;
    getLanguages: () => { id: string }[];
  };
};

const documenteroMonarch: MonarchLanguage = {
  tokenizer: {
    root: [
      [/\{\{!--/, { token: "comment", next: "@comment" }],
      [/\{\{/, { token: "delimiter.bracket", next: "@template" }],
      [/[^{}]+/, "text"],
      [/[{}]/, "text"],
    ],
    comment: [
      [/--\}\}/, { token: "comment", next: "@pop" }],
      [/[^-]+/, "comment"],
      [/[-]/, "comment"],
    ],
    template: [
      [/\s+/, "white"],
      [/(#if|#each|\/if|\/each)\b/, "keyword"],
      [/[a-zA-Z_][\w-]*/, "identifier"],
      [/\}\}/, { token: "delimiter.bracket", next: "@pop" }],
      [/[^}]+/, "text"],
    ],
  },
};

let registered = false;

export function registerDocumenteroLanguage(monaco: Monaco) {
  if (registered) return;

  const hasLanguage = monaco.languages
    .getLanguages()
    .some((language) => language.id === "documentero");

  if (!hasLanguage) {
    monaco.languages.register({ id: "documentero" });
  }

  monaco.languages.setMonarchTokensProvider("documentero", documenteroMonarch);
  registered = true;
}
