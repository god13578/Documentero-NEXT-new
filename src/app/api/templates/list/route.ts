import { NextResponse } from "next/server";
import { getTemplates } from "@/lib/db/queries/templates";

export async function GET() {
  try {
    const templates = await getTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}
