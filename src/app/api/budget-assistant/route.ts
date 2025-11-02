import { NextRequest, NextResponse } from "next/server";
import { getOpexCapexPrompt, getOpexCapexChatPrompt } from "../../../lib/prompts/budgetAssistant";
import { generateContent, startChat } from "../../../lib/llm";

interface BudgetTableRow {
  id: string;
  kostentyp: 'OPEX' | 'CAPEX';
  beschreibung: string;
  wert: string;
}

export async function POST(req: NextRequest) {
  try {
    const { history, message, demandDescription, budgetTable, forceReload } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check if this is an initial classification request (no history)
    const isInitialClassification = (!history || history.length === 0) && message.includes('Analysiere diesen Demand');

    let botResponseRaw: string;

    if (isInitialClassification) {
      // Use generateContent for initial classification (single-shot)
      const prompt = getOpexCapexPrompt(demandDescription);
      console.log("Using generateContent for initial classification");
      botResponseRaw = await generateContent(prompt, process.env.GEMINI_MODEL || "gemini-1.0-pro", forceReload);
    } else {
      // Use startChat for follow-up conversations
      const systemPrompt = getOpexCapexChatPrompt(demandDescription, budgetTable);
      console.log("Using startChat for conversation");
      botResponseRaw = await startChat(
        history || [],
        message,
        process.env.GEMINI_MODEL || "gemini-1.0-pro",
        systemPrompt,
        forceReload
      );
    }

    console.log("Budget Assistant Raw Response:", botResponseRaw);

    try {
      // Try to extract JSON if wrapped in markdown code blocks
      let jsonText = botResponseRaw.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedResponse = JSON.parse(jsonText);
      console.log("Budget Assistant Parsed Response:", parsedResponse);

      if (parsedResponse.frage || parsedResponse.experten_empfehlung || (parsedResponse.gesamtschaetzung && parsedResponse.opex && parsedResponse.capex)) {
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
    console.error("Error in budget-assistant API route:", error);
    return NextResponse.json({ error: "Failed to get response from assistant" }, { status: 500 });
  }
}