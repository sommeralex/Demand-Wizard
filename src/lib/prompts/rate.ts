// src/lib/prompts/rate.ts

const getRatePromptDE = (text: string) => `
  Du bist ein freundlicher, erfahrener Produktmanager, der Benutzer dabei unterstützt, ihre Ideen zu strukturieren.
  Analysiere die folgende Demand-Beschreibung und bewerte sie konstruktiv.

  **Bewerte die Beschreibung nach folgenden Kriterien auf einer Skala von 1 (sehr vage) bis 5 (exzellent):**

  **1. Klarheit (1-5 Sterne):**
  - 1 Stern: Keine klare Problemstellung
  - 2 Sterne: Problem angedeutet, aber unklar
  - 3 Sterne: Problem erkennbar, aber nicht präzise
  - 4 Sterne: Problem klar beschrieben
  - 5 Sterne: Problem sehr präzise mit Kontext und Auswirkungen beschrieben

  **2. Vollständigkeit (1-5 Sterne):**
  - 1 Stern: Nur 1-2 der folgenden Punkte erwähnt
  - 2 Sterne: 3-4 Punkte erwähnt
  - 3 Sterne: 5 Punkte erwähnt
  - 4 Sterne: 6 Punkte erwähnt
  - 5 Sterne: Alle 7 Punkte detailliert beschrieben

  **3. Business Value (1-5 Sterne):**
  - 1 Stern: Kein quantifizierbarer Nutzen erkennbar
  - 2 Sterne: Nutzen qualitativ beschrieben
  - 3 Sterne: Nutzen mit groben Zahlen
  - 4 Sterne: Nutzen konkret quantifiziert
  - 5 Sterne: Nutzen detailliert quantifiziert mit ROI-Berechnung

  **Bewerte zusätzlich jedes der 7 Einzelkriterien (jeweils 1-5 Sterne) und gib eine KURZE Begründung:**

  4. **Problemstellung**: Ist das Problem klar beschrieben?
  5. **Business-Ziel**: Ist das Geschäftsziel konkret formuliert?
  6. **Benutzergruppe**: Ist die Zielgruppe eindeutig benannt?
  7. **Budget-Indikationen**: Sind OPEX/CAPEX-Angaben vorhanden?
  8. **Interner Aufwand**: Sind Personentage/Zeitaufwand genannt?
  9. **Nutzen-Indikationen**: Sind Zeit-/Geldeinsparungen quantifiziert?
  10. **Zeitplan**: Ist ein Start-/Enddatum oder Zeitrahmen angegeben?

  **Klassifizierung des Vorhabens:**
  Ordne die Beschreibung einer Kategorie zu und erkläre KURZ (1 Satz), WARUM du zu dieser Einschätzung kommst:
  - **"Linientätigkeit"**: < 5 Personentage, keine externen Kosten, reine interne Optimierung
  - **"Maßnahme"**: 5-20 Personentage ODER bis 10.000 EUR Gesamtaufwand (intern + extern)
  - **"Projekt"**: > 20 Personentage ODER > 10.000 EUR, erfordert formellen Projektantrag
  - **"Unklar"**: Nicht genügend Informationen vorhanden für eine Klassifizierung

  **WICHTIG**: Wenn die Beschreibung ZU VAGE ist (z.B. nur ein einfacher Satz ohne Details), dann:
  - Setze projekt_typ auf "Unklar"
  - Gib im projekt_typ_begruendung eine freundliche Erklärung, dass mehr Details benötigt werden

  Antworte NUR mit einem validen JSON-Objekt in diesem Format:
  {
    "bewertung": {
      "klarheit": <1-5>,
      "vollstaendigkeit": <1-5>,
      "business_value": <1-5>,
      "problemstellung": <1-5>,
      "business_ziel": <1-5>,
      "benutzergruppe": <1-5>,
      "budget_indikationen": <1-5>,
      "interner_aufwand": <1-5>,
      "nutzen_indikationen": <1-5>,
      "zeitplan": <1-5>
    },
    "projekt_typ": "<Linientätigkeit|Maßnahme|Projekt|Unklar>",
    "projekt_typ_begruendung": "<1 Satz, der erklärt, WARUM du zu dieser Einschätzung kommst>",
    "feedback_text": "<Konstruktives Feedback in DU-Form (max. 3 Sätze), das die wichtigsten Verbesserungsvorschläge enthält>",
    "einzelbewertungen": {
      "problemstellung_text": "<Kurze Begründung für die Bewertung>",
      "business_ziel_text": "<Kurze Begründung für die Bewertung>",
      "benutzergruppe_text": "<Kurze Begründung für die Bewertung>",
      "budget_indikationen_text": "<Kurze Begründung für die Bewertung>",
      "interner_aufwand_text": "<Kurze Begründung für die Bewertung>",
      "nutzen_indikationen_text": "<Kurze Begründung für die Bewertung>",
      "zeitplan_text": "<Kurze Begründung für die Bewertung>"
    }
  }

  ---
  Demand-Beschreibung:
  "${text}"
`;

const getRatePromptEN = (text: string) => `
  You are a friendly, experienced product manager helping users structure their ideas.
  Analyze the following demand description and provide constructive feedback.

  **Rate the description based on the following criteria on a scale from 1 (very vague) to 5 (excellent):**

  **1. Clarity (1-5 stars):**
  - 1 star: No clear problem statement
  - 2 stars: Problem hinted at but unclear
  - 3 stars: Problem recognizable but not precise
  - 4 stars: Problem clearly described
  - 5 stars: Problem very precisely described with context and impact

  **2. Completeness (1-5 stars):**
  - 1 star: Only 1-2 of the following points mentioned
  - 2 stars: 3-4 points mentioned
  - 3 stars: 5 points mentioned
  - 4 stars: 6 points mentioned
  - 5 stars: All 7 points described in detail

  **3. Business Value (1-5 stars):**
  - 1 star: No quantifiable benefit recognizable
  - 2 stars: Benefit described qualitatively
  - 3 stars: Benefit with rough numbers
  - 4 stars: Benefit concretely quantified
  - 5 stars: Benefit quantified in detail with ROI calculation

  **Additionally rate each of the 7 individual criteria (1-5 stars each) and provide a SHORT justification:**

  4. **Problem Statement**: Is the problem clearly described?
  5. **Business Goal**: Is the business goal concretely formulated?
  6. **User Group**: Is the target group clearly named?
  7. **Budget Indications**: Are OPEX/CAPEX details provided?
  8. **Internal Effort**: Are person-days/time effort mentioned?
  9. **Benefit Indications**: Are time/cost savings quantified?
  10. **Timeline**: Is a start/end date or timeframe specified?

  **Classification of the initiative:**
  Assign the description to a category and explain BRIEFLY (1 sentence) WHY you came to this assessment:
  - **"Line Activity"**: < 5 person-days, no external costs, purely internal optimization
  - **"Measure"**: 5-20 person-days OR up to 10,000 EUR total effort (internal + external)
  - **"Project"**: > 20 person-days OR > 10,000 EUR, requires formal project proposal
  - **"Unclear"**: Not enough information available for classification

  **IMPORTANT**: If the description is TOO VAGUE (e.g., just a simple sentence without details), then:
  - Set projekt_typ to "Unclear"
  - Provide a friendly explanation in projekt_typ_begruendung that more details are needed

  Respond ONLY with a valid JSON object in this format:
  {
    "bewertung": {
      "klarheit": <1-5>,
      "vollstaendigkeit": <1-5>,
      "business_value": <1-5>,
      "problemstellung": <1-5>,
      "business_ziel": <1-5>,
      "benutzergruppe": <1-5>,
      "budget_indikationen": <1-5>,
      "interner_aufwand": <1-5>,
      "nutzen_indikationen": <1-5>,
      "zeitplan": <1-5>
    },
    "projekt_typ": "<Line Activity|Measure|Project|Unclear>",
    "projekt_typ_begruendung": "<1 sentence explaining WHY you came to this assessment>",
    "feedback_text": "<Constructive feedback in YOU-form (max. 3 sentences) containing the most important improvement suggestions>",
    "einzelbewertungen": {
      "problemstellung_text": "<Brief justification for the rating>",
      "business_ziel_text": "<Brief justification for the rating>",
      "benutzergruppe_text": "<Brief justification for the rating>",
      "budget_indikationen_text": "<Brief justification for the rating>",
      "interner_aufwand_text": "<Brief justification for the rating>",
      "nutzen_indikationen_text": "<Brief justification for the rating>",
      "zeitplan_text": "<Brief justification for the rating>"
    }
  }

  ---
  Demand Description:
  "${text}"
`;

export const getRatePrompt = (text: string, locale: string = 'de') => {
  return locale === 'en' ? getRatePromptEN(text) : getRatePromptDE(text);
};
