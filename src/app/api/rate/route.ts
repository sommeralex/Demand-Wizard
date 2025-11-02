import { NextRequest, NextResponse } from "next/server";
import { getRatePrompt } from "../../../lib/prompts/rate";
import { generateContent } from "../../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { text, forceReload } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const prompt = getRatePrompt(text);

    const responseText = await generateContent(prompt, process.env.GEMINI_MODEL || "gemini-1.0-pro", forceReload);

    const jsonString = responseText.replace(/```json\n|```/g, "").trim();
    const rating = JSON.parse(jsonString);

    return NextResponse.json(rating);

  } catch (error) {
    console.error("Error in rating API route:", error);
    return NextResponse.json({ error: "Failed to rate text" }, { status: 500 });
  }
}
