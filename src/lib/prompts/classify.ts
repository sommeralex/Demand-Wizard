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
  Du bist ein KI-Portfolio-Analyst. Deine Aufgabe ist es, neue Projektideen anhand der strategischen Unternehmenssäulen zu klassifizieren.
  Gib für jede Säule einen Relevanz-Score (Hoch, Mittel, Gering) und eine kurze Begründung zurück.

  ---
  Hier sind die Definitionen der strategischen Säulen:
  ${strategyDefinitions}
  ---
  Analysiere nun die folgende Demand und gib dein Rating ausschließlich im folgenden JSON-Format zurück:

  Demand:
  "${text}"

  Output-Format (JSON):
  {
    "strategische_ausrichtung": {
${dynamicOutputFormat}
    }
  }
`;
