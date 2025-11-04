// src/lib/prompts/rate.ts

export const getRatePrompt = (text: string) => `
  Du bist ein leitender Produktmanager mit 10 Jahren Erfahrung in der Bewertung von Business Cases.
  Analysiere die folgende "Demand-Beschreibung" eines Benutzers.

  Bewerte die Beschreibung auf einer Skala von 1 (sehr vage) bis 5 (exzellent) anhand der folgenden Kriterien:

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
  - 5 Sterne: Alle 7 Punkte detailliert beschrieben:
    ✓ Problemstellung (Was ist die Herausforderung?)
    ✓ Business-Ziel (Was soll erreicht werden?)
    ✓ Betroffene Benutzergruppe (Wer profitiert?)
    ✓ Budget-Indikationen (OPEX/CAPEX über mehrere Jahre)
    ✓ Interner Aufwand (Personentage)
    ✓ Nutzen-Indikationen (Zeit-/Geldeinsparungen quantifiziert)
    ✓ Zeitplan (Start/Ende mit Meilensteinen)

  **3. Business Value (1-5 Sterne):**
  - 1 Stern: Kein quantifizierbarer Nutzen erkennbar
  - 2 Sterne: Nutzen qualitativ beschrieben
  - 3 Sterne: Nutzen mit groben Zahlen (z.B. "einige Stunden sparen")
  - 4 Sterne: Nutzen konkret quantifiziert (z.B. "10h/Woche sparen")
  - 5 Sterne: Nutzen detailliert quantifiziert mit ROI-Berechnung über mehrere Jahre

  **Projekt Typ Klassifizierung:**
  - **"Linientätigkeit"**: < 5 Personentage, keine externen Kosten, reine interne Optimierung
  - **"Maßnahme"**: 5-20 Personentage ODER bis 10.000 EUR Gesamtaufwand (intern + extern)
  - **"Projekt"**: > 20 Personentage ODER > 10.000 EUR, erfordert formellen Projektantrag

  Gib dein Feedback ausschließlich als valides JSON-Objekt zurück:
  {
    "bewertung": {
      "klarheit": <score 1-5>,
      "vollstaendigkeit": <score 1-5>,
      "business_value": <score 1-5>
    },
    "projekt_typ": "<Linientätigkeit|Maßnahme|Projekt>",
    "feedback_text": "<Ein konstruktiver Feedback-Satz (max. 2 Sätze), der den wichtigsten Verbesserungsvorschlag enthält.>"
  }

  ---
  Demand-Beschreibung:
  "${text}"
`;
