import { NextRequest, NextResponse } from "next/server";
import { getClassifyPrompt } from "../../../lib/prompts/classify";
import { generateContent } from "../../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const prompt = getClassifyPrompt(text);

    const responseText = await generateContent(prompt, process.env.GEMINI_MODEL || "gemini-1.0-pro");
    
    const jsonString = responseText.replace(/```json\n|```/g, "").trim();
    const classification = JSON.parse(jsonString);

    return NextResponse.json(classification);

  } catch (error) {
    console.error("Error in classification API route:", error);
    return NextResponse.json({ error: "Failed to classify text" }, { status: 500 });
  }
}
