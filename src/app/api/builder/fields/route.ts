import { NextResponse } from "next/server";
import { getBuilderFields } from "@/lib/schema/builder";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("templateId") || undefined;
    const fields = await getBuilderFields(templateId);
    return NextResponse.json(fields);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
