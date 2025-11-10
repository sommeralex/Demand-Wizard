import { NextRequest, NextResponse } from "next/server";
import { getFindSimilarPrompt } from "../../../lib/prompts/findSimilar";
import { generateContent } from "../../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { text, locale = 'de' } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const prompt = getFindSimilarPrompt(text, locale);

    const responseText = await generateContent(prompt, process.env.GEMINI_MODEL || "gemini-1.0-pro");
    
    const jsonString = responseText.replace(/```json\n|```/g, "").trim();
    const similarProjects = JSON.parse(jsonString);

    return NextResponse.json(similarProjects);

  } catch (error) {
    console.error("Error in find-similar API route:", error);
    return NextResponse.json({ error: "Failed to find similar projects" }, { status: 500 });
  }
}
