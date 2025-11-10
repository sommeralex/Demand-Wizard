// src/lib/prompts/analyze.ts

const getAnalyzePromptDE = (text: string) => `
  Analysiere die folgende Demand-Beschreibung sehr streng und kritisch.
  Ein Kriterium gilt nur dann als erfüllt (true), wenn es EXPLIZIT und KONKRET im Text erwähnt wird.
  Vage Andeutungen oder implizite Hinweise zählen NICHT als erfüllt.

  Prüfe die folgenden 7 Kriterien:

  1. **Problemstellung** (problem_statement):
     - Wird das konkrete Problem oder die Herausforderung explizit beschrieben?
     - "Wir brauchen eine bessere App" ist NICHT ausreichend - es muss beschrieben werden, WAS das Problem ist.

  2. **Business-Ziel** (business_goal):
     - Wird ein messbares oder konkretes Geschäftsziel genannt?
     - "Bessere Effizienz" allein reicht NICHT - es muss konkret sein (z.B. "20% schnellere Bearbeitung").

  3. **Betroffene Benutzergruppe** (user_group):
     - Wird die Zielgruppe explizit genannt (z.B. "Buchhaltungsteam", "alle Mitarbeiter", "externe Kunden")?
     - Allgemeine Begriffe wie "wir" oder "die Nutzer" sind NICHT ausreichend.

  4. **Budget-Indikationen (OPEX/CAPEX)** (first_budget_indications):
     - Werden konkrete Zahlen oder Budgetbereiche genannt (z.B. "ca. 50.000 €", "zwischen 10-20k")?
     - Ohne Zahlenangabe = false.

  5. **Interner Aufwand (Personentage)** (first_internal_efforts_indications):
     - Wird der interne Zeitaufwand in Personentagen oder Stunden genannt?
     - Ohne konkrete Zeitangabe = false.

  6. **Nutzen-Indikationen (Zeit-/Geldeinsparungen)** (first_timeplan_indications):
     - Werden konkrete Einsparungen genannt (z.B. "spart 10 Stunden pro Woche", "reduziert Kosten um 30%")?
     - Ohne messbare Angaben = false.

  7. **Zeitplan (Start/Ende)** (rough_timeplan):
     - Wird ein konkreter Zeitrahmen genannt (z.B. "Start im Q2 2025", "6 Monate Laufzeit")?
     - Ohne Datumsangaben oder Zeitrahmen = false.

  WICHTIG: Sei sehr streng! Nur wenn ein Aspekt wirklich konkret und explizit erwähnt wird, setze ihn auf true.

  Antworte NUR mit einem JSON-Objekt in diesem Format:
  {
    "problem_statement": boolean,
    "business_goal": boolean,
    "user_group": boolean,
    "first_budget_indications": boolean,
    "first_internal_efforts_indications": boolean,
    "first_timeplan_indications": boolean,
    "rough_timeplan": boolean
  }

  Demand-Beschreibung:
  "${text}"
`;

const getAnalyzePromptEN = (text: string) => `
  Analyze the following demand description very strictly and critically.
  A criterion is only considered fulfilled (true) if it is EXPLICITLY and CONCRETELY mentioned in the text.
  Vague hints or implicit references do NOT count as fulfilled.

  Check the following 7 criteria:

  1. **Problem Statement** (problem_statement):
     - Is the concrete problem or challenge explicitly described?
     - "We need a better app" is NOT sufficient - it must describe WHAT the problem is.

  2. **Business Goal** (business_goal):
     - Is a measurable or concrete business goal mentioned?
     - "Better efficiency" alone is NOT enough - it must be concrete (e.g., "20% faster processing").

  3. **Affected User Group** (user_group):
     - Is the target group explicitly named (e.g., "accounting team", "all employees", "external customers")?
     - General terms like "we" or "the users" are NOT sufficient.

  4. **Budget Indications (OPEX/CAPEX)** (first_budget_indications):
     - Are concrete numbers or budget ranges mentioned (e.g., "approx. 50,000 €", "between 10-20k")?
     - Without numerical specification = false.

  5. **Internal Effort (Person-days)** (first_internal_efforts_indications):
     - Is the internal time effort mentioned in person-days or hours?
     - Without concrete time specification = false.

  6. **Benefit Indications (Time/Cost Savings)** (first_timeplan_indications):
     - Are concrete savings mentioned (e.g., "saves 10 hours per week", "reduces costs by 30%")?
     - Without measurable specifications = false.

  7. **Timeline (Start/End)** (rough_timeplan):
     - Is a concrete timeframe mentioned (e.g., "Start in Q2 2025", "6 months duration")?
     - Without date specifications or timeframe = false.

  IMPORTANT: Be very strict! Only if an aspect is really concretely and explicitly mentioned, set it to true.

  Respond ONLY with a JSON object in this format:
  {
    "problem_statement": boolean,
    "business_goal": boolean,
    "user_group": boolean,
    "first_budget_indications": boolean,
    "first_internal_efforts_indications": boolean,
    "first_timeplan_indications": boolean,
    "rough_timeplan": boolean
  }

  Demand Description:
  "${text}"
`;

export const getAnalyzePrompt = (text: string, locale: string = 'de') => {
  return locale === 'en' ? getAnalyzePromptEN(text) : getAnalyzePromptDE(text);
};
