// src/data/strategy.ts

export interface StrategyPillar {
    title: string;
    definition: string;
    example: string;
}

export const STRATEGY_PILLARS: StrategyPillar[] = [
    {
        title: "Kundenwachstum",
        definition: "Projekte, die direkt neue Kunden gewinnen oder den Umsatz bei bestehenden Kunden steigern (z.B. neue Märkte, CRM-Verbesserungen, E-Commerce-Funktionen).",
        example: "Entwicklung einer neuen App für Endkunden."
    },
    {
        title: "Operative Exzellenz",
        definition: "Projekte, die interne Prozesse effizienter machen, Kosten senken oder die Produktivität steigern (z.B. Automatisierung, Tool-Konsolidierung, Performance-Optimierung).",
        example: "Automatisierung der manuellen Rechnungsprüfung."
    },
    {
        title: "Innovation & Zukunft",
        definition: "Projekte mit explorativem Charakter, die neue Technologien (z.B. KI, IoT) testen oder langfristige, disruptive Geschäftsmodelle erforschen.",
        example: "Forschungsprojekt zur Nutzung von Quantum Computing für Logistik."
    },
    {
        title: "Nachhaltigkeit & ESG",
        definition: "Projekte, die die ökologische Bilanz verbessern oder soziale/regulatorische Anforderungen (ESG) erfüllen.",
        example: "Implementierung eines Dashboards zur CO2-Messung der Lieferkette."
    }
];