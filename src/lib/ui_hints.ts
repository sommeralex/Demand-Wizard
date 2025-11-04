// src/lib/ui_hints.ts

export const DEMAND_DESCRIPTION_HINT_SHORT = `Beschreibe deine Idee hier. Orientiere dich dabei an den Beispielen und Erklärungen weiter unten.`;

export const DEMAND_DESCRIPTION_HINTS = [
    {
        id: 'problem',
        title: 'Problem',
        content: `Was ist das aktuelle Problem oder die Herausforderung?
*   *Beispiel: „Unsere manuelle Rechnungsprüfung ist langsam und fehleranfällig, was zu verspäteten Zahlungen führt.“*`
    },
    {
        id: 'ziel',
        title: 'Ziel',
        content: `Was soll mit der Idee erreicht oder verbessert werden?
*   *Beispiel: „Wir möchten den Prozess der Rechnungsprüfung automatisieren, um die Durchlaufzeit um 50% zu reduzieren und Fehler zu minimieren.“*`
    },
    {
        id: 'zielgruppe',
        title: 'Zielgruppe',
        content: `Wer ist von diesem Problem betroffen oder profitiert von der Lösung?
*   *Beispiel: „Die Buchhaltungsabteilung (5 Mitarbeiter) und unsere Lieferanten.“*`
    },
    {
        id: 'aufwand',
        title: 'Aufwand & Budget',
        content: `Gibt es erste Schätzungen zu Kosten oder internem Aufwand?
*   *Beispiel: „Wir schätzen den externen Kostenaufwand auf ca. 20.000 EUR und benötigen 30 Personentage aus der IT.“*`
    },
    {
        id: 'nutzen',
        title: 'Nutzen',
        content: `Wie hilft die Idee, Zeit oder Geld zu sparen?
*   *Beispiel: „Durch die Automatisierung sparen wir wöchentlich 10 Arbeitsstunden und vermeiden Mahngebühren von ca. 5.000 EUR pro Jahr.“*`
    },
    {
        id: 'zeitplan',
        title: 'Zeitplan',
        content: `Gibt es einen gewünschten Start- oder Endtermin?
*   *Beispiel: „Das Projekt sollte im nächsten Quartal starten und innerhalb von 6 Monaten abgeschlossen sein.“*`
    }
];

export const DEMAND_DESCRIPTION_HINT = `Beschreibe deine Idee so detailliert wie möglich. Je mehr Informationen du bereitstellst, desto besser kann die KI dich unterstützen.

Orientiere dich gerne an den folgenden Punkten:

*   **Problem:** Was ist das aktuelle Problem oder die Herausforderung?
    *   *Beispiel: „Unsere manuelle Rechnungsprüfung ist langsam und fehleranfällig, was zu verspäteten Zahlungen führt.“*

*   **Ziel:** Was soll mit der Idee erreicht oder verbessert werden?
    *   *Beispiel: „Wir möchten den Prozess der Rechnungsprüfung automatisieren, um die Durchlaufzeit um 50% zu reduzieren und Fehler zu minimieren.“*

*   **Zielgruppe:** Wer ist von diesem Problem betroffen oder profitiert von der Lösung?
    *   *Beispiel: „Die Buchhaltungsabteilung (5 Mitarbeiter) und unsere Lieferanten.“*

*   **Aufwand & Budget:** Gibt es erste Schätzungen zu Kosten oder internem Aufwand?
    *   *Beispiel: „Wir schätzen den externen Kostenaufwand auf ca. 20.000 EUR und benötigen 30 Personentage aus der IT.“*

*   **Nutzen:** Wie hilft die Idee, Zeit oder Geld zu sparen?
    *   *Beispiel: „Durch die Automatisierung sparen wir wöchentlich 10 Arbeitsstunden und vermeiden Mahngebühren von ca. 5.000 EUR pro Jahr.“*

*   **Zeitplan:** Gibt es einen gewünschten Start- oder Endtermin?
    *   *Beispiel: „Das Projekt sollte im nächsten Quartal starten und innerhalb von 6 Monaten abgeschlossen sein.“*

Keine Sorge, wenn du nicht alle Punkte beantworten kannst. Schreibe einfach auf, was dir wichtig ist!`;