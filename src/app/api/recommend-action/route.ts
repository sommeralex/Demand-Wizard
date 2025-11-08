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

    console.log("Recommend-action raw response:", responseText);

    // Check if response is empty
    if (!responseText || responseText.trim().length === 0) {
      console.error("Recommend-action returned empty response");
      return NextResponse.json({
        empfehlung_aktion: "PROCEED",
        zusammenfassung_benutzer: "Keine spezifische Empfehlung verfügbar. Bitte überprüfe die Analyse manuell.",
        error: "Leere Antwort vom LLM"
      });
    }

    const jsonString = responseText.replace(/```json\n|```/g, "").trim();

    // Check if jsonString is empty after cleanup
    if (!jsonString || jsonString.length === 0) {
      console.error("Extracted JSON is empty after cleanup");
      return NextResponse.json({
        empfehlung_aktion: "PROCEED",
        zusammenfassung_benutzer: "Keine spezifische Empfehlung verfügbar. Die Antwort des LLM war leer.",
        error: "Leerer JSON-String"
      });
    }

    try {
      const recommendation = JSON.parse(jsonString);

      // Validate that required fields exist
      if (!recommendation.empfehlung_aktion || !recommendation.zusammenfassung_benutzer) {
        console.warn("Recommendation missing required fields:", recommendation);
        return NextResponse.json({
          empfehlung_aktion: recommendation.empfehlung_aktion || "PROCEED",
          zusammenfassung_benutzer: recommendation.zusammenfassung_benutzer || "Die Empfehlung enthält nicht alle erforderlichen Informationen. Bitte überprüfe die Analyse manuell.",
          ...recommendation
        });
      }

      return NextResponse.json(recommendation);
    } catch (parseError) {
      console.error("JSON parsing error in recommend-action:", parseError);
      console.error("Failed to parse:", jsonString.substring(0, 500));
      return NextResponse.json({
        empfehlung_aktion: "PROCEED",
        zusammenfassung_benutzer: `Fehler beim Parsen der Empfehlung. Bitte überprüfe die Analyse manuell. Fehler: ${parseError instanceof Error ? parseError.message : 'Unbekannter Fehler'}`,
        error: "JSON parsing failed",
        rawResponse: jsonString.substring(0, 200)
      });
    }

  } catch (error) {
    console.error("Error in recommend-action API route:", error);
    return NextResponse.json({ error: "Failed to get recommendation" }, { status: 500 });
  }
}
