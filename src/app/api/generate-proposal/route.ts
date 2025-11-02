import { NextRequest, NextResponse } from "next/server";
import { getGenerateProposalPrompt } from "../../../lib/prompts/generateProposal";
import { generateContent } from "../../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { demandText, classification, recommendation } = await req.json();
    if (!demandText || !classification || !recommendation) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const prompt = getGenerateProposalPrompt(demandText, classification, recommendation);

    const markdown = await generateContent(prompt, process.env.GEMINI_MODEL || "gemini-1.0-pro");

    return NextResponse.json({ markdown });

  } catch (error) {
    console.error("Error in generate-proposal API route:", error);
    return NextResponse.json({ error: "Failed to generate proposal" }, { status: 500 });
  }
}
