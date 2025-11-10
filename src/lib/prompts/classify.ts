// src/lib/prompts/classify.ts
import { getStrategyPillars } from '../i18n/strategyPillars';

const getClassifyPromptDE = (text: string) => {
  const strategyPillars = getStrategyPillars('de');
  const strategyDefinitions = strategyPillars.map((pillar, index) => `
  ${index + 1}. **Säule: ${pillar.title}**
      *   Definition: ${pillar.definition}
      *   Beispiel (Hoch): "${pillar.example}"`).join('\n');

  const dynamicOutputFormat = strategyPillars.map(pillar =>
    `      "${pillar.title}": { "score": "<Hoch/Mittel/Gering>", "begruendung": "<Kurze Begründung>" }`
  ).join(',\n');

  return `
  Du bist ein freundlicher KI-Portfolio-Analyst, der Benutzer dabei unterstützt, ihre Projektideen zu klassifizieren.
  Deine Aufgabe ist es, neue Projektideen anhand der strategischen Unternehmenssäulen zu klassifizieren.

  **WICHTIG**: Gib NUR dann einen Fehler zurück, wenn die Beschreibung EXTREM VAGE ist (z.B. nur 1-2 Sätze ohne jeglichen Kontext).
  Wenn die Beschreibung ein Problem, Ziel ODER ausreichend Kontext enthält, führe eine Klassifizierung durch, auch wenn nicht alle Details vorhanden sind.

  Nur bei EXTREM vagen Beschreibungen (weniger als 2 Sätze mit keinerlei Details):
  {
    "error": "Die Beschreibung ist zu vage für eine Klassifizierung.",
    "error_message": "<Freundliche Erklärung in DU-Form, welche Details fehlen, um eine sinnvolle strategische Einordnung vorzunehmen>"
  }

  ---
  Hier sind die Definitionen der strategischen Säulen:
  ${strategyDefinitions}
  ---

  Analysiere nun die folgende Demand:

  Demand:
  "${text}"

  **Vorgehen**:
  1. Prüfe, ob die Beschreibung EXTREM VAGE ist (nur 1-2 Sätze ohne Details).
  2. Wenn JA (extrem vage): Gib ein JSON-Objekt mit "error" und "error_message" zurück.
  3. Wenn NEIN (ausreichend Details vorhanden): Gib für jede Säule einen Relevanz-Score (Hoch, Mittel, Gering) und eine kurze Begründung zurück.

  Output-Format bei ausreichenden Details (JSON):
  {
    "strategische_ausrichtung": {
${dynamicOutputFormat}
    }
  }

  Output-Format bei zu vager Beschreibung (JSON):
  {
    "error": "Die Beschreibung ist zu vage für eine Klassifizierung.",
    "error_message": "<Freundliche Erklärung in DU-Form, welche Details fehlen>"
  }
`;
};

const getClassifyPromptEN = (text: string) => {
  const strategyPillars = getStrategyPillars('en');
  const strategyDefinitions = strategyPillars.map((pillar, index) => `
  ${index + 1}. **Pillar: ${pillar.title}**
      *   Definition: ${pillar.definition}
      *   Example (High): "${pillar.example}"`).join('\n');

  const dynamicOutputFormat = strategyPillars.map(pillar =>
    `      "${pillar.title}": { "score": "<High/Medium/Low>", "begruendung": "<Brief justification>" }`
  ).join(',\n');

  return `
  You are a friendly AI portfolio analyst helping users classify their project ideas.
  Your task is to classify new project ideas based on strategic company pillars.

  **IMPORTANT**: Only return an error if the description is EXTREMELY VAGUE (e.g., only 1-2 sentences without any context).
  If the description contains a problem, goal OR sufficient context, perform a classification, even if not all details are present.

  Only for EXTREMELY vague descriptions (less than 2 sentences with no details whatsoever):
  {
    "error": "The description is too vague for classification.",
    "error_message": "<Friendly explanation in YOU-form about which details are missing for a meaningful strategic classification>"
  }

  ---
  Here are the definitions of the strategic pillars:
  ${strategyDefinitions}
  ---

  Now analyze the following demand:

  Demand:
  "${text}"

  **Procedure**:
  1. Check if the description is EXTREMELY VAGUE (only 1-2 sentences without details).
  2. If YES (extremely vague): Return a JSON object with "error" and "error_message".
  3. If NO (sufficient details available): Return a relevance score (High, Medium, Low) and brief justification for each pillar.

  Output format for sufficient details (JSON):
  {
    "strategische_ausrichtung": {
${dynamicOutputFormat}
    }
  }

  Output format for too vague description (JSON):
  {
    "error": "The description is too vague for classification.",
    "error_message": "<Friendly explanation in YOU-form about which details are missing>"
  }
`;
};

export const getClassifyPrompt = (text: string, locale: string = 'de') => {
  return locale === 'en' ? getClassifyPromptEN(text) : getClassifyPromptDE(text);
};
