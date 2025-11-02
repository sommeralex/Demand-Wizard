// src/lib/prompts/generateProposal.ts

export const getGenerateProposalPrompt = (demandText: string, classification: any, recommendation: any) => `
  Du bist ein PMO (Project Management Office) Experte.
  Generiere einen formellen Projektantrag im Markdown-Format basierend auf den folgenden strukturierten Daten.
  Der Antrag muss die Abschnitte "1. Executive Summary", "2. Problembeschreibung & Ziele", "3. Strategische Ausrichtung" und "4. Portfolio-Kontext & Abhängigkeiten" enthalten.
  Füge am Ende einen Abschnitt "5. Budget (Platzhalter)" hinzu.

  ---
  STRUKTURIERTE DATEN:
  1. **Beschreibung:** ${demandText}
  2. **Strategie-Scores:** ${JSON.stringify(classification, null, 2)}
  3. **Portfolio-Analyse:** ${JSON.stringify(recommendation, null, 2)}
  ---

  Generiere nun den vollständigen Projektantrag.
`;
