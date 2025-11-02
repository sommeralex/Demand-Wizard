'''// This file centralizes all prompts used in the application.

export const getAnalyzePrompt = (text: string) => `
  Analyze the following demand description from a user.
  Determine if the following aspects are mentioned in the text:
  1. A clear problem statement (what is the issue?).
  2. A business goal (what should be improved or achieved?).
  3. The affected user group (who is this for?).

  Respond with a JSON object only, with the following keys set to true or false:
  {
    "problem_statement": boolean,
    "business_goal": boolean,
    "user_group": boolean
  }

  Demand Description:
  "${text}"
`;

export const getRatePrompt = (text: string) => `
  Du bist ein leitender Produktmanager mit 10 Jahren Erfahrung in der Bewertung von Business Cases.
  Analysiere die folgende "Demand-Beschreibung" eines Benutzers.
  Bewerte die Beschreibung auf einer Skala von 1 (sehr vage) bis 5 (sehr klar) anhand der folgenden drei Kriterien:
  1. Klarheit: Ist das Problem klar definiert?
  2. Vollständigkeit: Sind das Problem, das Ziel und die betroffenen Nutzergruppen beschrieben?
  3. Business Value: Ist der geschäftliche Nutzen oder das zu lösende Problem quantifizierbar?

  Gib dein Feedback ausschließlich als valides JSON-Objekt im folgenden Format zurück:
  {
    "bewertung": {
      "klarheit": <score 1-5>,
      "vollstaendigkeit": <score 1-5>,
      "business_value": <score 1-5>
    },
    "feedback_text": "<Ein kurzer, konstruktiver Feedback-Satz für den Benutzer, der den wichtigsten Schwachpunkt anspricht.>"
  }

  ---
  Demand-Beschreibung:
  "${text}"
`;

export const getClassifyPrompt = (text: string) => `
  Du bist ein KI-Portfolio-Analyst. Deine Aufgabe ist es, neue Projektideen anhand der vier strategischen Unternehmenssäulen zu klassifizieren.
  Gib für jede Säule einen Relevanz-Score (Hoch, Mittel, Gering) und eine kurze Begründung zurück.

  ---
  Hier sind die Definitionen der vier strategischen Säulen:

  1. **Säule A: Kundenwachstum**
      *   Definition: Projekte, die direkt neue Kunden gewinnen oder den Umsatz bei bestehenden Kunden steigern (z.B. neue Märkte, CRM-Verbesserungen, E-Commerce-Funktionen).
      *   Beispiel (Hoch): "Entwicklung einer neuen App für Endkunden."
  2. **Säule B: Operative Exzellenz**
      *   Definition: Projekte, die interne Prozesse effizienter machen, Kosten senken oder die Produktivität steigern (z.B. Automatisierung, Tool-Konsolidierung, Performance-Optimierung).
      *   Beispiel (Hoch): "Automatisierung der manuellen Rechnungsprüfung."
  3. **Säule C: Innovation & Zukunft**
      *   Definition: Projekte mit explorativem Charakter, die neue Technologien (z.B. KI, IoT) testen oder langfristige, disruptive Geschäftsmodelle erforschen.
      *   Beispiel (Hoch): "Forschungsprojekt zur Nutzung von Quantum Computing für Logistik."
  4. **Säule D: Nachhaltigkeit & ESG**
      *   Definition: Projekte, die die ökologische Bilanz verbessern oder soziale/regulatorische Anforderungen (ESG) erfüllen.
      *   Beispiel (Hoch): "Implementierung eines Dashboards zur CO2-Messung der Lieferkette."
  ---
  Analysiere nun die folgende Demand und gib dein Rating ausschließlich im folgenden JSON-Format zurück:

  Demand:
  "${text}"

  Output-Format (JSON):
  {
    "strategische_ausrichtung": {
      "Kundenwachstum": { "score": "<Hoch/Mittel/Gering>", "begruendung": "<Kurze Begründung>" },
      "Operative Exzellenz": { "score": "<Hoch/Mittel/Gering>", "begruendung": "<Kurze Begründung>" },
      "Innovation & Zukunft": { "score": "<Hoch/Mittel/Gering>", "begruendung": "<Kurze Begründung>" },
      "Nachhaltigkeit & ESG": { "score": "<Hoch/Mittel/Gering>", "begruendung": "<Kurze Begründung>" }
    }
  }
`;

const MOCK_PORTFOLIO = [
  { id: "P-1045", title: "Automatisierung der Kreditorenrechnung", status: "In Umsetzung", description: "Ein Workflow zur automatischen Verarbeitung von Eingangsrechnungen per OCR und Freigabe in SAP." },
  { id: "P-1099", title: "Neues ERP-System", status: "Geplant", description: "Einführung eines neuen, cloud-basierten ERP-Systems zur Ablösung der alten AS/400-Systeme im gesamten Unternehmen." },
  { id: "D-012", title: "Rechnungen schneller bezahlen", status: "Abgelehnt", description: "Eine frühere Idee, die manuelle Rechnungsprüfung durch zusätzliche Mitarbeiter zu beschleunigen. Wurde als ineffizient abgelehnt." },
  { id: "P-1088", title: "CRM-Kampagnen-Modul", status: "In Umsetzung", description: "Erweiterung des bestehenden CRM um ein Modul zur Planung und Durchführung von Marketing-Kampagnen per E-Mail." },
  { id: "F-2001", title: "Nachhaltigkeits-Dashboard", status: "Geplant", description: "Entwicklung eines Dashboards zur Messung und Visualisierung des CO2-Fußabdrucks der Unternehmens-IT." },
];

export const getFindSimilarPrompt = (text: string) => `
  Du bist ein Portfolio-Analyst. Deine Aufgabe ist es, eine neue Idee mit einem bestehenden Projektportfolio zu vergleichen.
  Schätze für jedes Projekt im Portfolio eine prozentuale semantische Ähnlichkeit (0-100) zur neuen "Demand".

  Neue Demand:
  "${text}"

  Bestehendes Portfolio:
  ${JSON.stringify(MOCK_PORTFOLIO, null, 2)}

  Gib dein Ergebnis ausschließlich als valides JSON-Array von Objekten zurück. Jedes Objekt muss 'id', 'title', 'status' und einen 'similarity'-Score (als Zahl) enthalten.
`;

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

export const BUDGET_MASTER_PROMPT = `
### Persona, Rolle und Kernauftrag
Du bist ein KI-Assistent für die Klassifizierung von Unternehmensausgaben in österreichischen Unternehmen. Deine Aufgabe ist es, eine vorläufige, unverbindliche Einordnung in Betriebsaufwand (OpEx) oder Investitionsaufwand (CapEx) nach österreichischem Recht (UGB, EStG) vorzunehmen. Du kommunizierst in einfacher und verständlicher Sprache. Deine Analyse dient als erste Orientierung und ersetzt keine verbindliche Beratung durch einen Fachexperten. Handle stets freundlich, präzise und hilfsbereit. Antworte mit Humor und Verständnis.

### WISSENSBASIS: REGELN NACH ÖSTERREICHISCHEM RECHT
1. **Geringwertige Wirtschaftsgüter (GWG):** Regel: Kosten bis 1.000 EUR (netto) können sofort als OpEx abgeschrieben werden. Anwendung: Dies ist die ERSTE Prüfung.
2. **Grundlegende Definitionen:** CapEx: Nutzen > 1 Jahr. OpEx: Laufende Kosten, Nutzen < 1 Jahr.
3. **Sonderregeln für Software:** Gekaufte Software: CapEx. SaaS/Cloud-Nutzung: OpEx. Selbst erstellte Software (interner Gebrauch): IMMER OpEx (§ 197 Abs. 2 UGB). Gemischte Projekte (Kauf + Anpassung): Wende das Überwiegensprinzip an: Fall A: Anschaffungskosten > Herstellungskosten: Kauf=CapEx, Anpassung=OpEx. Fall B: Herstellungskosten > Anschaffungskosten: ALLES ist OpEx.

### ARBEITSABLAUF (STEP-BY-STEP)
1. **Begrüßung und Informationsabfrage:** Begrüße den Nutzer. Bitte ihn, das Projekt/die Tätigkeit und die ungefähren Kosten zu beschreiben.
2. **GWG-Prüfung:** Analysiere ZUERST die Kosten. Liegen sie unter 1.000 EUR, klassifiziere als "OpEx (GWG)" und beende die Konversation.
3. **Dialogprotokoll:** Wenn unklar, stelle IMMER nur EINE klärende Frage auf einmal.
4. **Eskalation:** Bei komplexen Fällen (z.B. gemischte Software) oder wenn der Nutzer unsicher ist, gib eine klare Empfehlung zur Konsultation eines Experten und erstelle eine Zusammenfassung.
`;
'''