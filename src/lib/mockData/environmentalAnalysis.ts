// Mock data for environmental analysis in Step 4

export interface EnvironmentalNode {
  id: string;
  type: 'demand' | 'project' | 'innovation' | 'process' | 'current';
  title: string;
  description: string;
  similarity?: number;
  reason?: string;
}

// Laufende Projekte (Running Projects)
export const MOCK_PROJECTS: EnvironmentalNode[] = [
  {
    id: 'proj-001',
    type: 'project',
    title: 'CRM Modernisierung',
    description: 'Upgrade des bestehenden CRM-Systems auf Salesforce',
    similarity: 75,
    reason: 'Hohe Ähnlichkeit: Beide Vorhaben betreffen Kundendaten-Management und -analyse. Mögliche Synergien bei Datenintegration und User Training.'
  },
  {
    id: 'proj-002',
    type: 'project',
    title: 'Cloud Migration Phase 2',
    description: 'Migration weiterer On-Premise Systeme in die AWS Cloud',
    similarity: 60,
    reason: 'Mittlere Ähnlichkeit: Infrastruktur-Abhängigkeit. Ihr Vorhaben könnte von der Cloud-Infrastruktur profitieren.'
  },
  {
    id: 'proj-003',
    type: 'project',
    title: 'Mobile App Entwicklung',
    description: 'Native iOS/Android App für Kundenportal',
    similarity: 45,
    reason: 'Geringe Ähnlichkeit: Beide Projekte zielen auf verbesserte Kundenerfahrung ab, aber unterschiedliche technische Umsetzung.'
  }
];

// Eingereichte Innovationsideen (Submitted Innovation Ideas)
export const MOCK_INNOVATIONS: EnvironmentalNode[] = [
  {
    id: 'inno-001',
    type: 'innovation',
    title: 'KI-gestützte Produktempfehlungen',
    description: 'Machine Learning Algorithmus für personalisierte Produktvorschläge',
    similarity: 85,
    reason: 'Sehr hohe Ähnlichkeit: Beide nutzen KI/ML-Technologien. Starke Synergie bei Datenaufbereitung und Modelltraining möglich.'
  },
  {
    id: 'inno-002',
    type: 'innovation',
    title: 'Blockchain Supply Chain',
    description: 'Blockchain-basierte Lieferkettenüberwachung',
    similarity: 30,
    reason: 'Geringe Ähnlichkeit: Unterschiedliche Technologie-Stacks und Geschäftsbereiche.'
  },
  {
    id: 'inno-003',
    type: 'innovation',
    title: 'Chatbot für Kundensupport',
    description: 'KI-Chatbot zur Automatisierung von Kundenanfragen',
    similarity: 70,
    reason: 'Hohe Ähnlichkeit: Beide Vorhaben zielen auf KI-gestützte Kundeninteraktion. Mögliche Wiederverwendung von NLP-Komponenten.'
  }
];

// Betroffene Unternehmensprozesse (Affected Business Processes)
export const MOCK_PROCESSES: EnvironmentalNode[] = [
  {
    id: 'proc-001',
    type: 'process',
    title: 'Kundenakquise',
    description: 'Prozess zur Gewinnung neuer Kunden (Marketing → Vertrieb → Onboarding)',
    similarity: 80,
    reason: 'Hohe Relevanz: Ihr Vorhaben hat direkten Einfluss auf den Kundenakquise-Prozess. Änderungen am CRM, Marketing-Automation und Lead-Management erforderlich.'
  },
  {
    id: 'proc-002',
    type: 'process',
    title: 'Produktentwicklung',
    description: 'Entwicklungsprozess von der Ideenfindung bis zum Produktlaunch',
    similarity: 55,
    reason: 'Mittlere Relevanz: Indirekte Auswirkung durch Feedback-Daten. Produktentwicklung könnte von neuen Insights profitieren.'
  },
  {
    id: 'proc-003',
    type: 'process',
    title: 'After-Sales-Service',
    description: 'Kundensupport, Wartung und Reklamationsmanagement',
    similarity: 65,
    reason: 'Mittlere bis hohe Relevanz: Service-Teams benötigen Zugriff auf neue Daten. Integration in bestehende Ticketing-Systeme notwendig.'
  },
  {
    id: 'proc-004',
    type: 'process',
    title: 'Datenschutz & Compliance',
    description: 'DSGVO-Konformität, Datensicherheit und Audit-Prozesse',
    similarity: 90,
    reason: 'Sehr hohe Relevanz: KRITISCH! Jede neue Datenverarbeitung muss DSGVO-konform sein. Privacy Impact Assessment erforderlich.'
  }
];

// Ähnliche Demands (existing functionality)
export const MOCK_SIMILAR_DEMANDS: EnvironmentalNode[] = [
  {
    id: 'dem-001',
    type: 'demand',
    title: 'Customer Analytics Dashboard',
    description: 'Echtzeit-Dashboard für Kundenanalysen',
    similarity: 92,
    reason: 'Sehr hohe Ähnlichkeit: Fast identische Zielstellung. ACHTUNG: Mögliches Duplikat! Prüfung auf Zusammenlegung empfohlen.'
  },
  {
    id: 'dem-002',
    type: 'demand',
    title: 'Automatisierung der Datenpflege',
    description: 'KI-gestützte Bereinigung von Kundendaten',
    similarity: 68,
    reason: 'Hohe Ähnlichkeit: Komplementäre Vorhaben. Ihr Demand könnte von sauberen Daten profitieren - Reihenfolge beachten!'
  }
];

// Function to filter nodes by threshold
export function filterByThreshold(
  nodes: EnvironmentalNode[],
  threshold: number
): EnvironmentalNode[] {
  return nodes.filter(node => (node.similarity || 0) >= threshold);
}

// Function to get all environmental nodes
export function getAllEnvironmentalNodes(
  demandDescription: string,
  threshold: number = 50
): {
  nodes: EnvironmentalNode[];
  filteredCount: number;
  totalCount: number;
} {
  const allNodes = [
    ...MOCK_PROJECTS,
    ...MOCK_INNOVATIONS,
    ...MOCK_PROCESSES,
    ...MOCK_SIMILAR_DEMANDS
  ];

  const filteredNodes = filterByThreshold(allNodes, threshold);

  return {
    nodes: filteredNodes,
    filteredCount: filteredNodes.length,
    totalCount: allNodes.length
  };
}
