import { NextRequest, NextResponse } from "next/server";
import { getRecommendActionPrompt } from "../../../lib/prompts/recommendAction";
import { generateContent } from "../../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { demandText, similarProjects } = await req.json();
    if (!demandText || !similarProjects) {
      return NextResponse.json({ error: "demandText and similarProjects are required" }, { status: 400 });
    }

    const prompt = getRecommendActionPrompt(demandText, similarProjects);

    const responseText = await generateContent(prompt, process.env.GEMINI_MODEL || "gemini-1.0-pro");
    
    const jsonString = responseText.replace(/```json\n|```/g, "").trim();
    const recommendation = JSON.parse(jsonString);

    return NextResponse.json(recommendation);

  } catch (error) {
    console.error("Error in recommend-action API route:", error);
    return NextResponse.json({ error: "Failed to get recommendation" }, { status: 500 });
  }
}
