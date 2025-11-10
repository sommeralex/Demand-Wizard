// src/lib/prompts/generateProposal.ts

const GENERATE_PROPOSAL_PROMPT_DE = (demandText: string, classification: any, recommendation: any) => `
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

const GENERATE_PROPOSAL_PROMPT_EN = (demandText: string, classification: any, recommendation: any) => `
  You are a PMO (Project Management Office) expert.
  Generate a formal project proposal in Markdown format based on the following structured data.
  The proposal must include the sections "1. Executive Summary", "2. Problem Description & Objectives", "3. Strategic Alignment", and "4. Portfolio Context & Dependencies".
  Add a section "5. Budget (Placeholder)" at the end.

  ---
  STRUCTURED DATA:
  1. **Description:** ${demandText}
  2. **Strategy Scores:** ${JSON.stringify(classification, null, 2)}
  3. **Portfolio Analysis:** ${JSON.stringify(recommendation, null, 2)}
  ---

  Now generate the complete project proposal.
`;

export const getGenerateProposalPrompt = (demandText: string, classification: any, recommendation: any, locale: string = 'de') => {
  if (locale === 'en') {
    return GENERATE_PROPOSAL_PROMPT_EN(demandText, classification, recommendation);
  }
  return GENERATE_PROPOSAL_PROMPT_DE(demandText, classification, recommendation);
};
