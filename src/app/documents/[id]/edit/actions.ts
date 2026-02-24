"use server";

import { loadDocumentValues as loadDoc, saveDocumentValues as saveDoc } from "@/lib/document/repository";
import { getTemplateFields } from "@/lib/template/field-extractor";

export async function loadDocumentValues(documentId: string) {
  return loadDoc(documentId);
}

export async function saveDocumentValues(documentId: string, values: Record<string, any>) {
  return saveDoc(documentId, values);
}

export async function loadTemplateFields(templateId: string) {
  return getTemplateFields(templateId);
}
