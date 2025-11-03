"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import ReactMarkdown from 'react-markdown';
import React from 'react';

interface Message { role: 'user' | 'model'; text: string; }
interface ClassificationResult {
  gesamtschaetzung: string;
  opex: { summe: number; positionen: { taetigkeit: string; kosten: number; }[]; };
  capex: { summe: number; positionen: { taetigkeit: string; kosten: number; }[]; };
}

interface BudgetTableRow {
  id: string;
  kostentyp: 'OPEX' | 'CAPEX';
  beschreibung: string;
  wert: string;
  jahr: number;
}

// Editable Budget Table Component
const EditableBudgetTable: React.FC<{
  rows: BudgetTableRow[],
  onRowsChange: (rows: BudgetTableRow[]) => void,
  startYear: number,
  planningHorizon: number
}> = ({ rows, onRowsChange, startYear, planningHorizon }) => {
  const addRow = () => {
    const newRow: BudgetTableRow = {
      id: Date.now().toString(),
      kostentyp: 'OPEX',
      beschreibung: '',
      wert: '',
      jahr: startYear
    };
    onRowsChange([...rows, newRow]);
  };

  const copyRow = (rowToCopy: BudgetTableRow) => {
    const currentIndex = rows.findIndex(r => r.id === rowToCopy.id);
    const newJahr = rowToCopy.jahr + 1;

    // Check if year is within planning horizon
    if (newJahr > startYear + planningHorizon - 1) {
      alert(`Jahr ${newJahr} überschreitet den Planungshorizont (${startYear} - ${startYear + planningHorizon - 1})`);
      return;
    }

    const newRow: BudgetTableRow = {
      id: Date.now().toString(),
      kostentyp: rowToCopy.kostentyp,
      beschreibung: rowToCopy.beschreibung,
      wert: rowToCopy.wert,
      jahr: newJahr
    };

    // Insert the copied row right after the original
    const newRows = [...rows];
    newRows.splice(currentIndex + 1, 0, newRow);
    onRowsChange(newRows);
  };

  const deleteRow = (id: string) => {
    const rowToDelete = rows.find(r => r.id === id);
    const confirmMessage = rowToDelete
      ? `Möchten Sie diese Zeile wirklich löschen?\n\n${rowToDelete.kostentyp}: ${rowToDelete.beschreibung} (${rowToDelete.wert} EUR, Jahr ${rowToDelete.jahr})`
      : 'Möchten Sie diese Zeile wirklich löschen?';

    if (window.confirm(confirmMessage)) {
      onRowsChange(rows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof BudgetTableRow, value: string | number) => {
    onRowsChange(rows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const calculateSummary = () => {
    // Calculate totals per year
    const yearlyTotals: { [year: number]: { opex: number; capex: number } } = {};

    rows.forEach(row => {
      const year = row.jahr;
      const value = parseFloat(row.wert.replace(/[^\d.-]/g, '')) || 0;

      if (!yearlyTotals[year]) {
        yearlyTotals[year] = { opex: 0, capex: 0 };
      }

      if (row.kostentyp === 'OPEX') {
        yearlyTotals[year].opex += value;
      } else {
        yearlyTotals[year].capex += value;
      }
    });

    // Calculate overall totals
    const opexSum = rows
      .filter(r => r.kostentyp === 'OPEX')
      .reduce((sum, r) => sum + (parseFloat(r.wert.replace(/[^\d.-]/g, '')) || 0), 0);
    const capexSum = rows
      .filter(r => r.kostentyp === 'CAPEX')
      .reduce((sum, r) => sum + (parseFloat(r.wert.replace(/[^\d.-]/g, '')) || 0), 0);

    // Calculate average annual OPEX (for years where OPEX exists)
    const yearsWithOpex = Object.keys(yearlyTotals).filter(y => yearlyTotals[parseInt(y)].opex > 0);
    const avgOpexPerYear = yearsWithOpex.length > 0
      ? opexSum / yearsWithOpex.length
      : 0;

    return {
      opexSum,
      capexSum,
      total: opexSum + capexSum,
      yearlyTotals,
      avgOpexPerYear
    };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">CAPEX/OPEX Analyse</h3>
        <button
          onClick={addRow}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          + Zeile hinzufügen
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jahr
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kostentyp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beschreibung der Tätigkeit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wert (EUR)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <select
                    value={row.jahr}
                    onChange={(e) => updateRow(row.id, 'jahr', parseInt(e.target.value))}
                    className="border rounded px-2 py-1 w-full"
                  >
                    {Array.from({ length: planningHorizon }, (_, i) => startYear + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <select
                    value={row.kostentyp}
                    onChange={(e) => updateRow(row.id, 'kostentyp', e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  >
                    <option value="OPEX">OPEX</option>
                    <option value="CAPEX">CAPEX</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={row.beschreibung}
                    onChange={(e) => updateRow(row.id, 'beschreibung', e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                    placeholder="z.B. Anschaffung eines Neuwagens"
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={row.wert}
                    onChange={(e) => updateRow(row.id, 'wert', e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                    placeholder="z.B. 50.000"
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyRow(row)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Zeile kopieren (Jahr +1)"
                    >
                      Kopieren
                    </button>
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Löschen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-semibold text-sm">
            {/* Yearly breakdown */}
            {Object.keys(summary.yearlyTotals)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(year => (
                <React.Fragment key={year}>
                  {summary.yearlyTotals[parseInt(year)].opex > 0 && (
                    <tr className="text-blue-700">
                      <td className="px-4 py-2" colSpan={3}>OPEX {year}</td>
                      <td className="px-4 py-2">{summary.yearlyTotals[parseInt(year)].opex.toLocaleString('de-DE')} EUR</td>
                      <td></td>
                    </tr>
                  )}
                  {summary.yearlyTotals[parseInt(year)].capex > 0 && (
                    <tr className="text-green-700">
                      <td className="px-4 py-2" colSpan={3}>CAPEX {year}</td>
                      <td className="px-4 py-2">{summary.yearlyTotals[parseInt(year)].capex.toLocaleString('de-DE')} EUR</td>
                      <td></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

            {/* Divider */}
            <tr>
              <td colSpan={5} className="border-t-2 border-gray-400"></td>
            </tr>

            {/* Overall totals */}
            <tr className="bg-blue-100">
              <td className="px-4 py-3" colSpan={3}>OPEX Gesamt (über {planningHorizon} Jahre)</td>
              <td className="px-4 py-3">{summary.opexSum.toLocaleString('de-DE')} EUR</td>
              <td></td>
            </tr>
            <tr className="bg-blue-50 text-xs">
              <td className="px-4 py-2" colSpan={3}>↳ Ø OPEX pro Jahr</td>
              <td className="px-4 py-2">{summary.avgOpexPerYear.toLocaleString('de-DE')} EUR</td>
              <td></td>
            </tr>
            <tr className="bg-green-100">
              <td className="px-4 py-3" colSpan={3}>CAPEX Gesamt</td>
              <td className="px-4 py-3">{summary.capexSum.toLocaleString('de-DE')} EUR</td>
              <td></td>
            </tr>
            <tr className="bg-gray-200">
              <td className="px-4 py-4" colSpan={3}>Gesamtsumme (CAPEX + OPEX gesamt)</td>
              <td className="px-4 py-4">{summary.total.toLocaleString('de-DE')} EUR</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const BudgetChat: React.FC<{ demand: any; budgetTable: BudgetTableRow[] }> = ({ demand, budgetTable }) => {
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
            const res = await fetch('/api/budget-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: currentHistory,
                    message: messageToSend,
                    demandDescription: demand?.description,
                    budgetTable: budgetTable,
                    forceReload
                })
            });
            const data = await res.json();

            if (data.message) {
                setMessages(prev => [...prev, { role: 'model', text: data.message }]);
            } else if (data.frage || data.experten_empfehlung) {
                setMessages(prev => [...prev, { role: 'model', text: data.frage || data.experten_empfehlung }]);
            } else {
                console.warn("Unexpected API response format:", data);
                setMessages(prev => [...prev, { role: 'model', text: "Ein unerwarteter Fehler ist aufgetreten." }]);
            }
        } catch (error) {
            console.error("Budget assistant API error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Fehler bei der Kommunikation mit dem Assistenten." }]);
        }
        finally { setIsLoading(false); }
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-lg shadow-md border">
            <div className="p-4 border-b bg-gray-50">
                <h2 className="text-xl font-semibold">Budget-Assistent</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Stellen Sie Fragen zur CAPEX/OPEX-Klassifizierung oder lassen Sie sich beraten.
                </p>
            </div>

            <div className="flex-grow p-6 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 p-4">
                        <p>Willkommen beim Budget-Assistenten!</p>
                        <p className="text-sm mt-2">Ich kann Ihnen bei der CAPEX/OPEX-Klassifizierung helfen.</p>
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const currentStep = 5;

  useEffect(() => {
    setMounted(true);
    if (wizard) {
      wizard.setStep(currentStep);
    }
  }, [currentStep, wizard]);

  // Helper function to extract planning horizon from demand text
  const extractPlanningHorizon = (text: string): number => {
    const match = text.match(/(\d+)\s*(jahre?|year)/i);
    if (match) {
      const years = parseInt(match[1]);
      if ([3, 5, 7].includes(years)) return years;
    }
    return 3; // Default
  };

  // Helper function to extract start year from demand text
  const extractStartYear = (text: string): number => {
    const currentYear = new Date().getFullYear();
    const match = text.match(/(20\d{2})/);
    if (match) {
      const year = parseInt(match[1]);
      if (year >= currentYear && year <= currentYear + 10) return year;
    }
    return currentYear; // Default
  };

  // Auto-analyze demand and populate table on mount if not already populated
  useEffect(() => {
    const analyzeAndPopulateTable = async () => {
      if (wizard.text && wizard.budgetTable.length === 0) {
        // Extract planning horizon and start year from demand text
        const extractedPlanningHorizon = extractPlanningHorizon(wizard.text);
        const extractedStartYear = extractStartYear(wizard.text);

        wizard.setBudgetPlanningHorizon(extractedPlanningHorizon);
        wizard.setBudgetStartYear(extractedStartYear);

        setIsAnalyzing(true);
        try {
          const res = await fetch('/api/budget-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              history: [],
              message: 'Analysiere diesen Demand und erstelle eine CAPEX/OPEX Klassifizierung',
              demandDescription: wizard.text,
              budgetTable: [],
              forceReload: false
            })
          });
          const data = await res.json();
          console.log("Budget analysis response:", data);

          // Parse classification result and populate table
          if (data.gesamtschaetzung && data.opex && data.capex) {
            const newRows: BudgetTableRow[] = [];

            // Add OPEX rows
            if (data.opex.positionen && Array.isArray(data.opex.positionen)) {
              data.opex.positionen.forEach((pos: any, idx: number) => {
                newRows.push({
                  id: `opex-${idx}-${Date.now()}`,
                  kostentyp: 'OPEX',
                  beschreibung: pos.taetigkeit || '',
                  wert: pos.kosten?.toString() || '',
                  jahr: pos.jahr || extractedStartYear
                });
              });
            }

            // Add CAPEX rows
            if (data.capex.positionen && Array.isArray(data.capex.positionen)) {
              data.capex.positionen.forEach((pos: any, idx: number) => {
                newRows.push({
                  id: `capex-${idx}-${Date.now()}`,
                  kostentyp: 'CAPEX',
                  beschreibung: pos.taetigkeit || '',
                  wert: pos.kosten?.toString() || '',
                  jahr: pos.jahr || extractedStartYear
                });
              });
            }

            console.log("Populated budget table with", newRows.length, "rows");
            wizard.setBudgetTable(newRows);
          } else if (data.frage) {
            console.warn("LLM asked a question instead of classifying:", data.frage);
            alert(`Der Budget-Assistent benötigt mehr Informationen: ${data.frage}`);
          } else if (data.message) {
            console.warn("LLM returned unstructured text:", data.message);
            alert("Die automatische Klassifizierung konnte nicht durchgeführt werden. Bitte füllen Sie die Tabelle manuell aus.");
          } else {
            console.error("Unexpected API response format:", data);
            alert("Fehler bei der automatischen Klassifizierung. Bitte füllen Sie die Tabelle manuell aus.");
          }
        } catch (error) {
          console.error('Error analyzing demand:', error);
          alert("Fehler bei der automatischen Klassifizierung. Bitte füllen Sie die Tabelle manuell aus.");
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    analyzeAndPopulateTable();
  }, [wizard.text]);

  const handleNext = () => {
    router.push('/schritt/6');
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

  const handleReanalyze = async () => {
    // Extract updated planning parameters
    const extractedPlanningHorizon = extractPlanningHorizon(wizard.text);
    const extractedStartYear = extractStartYear(wizard.text);

    wizard.setBudgetPlanningHorizon(extractedPlanningHorizon);
    wizard.setBudgetStartYear(extractedStartYear);

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/budget-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [],
          message: 'Analysiere diesen Demand und erstelle eine CAPEX/OPEX Klassifizierung',
          demandDescription: wizard.text,
          budgetTable: [],
          forceReload: true
        })
      });
      const data = await res.json();
      console.log("Reanalysis response:", data);

      if (data.gesamtschaetzung && data.opex && data.capex) {
        const newRows: BudgetTableRow[] = [];

        if (data.opex.positionen && Array.isArray(data.opex.positionen)) {
          data.opex.positionen.forEach((pos: any, idx: number) => {
            newRows.push({
              id: `opex-${idx}-${Date.now()}`,
              kostentyp: 'OPEX',
              beschreibung: pos.taetigkeit || '',
              wert: pos.kosten?.toString() || '',
              jahr: pos.jahr || extractedStartYear
            });
          });
        }

        if (data.capex.positionen && Array.isArray(data.capex.positionen)) {
          data.capex.positionen.forEach((pos: any, idx: number) => {
            newRows.push({
              id: `capex-${idx}-${Date.now()}`,
              kostentyp: 'CAPEX',
              beschreibung: pos.taetigkeit || '',
              wert: pos.kosten?.toString() || '',
              jahr: pos.jahr || extractedStartYear
            });
          });
        }

        console.log("Re-populated budget table with", newRows.length, "rows");
        wizard.setBudgetTable(newRows);
      } else if (data.frage) {
        console.warn("LLM asked a question instead of classifying:", data.frage);
        alert(`Der Budget-Assistent benötigt mehr Informationen: ${data.frage}`);
      } else if (data.message) {
        console.warn("LLM returned unstructured text:", data.message);
        alert("Die automatische Klassifizierung konnte nicht durchgeführt werden. Bitte versuchen Sie es erneut.");
      } else {
        console.error("Unexpected API response format:", data);
        alert("Fehler bei der erneuten Klassifizierung. Bitte versuchen Sie es erneut.");
      }
    } catch (error) {
      console.error('Error reanalyzing demand:', error);
      alert("Fehler bei der erneuten Klassifizierung. Bitte versuchen Sie es erneut.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-grow overflow-hidden relative">
        {/* Left side - Demand Text and Budget Table */}
        <div className="p-8 overflow-y-auto bg-white" style={{ width: `${100 - sidebarWidth}%` }}>
          <h2 className="text-2xl font-semibold mb-6">Schritt 5: Budget-Analyse</h2>

          {/* Editable Demand Text */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Demand-Beschreibung
            </label>
            <textarea
              value={wizard.text}
              onChange={(e) => wizard.setText(e.target.value)}
              className="w-full p-3 border rounded-md text-sm min-h-[150px]"
              placeholder="Beschreiben Sie Ihren Demand..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Sie können die Beschreibung hier anpassen. Klicken Sie dann auf "Neu analysieren", um die Budget-Tabelle zu aktualisieren.
            </p>
          </div>

          {!mounted || isAnalyzing ? (
            <div className="text-center p-10">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">{!mounted ? 'Lade...' : 'Analysiere Demand...'}</p>
            </div>
          ) : (
            <>
              {/* Planning Horizon and Start Year Controls */}
              <div className="mb-6 p-4 bg-gray-50 border rounded-md">
                <h3 className="font-semibold mb-3">Budget-Parameter</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Startjahr
                    </label>
                    <select
                      value={wizard.budgetStartYear}
                      onChange={(e) => wizard.setBudgetStartYear(parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md"
                    >
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planungshorizont
                    </label>
                    <select
                      value={wizard.budgetPlanningHorizon}
                      onChange={(e) => wizard.setBudgetPlanningHorizon(parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value={3}>3 Jahre</option>
                      <option value={5}>5 Jahre</option>
                      <option value={7}>7 Jahre</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Diese Werte wurden aus Ihrer Demand-Beschreibung extrahiert und können angepasst werden.
                </p>
              </div>

              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-sm">
                <p className="font-semibold mb-2">Hinweis:</p>
                <p>Diese Tabelle wurde automatisch aus Ihrer Demand-Beschreibung generiert. Sie können alle Werte bearbeiten und Zeilen hinzufügen oder löschen.</p>
              </div>
              <EditableBudgetTable
                rows={wizard.budgetTable}
                onRowsChange={wizard.setBudgetTable}
                startYear={wizard.budgetStartYear}
                planningHorizon={wizard.budgetPlanningHorizon}
              />
              <button
                onClick={handleReanalyze}
                disabled={isAnalyzing}
                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
              >
                Neu analysieren
              </button>
            </>
          )}
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
          style={{ cursor: isResizing ? 'col-resize' : 'ew-resize' }}
        />

        {/* Right side - Budget Assistant Chat */}
        <aside className="p-8 bg-gray-100 overflow-y-auto" style={{ width: `${sidebarWidth}%` }}>
          <BudgetChat demand={{ description: wizard.text }} budgetTable={wizard.budgetTable} />
        </aside>
      </div>

      {/* Bottom navigation */}
      <div className="border-t p-4 flex justify-between items-center bg-white">
          <button
            onClick={() => router.back()}
            disabled={currentStep <= 1}
            className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 font-semibold"
          >
            Zurück
          </button>
          <button
            onClick={() => { wizard.reset(); router.push('/schritt/1'); }}
            className="px-8 py-3 bg-red-500 text-white rounded-lg font-semibold"
          >
            Sitzungsdaten löschen
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 font-semibold flex items-center"
          >
            {isLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div> : null}
            Weiter
          </button>
      </div>
    </div>
  );
}
