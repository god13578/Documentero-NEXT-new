import { Document, Footer, Header, PageNumber, Paragraph, TextRun, AlignmentType } from "docx";

export const THAI_FONT_FAMILY = '"TH Sarabun New", "TH Sarabun", "Sarabun", sans-serif';

export const PDF_MARGINS_PT = {
  top: 70.866, // 2.5 cm
  bottom: 70.866, // 2.5 cm
  left: 85.039, // 3.0 cm
  right: 56.693, // 2.0 cm
};

const CM_TO_TWIP = 566.93; // 1 cm = 566.93 twips
export const DOCX_MARGINS_TWIPS = {
  top: Math.round(2.5 * CM_TO_TWIP),
  bottom: Math.round(2.5 * CM_TO_TWIP),
  left: Math.round(3.0 * CM_TO_TWIP),
  right: Math.round(2.0 * CM_TO_TWIP),
};

export function ensureThaiFontLink() {
  if (typeof document === "undefined") return;
  const existing = document.getElementById("thai-sarabun-font-link");
  if (existing) return;
  const link = document.createElement("link");
  link.id = "thai-sarabun-font-link";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600&display=swap";
  document.head.appendChild(link);
}

export function createHardenedDocx(title: string, lines: string[]): Document {
  const headerChildren = title
    ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: title, bold: true })],
        }),
      ]
    : [];

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "TH Sarabun New",
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
        heading1: { run: { font: "TH Sarabun New" } },
        heading2: { run: { font: "TH Sarabun New" } },
        heading3: { run: { font: "TH Sarabun New" } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: DOCX_MARGINS_TWIPS.top,
              bottom: DOCX_MARGINS_TWIPS.bottom,
              left: DOCX_MARGINS_TWIPS.left,
              right: DOCX_MARGINS_TWIPS.right,
            },
          },
        },
        headers: headerChildren.length
          ? {
              default: new Header({ children: headerChildren }),
            }
          : {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: ["หน้า ", PageNumber.CURRENT] })],
              }),
            ],
          }),
        },
        children: lines.length
          ? lines.map(
              (line) =>
                new Paragraph({
                  children: [new TextRun(line)],
                })
            )
          : [
              new Paragraph({
                children: [new TextRun("")],
              }),
            ],
      },
    ],
  });
}
