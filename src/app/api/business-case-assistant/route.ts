import { NextRequest, NextResponse } from "next/server";
import { getBusinessCasePrompt, getBusinessCaseChatPrompt } from "../../../lib/prompts/businessCaseAssistant";
import { generateContent, startChat } from "../../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { history, message, demandDescription, opexTotal, capexTotal, businessCaseData, currentAssumptions, forceReload } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check if this is an initial break-even calculation request (no history)
    const isInitialCalculation = (!history || history.length === 0) && message.includes('Starte die Business Case Analyse');

    let botResponseRaw: string;

    if (isInitialCalculation) {
      // Use generateContent for initial break-even calculation (single-shot)
      const prompt = getBusinessCasePrompt(demandDescription, opexTotal, capexTotal);
      console.log("Using generateContent for initial business case calculation");
      botResponseRaw = await generateContent(prompt, process.env.GEMINI_MODEL || "gemini-1.0-pro", forceReload);
    } else {
      // Use startChat for follow-up conversations
      const systemPrompt = getBusinessCaseChatPrompt(demandDescription, opexTotal, capexTotal, businessCaseData, currentAssumptions);
      console.log("Using startChat for business case conversation");
      botResponseRaw = await startChat(
        history || [],
        message,
        process.env.GEMINI_MODEL || "gemini-1.0-pro",
        systemPrompt,
        forceReload
      );
    }

    console.log("Business Case Assistant Raw Response:", botResponseRaw);

    try {
      // Try to extract JSON if wrapped in markdown code blocks
      let jsonText = botResponseRaw.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedResponse = JSON.parse(jsonText);
      console.log("Business Case Assistant Parsed Response:", parsedResponse);

      // Check if response has expected structure (frage, experten_empfehlung, or full business case data)
      if (parsedResponse.frage || parsedResponse.experten_empfehlung || parsedResponse.kennzahlen) {
        return NextResponse.json(parsedResponse);
      } else {
        console.warn("Unexpected response structure:", parsedResponse);
        return NextResponse.json({ message: botResponseRaw });
      }
    } catch (jsonError) {
      console.warn("AI response was not a valid JSON, returning raw text.", jsonError);
      console.warn("Raw response:", botResponseRaw);
      return NextResponse.json({ message: botResponseRaw });
    }

  } catch (error) {
    console.error("Error in business-case-assistant API route:", error);
    return NextResponse.json({ error: "Failed to get response from assistant" }, { status: 500 });
  }
}
