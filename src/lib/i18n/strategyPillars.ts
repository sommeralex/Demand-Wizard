// src/lib/i18n/strategyPillars.ts
import { Locale } from './index';

export interface StrategyPillar {
  title: string;
  definition: string;
  example: string;
}

const STRATEGY_PILLARS_DE: StrategyPillar[] = [
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

const STRATEGY_PILLARS_EN: StrategyPillar[] = [
  {
    title: "Customer Growth",
    definition: "Projects that directly acquire new customers or increase revenue with existing customers (e.g., new markets, CRM improvements, e-commerce features).",
    example: "Development of a new app for end customers."
  },
  {
    title: "Operational Excellence",
    definition: "Projects that make internal processes more efficient, reduce costs, or increase productivity (e.g., automation, tool consolidation, performance optimization).",
    example: "Automation of manual invoice verification."
  },
  {
    title: "Innovation & Future",
    definition: "Projects with exploratory character that test new technologies (e.g., AI, IoT) or explore long-term, disruptive business models.",
    example: "Research project on using Quantum Computing for logistics."
  },
  {
    title: "Sustainability & ESG",
    definition: "Projects that improve the ecological balance or meet social/regulatory requirements (ESG).",
    example: "Implementation of a dashboard for measuring CO2 in the supply chain."
  }
];

export function getStrategyPillars(locale: Locale): StrategyPillar[] {
  return locale === 'en' ? STRATEGY_PILLARS_EN : STRATEGY_PILLARS_DE;
}
