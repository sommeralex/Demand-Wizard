import { NextRequest, NextResponse } from "next/server";
import { getRatePrompt } from "../../../lib/prompts/rate";
import { generateContent } from "../../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { text, forceReload, locale = 'de' } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const prompt = getRatePrompt(text, locale);

    const responseText = await generateContent(prompt, process.env.GEMINI_MODEL || "gemini-1.0-pro", forceReload);

    console.log("Rate API raw response:", responseText);

    // Check if response is empty
    if (!responseText || responseText.trim().length === 0) {
      console.error("Rate API returned empty response");
      return NextResponse.json({
        error: "Leere Antwort vom LLM",
        qualitaetsscore: 0,
        projekt_typ: "Unbekannt",
        feedback: "Die Bewertung konnte nicht durchgeführt werden. Bitte versuche es erneut."
      });
    }

    const jsonString = responseText.replace(/```json\n|```/g, "").trim();

    // Check if jsonString is empty after cleanup
    if (!jsonString || jsonString.length === 0) {
      console.error("Extracted JSON is empty after cleanup");
      return NextResponse.json({
        error: "Leerer JSON-String",
        qualitaetsscore: 0,
        projekt_typ: "Unbekannt",
        feedback: "Die Bewertung konnte nicht durchgeführt werden. Die Antwort war leer."
      });
    }

    try {
      const rating = JSON.parse(jsonString);

      // Validate that required fields exist
      if (typeof rating.qualitaetsscore === 'undefined' || !rating.projekt_typ) {
        console.warn("Rating missing required fields:", rating);
        return NextResponse.json({
          qualitaetsscore: rating.qualitaetsscore || 0,
          projekt_typ: rating.projekt_typ || "Unbekannt",
          feedback: rating.feedback || "Die Bewertung enthält nicht alle erforderlichen Informationen.",
          error: "Unvollständige Daten",
          ...rating
        });
      }

      return NextResponse.json(rating);
    } catch (parseError) {
      console.error("JSON parsing error in rate:", parseError);
      console.error("Failed to parse:", jsonString.substring(0, 500));
      return NextResponse.json({
        error: "JSON parsing failed",
        qualitaetsscore: 0,
        projekt_typ: "Unbekannt",
        feedback: `Fehler beim Parsen der Bewertung: ${parseError instanceof Error ? parseError.message : 'Unbekannter Fehler'}`,
        rawResponse: jsonString.substring(0, 200)
      });
    }

  } catch (error) {
    console.error("Error in rating API route:", error);
    return NextResponse.json({
      error: "Failed to rate text",
      qualitaetsscore: 0,
      projekt_typ: "Unbekannt",
      feedback: "Ein unerwarteter Fehler ist aufgetreten."
    }, { status: 500 });
  }
}
