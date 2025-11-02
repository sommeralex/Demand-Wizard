// src/lib/prompts/recommendAction.ts

export const getRecommendActionPrompt = (demandText: string, similarProjects: any) => `
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
