import { NextRequest, NextResponse } from "next/server";
import { getBusinessCasePrompt, getBusinessCaseChatPrompt } from "../../../lib/prompts/businessCaseAssistant";
import { generateContent, startChat } from "../../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { history, message, demandDescription, opexTotal, capexTotal, businessCaseData, currentAssumptions, forceReload, locale = 'de' } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check if this is an initial break-even calculation request (no history)
    const isInitialCalculation = (!history || history.length === 0) && (message.includes('Starte die Business Case Analyse') || message.includes('Start the business case analysis'));

    let botResponseRaw: string;

    if (isInitialCalculation) {
      // Use generateContent for initial break-even calculation (single-shot)
      const prompt = getBusinessCasePrompt(demandDescription, opexTotal, capexTotal, currentAssumptions, locale);
      console.log("Using generateContent for initial business case calculation");
      botResponseRaw = await generateContent(prompt, process.env.GEMINI_MODEL || "gemini-1.0-pro", forceReload);
    } else {
      // Use startChat for follow-up conversations
      const systemPrompt = getBusinessCaseChatPrompt(demandDescription, opexTotal, capexTotal, businessCaseData, currentAssumptions, locale);
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

    // Check if response is empty or just whitespace
    if (!botResponseRaw || botResponseRaw.trim().length === 0) {
      console.error("Business Case Assistant returned empty response");
      return NextResponse.json({
        error: "Der Business Case Assistent hat keine Antwort generiert. Bitte versuche es erneut oder formuliere deine Anfrage anders."
      }, { status: 500 });
    }

    // Try to parse as JSON first
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      let jsonText = botResponseRaw.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Check if jsonText is empty after extraction
      if (!jsonText || jsonText.length === 0) {
        console.error("Extracted JSON is empty");
        return NextResponse.json({
          error: "Der Business Case Assistent hat eine leere Antwort generiert. Bitte versuche es erneut."
        }, { status: 500 });
      }

      // Check if the response looks like JSON (starts with { or [)
      const trimmedText = jsonText.trim();
      if (!trimmedText.startsWith('{') && !trimmedText.startsWith('[')) {
        // This is plain text, not JSON - return it as a message
        console.log("Business Case Assistant returned plain text (not JSON)");
        return NextResponse.json({ message: botResponseRaw });
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
      // If JSON parsing fails, check if it's just plain text
      console.log("JSON parsing failed, treating as plain text");
      console.log("Parse error:", jsonError instanceof Error ? jsonError.message : 'Unknown error');

      // If the response is conversational text (doesn't look like broken JSON), return it as message
      const trimmedResponse = botResponseRaw.trim();
      if (!trimmedResponse.includes('{') && !trimmedResponse.includes('[')) {
        // No JSON-like characters, this is definitely plain text
        console.log("Returning as plain text message");
        return NextResponse.json({ message: botResponseRaw });
      }

      // Otherwise, it might be malformed JSON - return detailed error
      console.error("Malformed JSON detected");
      console.error("Raw response that failed to parse:", botResponseRaw);
      return NextResponse.json({
        error: "Der Business Case Assistent hat eine ungültige Antwort generiert. Bitte versuche es erneut.",
        details: `Parsing-Fehler: ${jsonError instanceof Error ? jsonError.message : 'Unbekannter Fehler'}`,
        rawResponse: botResponseRaw.substring(0, 200)
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in business-case-assistant API route:", error);
    return NextResponse.json({ error: "Failed to get response from assistant" }, { status: 500 });
  }
}
