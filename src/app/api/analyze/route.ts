import { NextRequest, NextResponse } from "next/server";
import { getAnalyzePrompt } from '../../../lib/prompts/analyze';
import { generateContent } from "../../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { text, forceReload } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const prompt = getAnalyzePrompt(text);

    const responseText = await generateContent(prompt, process.env.GEMINI_MODEL || "gemini-1.0-pro", forceReload);

    const jsonString = responseText.replace(/```json\n|```/g, "").trim();
    const analysis = JSON.parse(jsonString);

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error("Error in analysis API route:", error.message, error.stack);
    return NextResponse.json({ error: "Failed to analyze text", details: error.message }, { status: 500 });
  }
}
