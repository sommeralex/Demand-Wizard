import { Locale } from './index';

// German Examples
const BAD_EXAMPLE_TEXT_DE = "Wir brauchen eine bessere App für die Buchhaltung.";

const MODERATE_EXAMPLE_TEXT_DE = `Unser Rechnungseingang ist zu langsam. Aktuell dauert es 3-5 Tage, bis eine Rechnung bearbeitet ist.

Wir möchten einen automatisierten Workflow implementieren, der Rechnungen digitalisiert und zur Freigabe weiterleitet.

**Zielgruppe:** Buchhaltungsabteilung (5 Mitarbeiter)

**Geschätzter Aufwand:** ca. 10 Personentage intern

**Erwarteter Nutzen:** Verkürzung der Bearbeitungszeit auf 1 Tag`;

const COMPLETE_EXAMPLE_TEXT_DE = `**Problem:** Unser Vertriebsteam (12 Mitarbeiter) verbringt täglich bis zu 2 Stunden damit, manuell Kundendaten aus E-Mails in unser altes CRM-System zu kopieren. Dieser Prozess ist fehleranfällig, führt zu veralteten Daten und kostet uns ca. 50.000 EUR/Jahr an Arbeitszeit.

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

// English Examples
const BAD_EXAMPLE_TEXT_EN = "We need a better app for accounting.";

const MODERATE_EXAMPLE_TEXT_EN = `Our invoice processing is too slow. Currently it takes 3-5 days to process an invoice.

We want to implement an automated workflow that digitizes invoices and forwards them for approval.

**Target Group:** Accounting department (5 employees)

**Estimated Effort:** approx. 10 person-days internal

**Expected Benefit:** Reduction of processing time to 1 day`;

const COMPLETE_EXAMPLE_TEXT_EN = `**Problem:** Our sales team (12 employees) spends up to 2 hours daily manually copying customer data from emails into our old CRM system. This process is error-prone, leads to outdated data, and costs us approximately 50,000 EUR/year in work time.

**Goal:** Automate CRM data entry through email parsing and OCR to reduce manual input by 90% and improve data quality.

**Affected Users:** 12 sales employees, CRM administrators (2 people)

**Budget & Costs:**

**CAPEX 2025 (Investment):**
- OCR software license (one-time): 10,000 EUR
- CRM interface implementation (external): 30,000 EUR
- Total CAPEX: 40,000 EUR

**OPEX (annual costs):**
- 2025: Maintenance & Support: 8,000 EUR, Cloud Hosting: 2,000 EUR, Training: 5,000 EUR = 15,000 EUR
- 2026: Maintenance & Support: 8,000 EUR, Cloud Hosting: 2,000 EUR, Updates: 5,000 EUR = 15,000 EUR
- 2027: Maintenance & Support: 8,000 EUR, Cloud Hosting: 2,000 EUR = 10,000 EUR

**Internal Effort:**
- Project management: 10 person-days
- IT integration & testing: 15 person-days
- Change management & training: 5 person-days
- Total: 30 person-days (@ 800 EUR = 24,000 EUR)

**Benefits:**
- Time savings: 12 employees × 2h/day × 220 work days = 5,280 hours/year
- Monetary value: 5,280h × 50 EUR/h = 264,000 EUR/year
- Additionally: 80% reduction in data entry errors, faster sales response times

**Timeline:**
- Project start: Q1 2025
- Go-live: Q3 2025 (6 months duration)
- Phase 1 (Q1-Q2): Implementation & Integration
- Phase 2 (Q3): Pilot phase with 3 employees
- Phase 3 (Q4): Roll-out for entire team

**ROI:** Break-even after approx. 4-5 months due to high time savings`;

export function getBadExampleText(locale: Locale): string {
  return locale === 'de' ? BAD_EXAMPLE_TEXT_DE : BAD_EXAMPLE_TEXT_EN;
}

export function getModerateExampleText(locale: Locale): string {
  return locale === 'de' ? MODERATE_EXAMPLE_TEXT_DE : MODERATE_EXAMPLE_TEXT_EN;
}

export function getCompleteExampleText(locale: Locale): string {
  return locale === 'de' ? COMPLETE_EXAMPLE_TEXT_DE : COMPLETE_EXAMPLE_TEXT_EN;
}
