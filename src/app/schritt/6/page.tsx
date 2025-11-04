"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

interface Message { role: 'user' | 'model'; text: string; }

interface BusinessCaseData {
  planungshorizont_jahre?: number;
  investition?: {
    capex: number;
    opex_jaehrlich: number;
    gesamt_ueber_planungshorizont: number;
  };
  nutzen?: {
    jaehrliche_einsparungen: number;
    einmalige_einsparungen: number;
    jaehrliche_umsatzsteigerung: number;
    gesamt_jaehrlich: number;
    beschreibung: string;
  };
  cashflow?: Array<{
    jahr: number;
    netto_cashflow: number;
    kumulativ: number;
    beschreibung: string;
  }>;
  kennzahlen?: {
    break_even_monat: number;
    roi_prozent: number;
    gesamtnutzen: number;
    gesamtkosten: number;
    netto_gewinn: number;
  };
  empfehlung?: string;
  risiken?: string[];
  optimierungen?: string[];
}

// Helper function for safe number formatting
const formatCurrency = (num: number): string => {
  if (typeof window === 'undefined') return `${num}`;
  return num.toLocaleString('de-DE');
};

// Break-Even Chart Component
const BreakEvenChart: React.FC<{
  businessCaseData: BusinessCaseData | null;
  yearlyTotals: { [year: number]: { opex: number; capex: number } };
}> = ({ businessCaseData, yearlyTotals }) => {
  if (!businessCaseData || !businessCaseData.cashflow) {
    return (
      <div className="text-center p-10 text-gray-500">
        <p>Keine Business Case Daten verfügbar.</p>
        <p className="text-sm mt-2">Starten Sie die Analyse mit dem Assistenten auf der rechten Seite.</p>
      </div>
    );
  }

  // Get calendar years from yearlyTotals
  const calendarYears = Object.keys(yearlyTotals).map(Number).sort((a, b) => a - b);
  const startYear = calendarYears.length > 0 ? calendarYears[0] : new Date().getFullYear();

  // Map relative years to calendar years for labels
  // Jahr 0 = startYear (Investition), Jahr 1 = startYear+1, Jahr 2 = startYear+2, etc.
  const labels = businessCaseData.cashflow.map(cf => {
    const calendarYear = startYear + cf.jahr;
    if (cf.jahr === 0) return `${calendarYear} (Investition)`;
    return `${calendarYear}`;
  });

  console.log('BreakEvenChart - yearlyTotals:', yearlyTotals);
  console.log('BreakEvenChart - cashflow:', businessCaseData.cashflow);
  console.log('BreakEvenChart - startYear:', startYear);

  // Extract CAPEX, OPEX, and Nutzen for each year
  const capexData = businessCaseData.cashflow.map(cf => {
    // Convert relative year to calendar year: Jahr 0 = startYear, Jahr 1 = startYear+1, etc.
    const calendarYear = startYear + cf.jahr;
    // Use yearlyTotals to get actual CAPEX per year from budget table
    const capex = yearlyTotals[calendarYear]?.capex || 0;
    console.log(`CAPEX - Relatives Jahr ${cf.jahr} -> Kalenderjahr ${calendarYear}: ${capex}`);
    return capex > 0 ? -capex : 0;
  });

  const opexData = businessCaseData.cashflow.map(cf => {
    // Convert relative year to calendar year: Jahr 0 = startYear, Jahr 1 = startYear+1, etc.
    const calendarYear = startYear + cf.jahr;
    // Use yearlyTotals to get actual OPEX per year from budget table
    const opex = yearlyTotals[calendarYear]?.opex || 0;
    console.log(`OPEX - Relatives Jahr ${cf.jahr} -> Kalenderjahr ${calendarYear}: ${opex}`);
    return opex > 0 ? -opex : 0;
  });

  console.log('BreakEvenChart - opexData:', opexData);

  const nutzenData = businessCaseData.cashflow.map(cf => {
    if (cf.jahr === 0) return 0;
    // Extract Nutzen from description
    const match = cf.beschreibung.match(/Nutzen (\d+)/);
    return match ? parseFloat(match[1]) : 0;
  });

  // Get cumulative cashflow data
  const kumulativeData = businessCaseData.cashflow.map(cf => cf.kumulativ);

  // Find Break-Even year
  let breakEvenIndex = -1;
  for (let i = 0; i < businessCaseData.cashflow.length; i++) {
    if (businessCaseData.cashflow[i].kumulativ >= 0) {
      breakEvenIndex = i;
      break;
    }
  }

  const data = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'CAPEX (Investition)',
        data: capexData,
        backgroundColor: 'rgb(239, 68, 68)', // Red for costs
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        stack: 'kosten', // Stack CAPEX with OPEX
        order: 2,
      },
      {
        type: 'bar' as const,
        label: 'OPEX (Laufende Kosten)',
        data: opexData,
        backgroundColor: 'rgb(251, 146, 60)', // Orange for OPEX
        borderColor: 'rgb(251, 146, 60)',
        borderWidth: 1,
        stack: 'kosten', // Stack OPEX with CAPEX
        order: 2,
      },
      {
        type: 'bar' as const,
        label: 'Nutzen (Einsparungen + Erlös)',
        data: nutzenData,
        backgroundColor: 'rgb(34, 197, 94)', // Green for benefits
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        stack: 'nutzen', // Separate stack for benefits
        order: 2,
      },
      {
        type: 'line' as const,
        label: '📊 Kumulativer Cashflow (Break-Even)',
        data: kumulativeData,
        borderColor: 'rgb(59, 130, 246)', // Blue line
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointHoverRadius: 8,
        pointBackgroundColor: kumulativeData.map((value: number, index: number) =>
          index === breakEvenIndex ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
        ),
        pointBorderColor: kumulativeData.map((value: number, index: number) =>
          index === breakEvenIndex ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
        ),
        pointRadius: kumulativeData.map((value: number, index: number) =>
          index === breakEvenIndex ? 10 : 6
        ),
        order: 1,
        yAxisID: 'y',
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Business Case Analyse - Kosten vs. Nutzen',
        font: {
          size: 18,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              const value = Math.abs(context.parsed.y);
              label += new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        }
      },
      y: {
        stacked: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
          }
        },
        grid: {
          color: function(context: any) {
            if (context.tick.value === 0) {
              return 'rgb(55, 65, 81)'; // Dark gray for 0-line
            }
            return 'rgba(0, 0, 0, 0.1)';
          },
          lineWidth: function(context: any) {
            if (context.tick.value === 0) {
              return 3;
            }
            return 1;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="h-[400px]">
        <Chart type='bar' data={data} options={options} />
      </div>

      {/* Chart Explanation */}
      <div className="p-3 bg-blue-50 border-l-4 border-blue-500 text-sm">
        <p className="font-semibold text-blue-900 mb-1">💡 Chart-Erklärung:</p>
        <p className="text-blue-800">
          <span className="text-red-600 font-semibold">Rote Balken</span> = CAPEX (Investitionskosten),
          <span className="text-orange-600 font-semibold"> Orange Balken</span> = OPEX (laufende Kosten),
          <span className="text-green-600 font-semibold"> Grüne Balken</span> = Nutzen (Einsparungen + Erlös).
          <span className="text-blue-600 font-semibold"> Blaue Linie</span> = Kumulativer Cashflow.
          {breakEvenIndex >= 0 && ` 🎯 Break-Even (roter Punkt) wird in Jahr ${businessCaseData.cashflow[breakEvenIndex].jahr} erreicht, wenn die blaue Linie die 0-EUR-Linie kreuzt.`}
        </p>
      </div>

      {/* Nutzen Breakdown */}
      {businessCaseData.nutzen && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Jährlicher Nutzen (Aufschlüsselung)</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Kosteneinsparungen</p>
              <p className="text-xl font-bold text-green-700">
                {formatCurrency(businessCaseData.nutzen.jaehrliche_einsparungen || 0)} EUR/Jahr
              </p>
            </div>
            {businessCaseData.nutzen.jaehrliche_umsatzsteigerung > 0 && (
              <div>
                <p className="text-gray-600">Erlös / Umsatzsteigerung</p>
                <p className="text-xl font-bold text-blue-700">
                  {formatCurrency(businessCaseData.nutzen.jaehrliche_umsatzsteigerung || 0)} EUR/Jahr
                </p>
              </div>
            )}
            <div className="col-span-2 pt-2 border-t border-gray-300">
              <p className="text-gray-600">Gesamtnutzen pro Jahr</p>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(businessCaseData.nutzen.gesamt_jaehrlich || 0)} EUR/Jahr
              </p>
            </div>
          </div>
          {businessCaseData.nutzen.beschreibung && (
            <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
              {businessCaseData.nutzen.beschreibung}
            </p>
          )}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 border-l-4 border-gray-500 rounded">
          <p className="text-sm text-gray-600">Break-Even Zeitpunkt</p>
          <p className="text-2xl font-bold text-gray-700">
            {(businessCaseData.kennzahlen?.break_even_monat ?? 0) > 0
              ? `${businessCaseData.kennzahlen?.break_even_monat} Monate`
              : 'Nicht erreicht'}
          </p>
        </div>
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="text-sm text-gray-600">Gesamtnutzen (über {businessCaseData.planungshorizont_jahre} Jahre)</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(businessCaseData.kennzahlen?.gesamtnutzen || 0)} EUR
          </p>
        </div>
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-gray-600">Gesamtkosten (CAPEX + OPEX)</p>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(businessCaseData.kennzahlen?.gesamtkosten || 0)} EUR
          </p>
        </div>
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm text-gray-600">ROI / Netto Gewinn</p>
          <p className="text-2xl font-bold text-blue-700">
            {businessCaseData.kennzahlen?.roi_prozent}% / {formatCurrency(businessCaseData.kennzahlen?.netto_gewinn || 0)} EUR
          </p>
        </div>
      </div>

      {/* Recommendation */}
      {businessCaseData.empfehlung && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <h4 className="font-semibold text-green-800 mb-2">Empfehlung</h4>
          <p className="text-sm text-gray-700">{businessCaseData.empfehlung}</p>
        </div>
      )}

      {/* Risks */}
      {businessCaseData.risiken && businessCaseData.risiken.length > 0 && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">Risiken</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {businessCaseData.risiken.map((risk, idx) => (
              <li key={idx}>{risk}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Optimizations */}
      {businessCaseData.optimierungen && businessCaseData.optimierungen.length > 0 && (
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <h4 className="font-semibold text-blue-800 mb-2">Optimierungsvorschläge</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {businessCaseData.optimierungen.map((opt, idx) => (
              <li key={idx}>{opt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Business Case Assumptions Form Component
const BusinessCaseAssumptions: React.FC<{
  opexTotal: number;
  capexTotal: number;
  yearlyOpex: { [year: number]: { opex: number; capex: number } };
  onCalculate: (assumptions: any) => void;
  assumptions: {
    planungshorizont: number;
    mitarbeiterAnzahl: number;
    stundenProTag: number;
    reduktionProzent: number;
    stundensatz: number;
    arbeitstageProJahr: number;
    jaehrlicheUmsatzsteigerung: number;
  };
  onAssumptionsChange: (assumptions: any) => void;
}> = ({ opexTotal, capexTotal, yearlyOpex, onCalculate, assumptions, onAssumptionsChange }) => {
  const [isMounted, setIsMounted] = useState(false);

  const planungshorizont = assumptions.planungshorizont;
  const mitarbeiterAnzahl = assumptions.mitarbeiterAnzahl;
  const stundenProTag = assumptions.stundenProTag;
  const reduktionProzent = assumptions.reduktionProzent;
  const stundensatz = assumptions.stundensatz;
  const arbeitstageProJahr = assumptions.arbeitstageProJahr;
  const jaehrlicheUmsatzsteigerung = assumptions.jaehrlicheUmsatzsteigerung;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setPlanungshorizont = (value: number) => onAssumptionsChange({ ...assumptions, planungshorizont: value });
  const setMitarbeiterAnzahl = (value: number) => onAssumptionsChange({ ...assumptions, mitarbeiterAnzahl: value });
  const setStundenProTag = (value: number) => onAssumptionsChange({ ...assumptions, stundenProTag: value });
  const setReduktionProzent = (value: number) => onAssumptionsChange({ ...assumptions, reduktionProzent: value });
  const setStundensatz = (value: number) => onAssumptionsChange({ ...assumptions, stundensatz: value });
  const setArbeitstageProJahr = (value: number) => onAssumptionsChange({ ...assumptions, arbeitstageProJahr: value });
  const setJaehrlicheUmsatzsteigerung = (value: number) => onAssumptionsChange({ ...assumptions, jaehrlicheUmsatzsteigerung: value });

  const calculateBusinessCase = () => {
    // Zeitersparnis berechnen
    const gesparteStundenProTag = stundenProTag * (reduktionProzent / 100);
    const gesparteStundenProMitarbeiterProJahr = gesparteStundenProTag * arbeitstageProJahr;
    const jaehrlicheEinsparungen = gesparteStundenProMitarbeiterProJahr * mitarbeiterAnzahl * stundensatz;

    // Gesamtnutzen = Einsparungen + Umsatzsteigerung
    const gesamtnutzenProJahr = jaehrlicheEinsparungen + jaehrlicheUmsatzsteigerung;

    // Cashflow berechnen
    const cashflow = [];
    let kumulativ = -capexTotal;

    // Jahr 0
    cashflow.push({
      jahr: 0,
      netto_cashflow: -capexTotal,
      kumulativ: kumulativ,
      beschreibung: "Initiale Investition (CAPEX)"
    });

    // Jahre 1 bis Planungshorizont
    console.log('calculateBusinessCase - yearlyOpex:', yearlyOpex);
    for (let jahr = 1; jahr <= planungshorizont; jahr++) {
      // Use actual yearly OPEX if available, otherwise fall back to average
      const yearlyOpexValue = yearlyOpex[jahr]?.opex || opexTotal;
      console.log(`calculateBusinessCase - Jahr ${jahr}: yearlyOpex[${jahr}] =`, yearlyOpex[jahr], `yearlyOpexValue = ${yearlyOpexValue}`);
      const nettoCashflow = gesamtnutzenProJahr - yearlyOpexValue;
      kumulativ += nettoCashflow;
      cashflow.push({
        jahr,
        netto_cashflow: nettoCashflow,
        kumulativ,
        beschreibung: `Nutzen ${gesamtnutzenProJahr.toFixed(0)} EUR (Einsparungen ${jaehrlicheEinsparungen.toFixed(0)} + Erlös ${jaehrlicheUmsatzsteigerung.toFixed(0)}) - OPEX ${yearlyOpexValue.toFixed(0)} EUR`
      });
    }

    // Break-Even Monat berechnen (using actual yearly OPEX)
    let breakEvenMonat = 0;
    let kumulativMonatlich = -capexTotal;

    for (let monat = 1; monat <= planungshorizont * 12; monat++) {
      const jahr = Math.ceil(monat / 12);
      const yearlyOpexValue = yearlyOpex[jahr]?.opex || opexTotal;
      const monatlicheEinsparung = (gesamtnutzenProJahr - yearlyOpexValue) / 12;
      kumulativMonatlich += monatlicheEinsparung;
      if (kumulativMonatlich >= 0 && breakEvenMonat === 0) {
        breakEvenMonat = monat;
        break;
      }
    }

    // Calculate total OPEX costs using actual yearly values
    let totalOpexCosts = 0;
    for (let jahr = 1; jahr <= planungshorizont; jahr++) {
      totalOpexCosts += yearlyOpex[jahr]?.opex || opexTotal;
    }
    const gesamtkosten = capexTotal + totalOpexCosts;
    const gesamtnutzen = gesamtnutzenProJahr * planungshorizont;
    const nettoGewinn = gesamtnutzen - gesamtkosten;
    const roi = ((nettoGewinn / gesamtkosten) * 100).toFixed(0);

    const businessCaseData = {
      planungshorizont_jahre: planungshorizont,
      investition: {
        capex: capexTotal,
        opex_jaehrlich: opexTotal,
        gesamt_ueber_planungshorizont: gesamtkosten
      },
      nutzen: {
        jaehrliche_einsparungen: jaehrlicheEinsparungen,
        einmalige_einsparungen: 0,
        jaehrliche_umsatzsteigerung: jaehrlicheUmsatzsteigerung,
        gesamt_jaehrlich: gesamtnutzenProJahr,
        beschreibung: `Zeitersparnis: ${mitarbeiterAnzahl} MA × ${gesparteStundenProTag.toFixed(1)}h/Tag × ${arbeitstageProJahr} Tage × ${stundensatz} EUR/h${jaehrlicheUmsatzsteigerung > 0 ? ` + Erlös ${jaehrlicheUmsatzsteigerung.toLocaleString('de-DE')} EUR/Jahr` : ''}`
      },
      cashflow,
      kennzahlen: {
        break_even_monat: breakEvenMonat,
        roi_prozent: parseInt(roi),
        gesamtnutzen,
        gesamtkosten,
        netto_gewinn: nettoGewinn
      },
      empfehlung: nettoGewinn > 0
        ? `Das Projekt ist wirtschaftlich attraktiv mit einem ${breakEvenMonat > 0 ? `Break-Even nach ${breakEvenMonat} Monaten` : 'Break-Even, der nicht innerhalb des Planungshorizonts erreicht wird,'} und einem ROI von ${roi}% über ${planungshorizont} Jahre.`
        : `Das Projekt ist wirtschaftlich nicht rentabel. Prüfen Sie Optimierungsmöglichkeiten oder erhöhen Sie den erwarteten Nutzen.`,
      risiken: [
        "Nutzen hängt stark von der tatsächlichen Zeitersparnis ab",
        "OPEX könnte bei Skalierung steigen",
        "Mitarbeiterakzeptanz und Schulungsaufwand"
      ],
      optimierungen: [
        "Prüfung, ob das System auf andere Abteilungen ausgeweitet werden kann",
        "Phasenweise Einführung zur Risikominimierung",
        "Identifikation weiterer Nutzenpotenziale"
      ]
    };

    onCalculate(businessCaseData);
  };

  useEffect(() => {
    // Automatische Berechnung bei Änderungen
    calculateBusinessCase();
  }, [planungshorizont, mitarbeiterAnzahl, stundenProTag, reduktionProzent, stundensatz, arbeitstageProJahr, jaehrlicheUmsatzsteigerung, opexTotal, capexTotal, yearlyOpex]);

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Annahmen für Business Case</h3>

      <div className="p-3 bg-blue-50 border-l-4 border-blue-500 text-sm mb-4">
        <p className="font-semibold text-blue-900">ℹ️ Wichtig: Zeitlicher Ablauf</p>
        <p className="text-blue-800 mt-1">
          Die Nutzenrealisierung (Einsparungen & Umsatzsteigerung) beginnt <strong>ein Jahr nach dem Investitionsjahr</strong>.
          Beispiel: Investition in 2025 → Nutzen ab 2026.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Planungshorizont (Jahre)
          </label>
          <input
            type="number"
            value={planungshorizont}
            onChange={(e) => setPlanungshorizont(parseInt(e.target.value) || 3)}
            className="w-full p-2 border rounded-md"
            min="1"
            max="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Betroffene Mitarbeiter
          </label>
          <input
            type="number"
            value={mitarbeiterAnzahl}
            onChange={(e) => setMitarbeiterAnzahl(parseInt(e.target.value) || 1)}
            className="w-full p-2 border rounded-md"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zeitaufwand (Std/Tag)
          </label>
          <input
            type="number"
            step="0.5"
            value={stundenProTag}
            onChange={(e) => setStundenProTag(parseFloat(e.target.value) || 0)}
            className="w-full p-2 border rounded-md"
            min="0"
            max="8"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reduktion (%)
          </label>
          <input
            type="number"
            value={reduktionProzent}
            onChange={(e) => setReduktionProzent(parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded-md"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stundensatz (EUR)
          </label>
          <input
            type="number"
            value={stundensatz}
            onChange={(e) => setStundensatz(parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded-md"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Arbeitstage/Jahr
          </label>
          <input
            type="number"
            value={arbeitstageProJahr}
            onChange={(e) => setArbeitstageProJahr(parseInt(e.target.value) || 220)}
            className="w-full p-2 border rounded-md"
            min="200"
            max="260"
          />
        </div>
      </div>

      {/* Separator */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Zusätzlicher Nutzen (optional)</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jährliche Umsatzsteigerung / Erlös (EUR)
          </label>
          <input
            type="number"
            value={jaehrlicheUmsatzsteigerung === 0 ? '' : jaehrlicheUmsatzsteigerung}
            onChange={(e) => {
              const val = e.target.value;
              setJaehrlicheUmsatzsteigerung(val === '' ? 0 : parseInt(val) || 0);
            }}
            className="w-full p-2 border rounded-md"
            min="0"
            placeholder="z.B. 50000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Erwartete Umsatzsteigerung durch neue Features, mehr Kunden, höhere Conversion, etc.
          </p>
        </div>
      </div>

      {isMounted && (
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-sm">
          <p className="font-semibold text-blue-900">Berechneter jährlicher Gesamtnutzen:</p>
          <p className="text-blue-800">
            <span className="font-semibold">Einsparungen:</span> {mitarbeiterAnzahl} MA × {(stundenProTag * reduktionProzent / 100).toFixed(1)}h/Tag × {arbeitstageProJahr} Tage × {stundensatz} EUR/h
            = <span className="font-bold">{formatCurrency(mitarbeiterAnzahl * (stundenProTag * reduktionProzent / 100) * arbeitstageProJahr * stundensatz)} EUR/Jahr</span>
          </p>
          {jaehrlicheUmsatzsteigerung > 0 && (
            <p className="text-blue-800 mt-1">
              <span className="font-semibold">+ Erlös:</span> {formatCurrency(jaehrlicheUmsatzsteigerung)} EUR/Jahr
            </p>
          )}
          <p className="text-blue-900 font-bold mt-2 pt-2 border-t border-blue-200">
            = Gesamtnutzen: {formatCurrency((mitarbeiterAnzahl * (stundenProTag * reduktionProzent / 100) * arbeitstageProJahr * stundensatz) + jaehrlicheUmsatzsteigerung)} EUR/Jahr
          </p>
        </div>
      )}

      <div className="text-xs text-gray-500 italic mt-2">
        💡 Die Berechnung wird automatisch aktualisiert, wenn Sie die Werte ändern.
      </div>
    </div>
  );
};

// Business Case Chat Component (simplified)
const BusinessCaseChat: React.FC<{
  demand: string;
  opexTotal: number;
  capexTotal: number;
  businessCaseData: BusinessCaseData | null;
  onBusinessCaseUpdate: (data: BusinessCaseData) => void;
  currentAssumptions?: {
    planungshorizont: number;
    mitarbeiterAnzahl: number;
    stundenProTag: number;
    reduktionProzent: number;
    stundensatz: number;
    arbeitstageProJahr: number;
    jaehrlicheUmsatzsteigerung: number;
  };
}> = ({ demand, opexTotal, capexTotal, businessCaseData, onBusinessCaseUpdate, currentAssumptions }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageToSend: string = input, forceReload: boolean = false) => {
    if (!messageToSend.trim()) return;

    const userMessage: Message = { role: 'user', text: messageToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const currentHistory = messages.map(m => ({ role: m.role, parts: [{text: m.text}] }));
      const res = await fetch('/api/business-case-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: currentHistory,
          message: messageToSend,
          demandDescription: demand,
          opexTotal,
          capexTotal,
          businessCaseData,
          currentAssumptions,
          forceReload
        })
      });
      const data = await res.json();

      // Log the full response for debugging
      console.log("Business Case Assistant Response:", data);

      if (data.error) {
        setMessages(prev => [...prev, { role: 'model', text: `Fehler: ${data.error}` }]);
      } else if (data.message) {
        setMessages(prev => [...prev, { role: 'model', text: data.message }]);
      } else if (data.frage) {
        setMessages(prev => [...prev, { role: 'model', text: data.frage }]);
      } else if (data.kennzahlen) {
        // Full business case data received
        onBusinessCaseUpdate(data);
        setMessages(prev => [...prev, {
          role: 'model',
          text: `Ihre Business Case Analyse wurde erstellt!\n\n**Break-Even:** ${(data.kennzahlen?.break_even_monat ?? 0) > 0 ? `${data.kennzahlen.break_even_monat} Monate` : 'Nicht erreicht'}\n**ROI:** ${data.kennzahlen.roi_prozent}%\n\n${data.empfehlung || 'Die Analyse ist auf der linken Seite visualisiert.'}`
        }]);
      } else if (data.experten_empfehlung) {
        setMessages(prev => [...prev, { role: 'model', text: data.experten_empfehlung }]);
      } else {
        console.warn("Unexpected API response format:", data);
        const responseText = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        setMessages(prev => [...prev, {
          role: 'model',
          text: `Entschuldigung, ich konnte die Antwort nicht richtig verarbeiten. Bitte versuchen Sie es erneut oder formulieren Sie Ihre Anfrage anders.\n\nAntwort-Details (für Debugging):\n\`\`\`\n${responseText}\n\`\`\``
        }]);
      }
    } catch (error) {
      console.error("Business case assistant API error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Fehler bei der Kommunikation mit dem Assistenten." }]);
    }
    finally { setIsLoading(false); }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md border">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold">Business Case Assistent</h2>
        <p className="text-sm text-gray-600 mt-1">
          Lassen Sie sich bei der Erstellung eines überzeugenden Business Cases beraten.
        </p>
      </div>

      <div className="flex-grow p-6 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 p-4">
            <p>Willkommen beim Business Case Assistenten!</p>
            <p className="text-sm mt-2">Ich helfe Ihnen bei der ROI-Analyse und Break-Even-Berechnung.</p>
            <button
              onClick={() => handleSendMessage('Starte die Business Case Analyse', false)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Analyse starten
            </button>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <ReactMarkdown className="prose prose-sm">{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-gray-200">
              <span className="italic">schreibt...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            className="w-full p-2 border rounded-md"
            placeholder="Ihre Frage..."
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  );
};

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(40); // percentage for business case (smaller default)
  const [isResizing, setIsResizing] = useState(false);
  const currentStep = 6;

  // Use assumptions from WizardContext instead of local state
  const assumptions = wizard.businessCaseAssumptions;
  const setAssumptions = wizard.setBusinessCaseAssumptions;

  // Calculate totals from budget table
  const calculateBudgetTotals = () => {
    // Calculate totals per calendar year first
    const yearlyTotalsByCalendarYear: { [year: number]: { opex: number; capex: number } } = {};

    wizard.budgetTable.forEach(row => {
      const year = row.jahr;
      const value = parseFloat(row.wert.replace(/[^\d.-]/g, '')) || 0;

      if (!yearlyTotalsByCalendarYear[year]) {
        yearlyTotalsByCalendarYear[year] = { opex: 0, capex: 0 };
      }

      if (row.kostentyp === 'OPEX') {
        yearlyTotalsByCalendarYear[year].opex += value;
      } else {
        yearlyTotalsByCalendarYear[year].capex += value;
      }
    });

    // Keep calendar years as keys (don't convert to relative years)
    const yearlyTotals = yearlyTotalsByCalendarYear;

    // Calculate overall totals
    const opexSum = wizard.budgetTable
      .filter(r => r.kostentyp === 'OPEX')
      .reduce((sum, r) => sum + (parseFloat(r.wert.replace(/[^\d.-]/g, '')) || 0), 0);
    const capexSum = wizard.budgetTable
      .filter(r => r.kostentyp === 'CAPEX')
      .reduce((sum, r) => sum + (parseFloat(r.wert.replace(/[^\d.-]/g, '')) || 0), 0);

    // Calculate average annual OPEX (for years where OPEX exists)
    const yearsWithOpex = Object.keys(yearlyTotals).filter(y => yearlyTotals[parseInt(y)].opex > 0);
    const avgOpexPerYear = yearsWithOpex.length > 0
      ? opexSum / yearsWithOpex.length
      : opexSum / (wizard.budgetPlanningHorizon || 3); // Fallback to planning horizon

    return {
      opexSum,
      capexSum,
      avgOpexPerYear,
      yearlyTotals
    };
  };

  const { opexSum, capexSum, avgOpexPerYear, yearlyTotals } = useMemo(() => calculateBudgetTotals(), [wizard.budgetTable, wizard.budgetPlanningHorizon]);

  useEffect(() => {
    setMounted(true);
    if (wizard) {
      wizard.setStep(currentStep);
    }
  }, [currentStep, wizard]);

  const handleNext = () => {
    router.push('/schritt/7');
  };

  const handleBusinessCaseUpdate = (data: BusinessCaseData) => {
    wizard.setBusinessCaseData(data);
  };

  const forceReloadBusinessCase = () => {
    // Clear business case data to force recalculation
    wizard.setBusinessCaseData(null);
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const windowWidth = window.innerWidth;
      const newWidth = ((windowWidth - e.clientX) / windowWidth) * 100;

      // Constrain between 25% and 75%
      if (newWidth >= 25 && newWidth <= 75) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="flex flex-col min-h-screen lg:h-full">
      <div className="flex flex-col lg:flex-row lg:flex-grow lg:overflow-hidden relative">
        {/* Left side - Demand Text and Break-Even Chart */}
        <div className="p-4 md:p-8 lg:overflow-y-auto bg-white lg:w-auto" style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${100 - sidebarWidth}%` : '100%' }}>
          <h2 className="text-2xl font-semibold mb-6">Schritt 6: Business Case</h2>

          {/* Editable Demand Text */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Demand-Beschreibung
            </label>
            <textarea
              value={wizard.text}
              onChange={(e) => wizard.setText(e.target.value)}
              className="w-full p-3 border rounded-md text-sm min-h-[120px]"
              placeholder="Beschreiben Sie Ihren Demand..."
            />
          </div>

          {!mounted ? (
            <div className="text-center p-10">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Lade...</p>
            </div>
          ) : (
            <>
              {/* Budget Summary */}
              <div className="mb-6 p-4 bg-gray-50 border rounded-md">
                <h3 className="font-semibold mb-2">Budget-Übersicht (aus Schritt 5)</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">CAPEX (Investition)</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(capexSum)} EUR</p>
                  </div>
                  <div>
                    <p className="text-gray-600">OPEX Gesamt (über {wizard.budgetPlanningHorizon} Jahre)</p>
                    <p className="text-xl font-bold text-orange-600">{formatCurrency(opexSum)} EUR</p>
                    <p className="text-xs text-gray-500 mt-1">Ø {formatCurrency(avgOpexPerYear)} EUR/Jahr</p>
                  </div>
                </div>
              </div>

              <BreakEvenChart businessCaseData={wizard.businessCaseData} yearlyTotals={yearlyTotals} />
            </>
          )}
        </div>

        {/* Resize Handle - Hidden on mobile */}
        <div
          className="hidden lg:block w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
          style={{ cursor: isResizing ? 'col-resize' : 'ew-resize' }}
        />

        {/* Right side - Business Case Assumptions + Assistant */}
        <aside className="hidden lg:block p-4 md:p-8 bg-gray-100 lg:overflow-y-auto space-y-6 lg:w-auto" style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${sidebarWidth}%` : '100%' }}>
          <BusinessCaseAssumptions
            opexTotal={avgOpexPerYear}
            capexTotal={capexSum}
            yearlyOpex={yearlyTotals}
            onCalculate={handleBusinessCaseUpdate}
            assumptions={assumptions}
            onAssumptionsChange={setAssumptions}
          />

          <div className="border-t pt-6">
            <BusinessCaseChat
              demand={wizard.text}
              opexTotal={avgOpexPerYear}
              capexTotal={capexSum}
              businessCaseData={wizard.businessCaseData}
              onBusinessCaseUpdate={handleBusinessCaseUpdate}
              currentAssumptions={assumptions}
            />
          </div>
        </aside>
      </div>

      {/* Bottom navigation */}
      <div className="border-t p-4 bg-white">
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2 order-2 sm:order-1">
            <button
              onClick={() => router.back()}
              disabled={currentStep <= 1}
              className="px-6 py-2.5 text-sm bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 font-semibold w-full sm:w-auto"
            >
              Zurück
            </button>
            <button
              onClick={() => { wizard.reset(); router.push('/schritt/1'); }}
              className="px-6 py-2.5 text-sm bg-red-500 text-white rounded-lg font-semibold w-full sm:w-auto"
            >
              Sitzungsdaten löschen
            </button>
            <button
              onClick={forceReloadBusinessCase}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm bg-yellow-500 text-white rounded-lg disabled:opacity-50 font-semibold w-full sm:w-auto"
            >
              Force Reload
            </button>
          </div>
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 font-semibold flex justify-center items-center w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div> : null}
            Weiter
          </button>
        </div>
      </div>
    </div>
  );
}
