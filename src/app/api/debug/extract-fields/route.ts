import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";

export async function GET() {
  try {
    // Read the existing test.docx file
    const testFilePath = path.join(process.cwd(), "public", "templates", "test.docx");
    
    // Check if file exists
    try {
      await fs.access(testFilePath);
    } catch {
      return NextResponse.json({ error: "test.docx file not found" }, { status: 404 });
    }

    // Read file
    const buffer = await fs.readFile(testFilePath);
    
    // Extract text using mammoth
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    // Test different regex patterns
    const patterns = {
      original: /\{([^}]+)\}/g,           // Original - captures groups
      thai: /\{[^\}]+\}/g,               // Thai support - no capture groups
      unicode: /\{([^{}]*)\}/g,          // Unicode support
      all: /\{.*?\}/g                    // Non-greedy match
    };

    const results: Record<string, string[]> = {};
    
    for (const [name, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern) || [];
      const uniqueFields = Array.from(new Set(matches.map(f => f.slice(1, -1))));
      results[name] = uniqueFields;
    }

    return NextResponse.json({
      extractedText: text,
      fieldMatches: results,
      textLength: text.length,
      hasBraces: text.includes('{') && text.includes('}')
    });

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug failed" }, { status: 500 });
  }
}
