// src/lib/prompts/analyze.ts

export const getAnalyzePrompt = (text: string) => `
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
