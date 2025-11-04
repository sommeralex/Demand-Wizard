// src/lib/prompts/classify.ts
import { STRATEGY_PILLARS } from '../../data/strategy';

const strategyDefinitions = STRATEGY_PILLARS.map((pillar, index) => `
  ${index + 1}. **Säule: ${pillar.title}**
      *   Definition: ${pillar.definition}
      *   Beispiel (Hoch): "${pillar.example}"`).join('\n');

const dynamicOutputFormat = STRATEGY_PILLARS.map(pillar => 
    `      "${pillar.title}": { "score": "<Hoch/Mittel/Gering>", "begruendung": "<Kurze Begründung>" }`
).join(',\n');

export const getClassifyPrompt = (text: string) => `
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
