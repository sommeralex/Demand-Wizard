// src/lib/prompts/recommendAction.ts

const getRecommendActionPromptDE = (demandText: string, similarProjects: any) => `
  Du bist ein erfahrener Portfolio-Manager.
  Die neue Demand eines Benutzers lautet: "${demandText}"
  ---
  Hier sind die ähnlichsten Treffer aus dem bestehenden Portfolio:
  ${JSON.stringify(similarProjects, null, 2)}
  ---
  Analysiere diese Treffer.
  1. Identifiziere starke Duplikate (Ähnlichkeit > 85%).
  2. Gib eine klare, einzelne Handlungsempfehlung: 'PROCEED', 'MERGE', oder 'LINK'.
  3. Formuliere eine kurze Zusammenfassung für den Benutzer.

  Gib dein Ergebnis als valides JSON-Objekt zurück:
  {
    "empfehlung_aktion": "<PROCEED/MERGE/LINK>",
    "target_id": "<ID des Ziels, falls MERGE/LINK, sonst null>",
    "zusammenfassung_benutzer": "<Erklärung für den Benutzer>"
  }
`;

const getRecommendActionPromptEN = (demandText: string, similarProjects: any) => `
  You are an experienced portfolio manager.
  The user's new demand reads: "${demandText}"
  ---
  Here are the most similar matches from the existing portfolio:
  ${JSON.stringify(similarProjects, null, 2)}
  ---
  Analyze these matches.
  1. Identify strong duplicates (similarity > 85%).
  2. Provide a clear, single action recommendation: 'PROCEED', 'MERGE', or 'LINK'.
  3. Formulate a brief summary for the user.

  Return your result as a valid JSON object:
  {
    "empfehlung_aktion": "<PROCEED/MERGE/LINK>",
    "target_id": "<Target ID if MERGE/LINK, otherwise null>",
    "zusammenfassung_benutzer": "<Explanation for the user>"
  }
`;

export const getRecommendActionPrompt = (demandText: string, similarProjects: any, locale: string = 'de') => {
  return locale === 'en' ? getRecommendActionPromptEN(demandText, similarProjects) : getRecommendActionPromptDE(demandText, similarProjects);
};
