import { NextRequest, NextResponse } from "next/server";
import { getClassifyPrompt } from "../../../lib/prompts/classify";
import { generateContent } from "../../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { text, locale = 'de' } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const prompt = getClassifyPrompt(text, locale);

    const responseText = await generateContent(prompt, process.env.GEMINI_MODEL || "gemini-1.0-pro");

    console.log("Classify API raw response:", responseText);

    // Check if response is empty
    if (!responseText || responseText.trim().length === 0) {
      console.error("Classify API returned empty response");
      return NextResponse.json({
        error: "Leere Antwort vom LLM",
        error_message: "Die Klassifizierung konnte nicht durchgeführt werden. Bitte versuche es erneut."
      });
    }

    const jsonString = responseText.replace(/```json\n|```/g, "").trim();

    // Check if jsonString is empty after cleanup
    if (!jsonString || jsonString.length === 0) {
      console.error("Extracted JSON is empty after cleanup");
      return NextResponse.json({
        error: "Leerer JSON-String",
        error_message: "Die Klassifizierung konnte nicht durchgeführt werden. Die Antwort war leer."
      });
    }

    try {
      const classification = JSON.parse(jsonString);

      // Check if it's an error response (too vague description)
      if (classification.error || classification.error_message) {
        console.log("Classification returned error (too vague):", classification);
        return NextResponse.json(classification);
      }

      // Validate that strategische_ausrichtung exists
      if (!classification.strategische_ausrichtung) {
        console.warn("Classification missing strategische_ausrichtung:", classification);
        return NextResponse.json({
          error: "Unvollständige Daten",
          error_message: "Die Klassifizierung enthält nicht alle erforderlichen Informationen.",
          ...classification
        });
      }

      return NextResponse.json(classification);
    } catch (parseError) {
      console.error("JSON parsing error in classify:", parseError);
      console.error("Failed to parse:", jsonString.substring(0, 500));
      return NextResponse.json({
        error: "JSON parsing failed",
        error_message: `Fehler beim Parsen der Klassifizierung: ${parseError instanceof Error ? parseError.message : 'Unbekannter Fehler'}`,
        rawResponse: jsonString.substring(0, 200)
      });
    }

  } catch (error) {
    console.error("Error in classification API route:", error);
    return NextResponse.json({
      error: "Failed to classify text",
      error_message: "Ein unerwarteter Fehler ist aufgetreten."
    }, { status: 500 });
  }
}
