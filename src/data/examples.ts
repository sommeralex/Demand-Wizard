// Schlechtes Beispiel: Nur vage Idee, keine Details
export const BAD_EXAMPLE_TEXT = "Wir brauchen eine bessere App für die Buchhaltung.";

// Moderates Beispiel: Grundlegende Infos, aber unvollständig
export const MODERATE_EXAMPLE_TEXT = `Unser Rechnungseingang ist zu langsam. Aktuell dauert es 3-5 Tage, bis eine Rechnung bearbeitet ist.

Wir möchten einen automatisierten Workflow implementieren, der Rechnungen digitalisiert und zur Freigabe weiterleitet.

**Zielgruppe:** Buchhaltungsabteilung (5 Mitarbeiter)

**Geschätzter Aufwand:** ca. 10 Personentage intern

**Erwarteter Nutzen:** Verkürzung der Bearbeitungszeit auf 1 Tag`;

// Vollständiges Beispiel: Alle 7 Kriterien erfüllt
export const COMPLETE_EXAMPLE_TEXT = `**Problem:** Unser Vertriebsteam (12 Mitarbeiter) verbringt täglich bis zu 2 Stunden damit, manuell Kundendaten aus E-Mails in unser altes CRM-System zu kopieren. Dieser Prozess ist fehleranfällig, führt zu veralteten Daten und kostet uns ca. 50.000 EUR/Jahr an Arbeitszeit.

**Ziel:** Automatisierung der CRM-Dateneingabe durch E-Mail-Parsing und OCR, um die manuelle Eingabe um 90% zu reduzieren und die Datenqualität zu verbessern.

**Betroffene Nutzer:** 12 Vertriebsmitarbeiter, CRM-Administratoren (2 Personen)

**Budget & Kosten:**

**CAPEX 2025 (Investition):**
- OCR-Software-Lizenz (einmalig): 10.000 EUR
- CRM-Schnittstelle Implementierung (extern): 30.000 EUR
- Gesamt CAPEX: 40.000 EUR

**OPEX (jährliche Kosten):**
- 2025: Wartung & Support: 8.000 EUR, Cloud-Hosting: 2.000 EUR, Schulung: 5.000 EUR = 15.000 EUR
- 2026: Wartung & Support: 8.000 EUR, Cloud-Hosting: 2.000 EUR, Updates: 5.000 EUR = 15.000 EUR
- 2027: Wartung & Support: 8.000 EUR, Cloud-Hosting: 2.000 EUR = 10.000 EUR

**Interner Aufwand:**
- Projektmanagement: 10 Personentage
- IT-Integration & Tests: 15 Personentage
- Change Management & Training: 5 Personentage
- Gesamt: 30 Personentage (à 800 EUR = 24.000 EUR)

**Nutzen:**
- Zeiteinsparung: 12 Mitarbeiter × 2h/Tag × 220 Arbeitstage = 5.280 Stunden/Jahr
- Monetärer Gegenwert: 5.280h × 50 EUR/h = 264.000 EUR/Jahr
- Zusätzlich: Reduzierung von Dateneingabefehlern um 80%, schnellere Reaktionszeiten im Vertrieb

**Zeitplan:**
- Projektstart: Q1 2025
- Go-Live: Q3 2025 (6 Monate Laufzeit)
- Phase 1 (Q1-Q2): Implementierung & Integration
- Phase 2 (Q3): Pilotphase mit 3 Mitarbeitern
- Phase 3 (Q4): Roll-out für gesamtes Team

**ROI:** Break-Even nach ca. 4-5 Monaten aufgrund der hohen Zeiteinsparungen`;

// Alias für Abwärtskompatibilität
export const GOOD_EXAMPLE_TEXT = COMPLETE_EXAMPLE_TEXT;
