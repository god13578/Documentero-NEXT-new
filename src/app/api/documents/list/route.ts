import { NextResponse } from "next/server";
import { getDocuments } from "@/lib/db/queries/documents";

export async function GET() {
  try {
    const documents = await getDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}
