"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import { useI18n } from '../../../context/I18nContext';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import StepNavigation from '../../../components/StepNavigation';

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
  planningHorizon: number,
  t: any
}> = ({ rows, onRowsChange, startYear, planningHorizon, t }) => {
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
      alert(t.step5.yearExceedsHorizon.replace('{year}', newJahr).replace('{start}', startYear).replace('{end}', startYear + planningHorizon - 1));
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
      ? t.step5.confirmDeleteDetails
          .replace('{type}', rowToDelete.kostentyp)
          .replace('{description}', rowToDelete.beschreibung)
          .replace('{value}', rowToDelete.wert)
          .replace('{year}', rowToDelete.jahr)
      : t.step5.confirmDelete;

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
        <h3 className="text-xl font-semibold">{t.step5.capexOpexAnalysis}</h3>
        <button
          onClick={addRow}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {t.step5.addRow}
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.step5.year}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.step5.costType}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.step5.activityDescription}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.step5.value}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.step5.actions}
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
                    placeholder={t.step5.activityPlaceholder}
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={row.wert}
                    onChange={(e) => updateRow(row.id, 'wert', e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                    placeholder={t.step5.valuePlaceholder}
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyRow(row)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title={t.step5.copyRowTooltip}
                    >
                      {t.step5.copy}
                    </button>
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      {t.common.delete}
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
              <td className="px-4 py-3" colSpan={3}>{t.step5.opexTotal.replace('{years}', planningHorizon)}</td>
              <td className="px-4 py-3">{summary.opexSum.toLocaleString('de-DE')} EUR</td>
              <td></td>
            </tr>
            <tr className="bg-blue-50 text-xs">
              <td className="px-4 py-2" colSpan={3}>{t.step5.avgOpexPerYear}</td>
              <td className="px-4 py-2">{summary.avgOpexPerYear.toLocaleString('de-DE')} EUR</td>
              <td></td>
            </tr>
            <tr className="bg-green-100">
              <td className="px-4 py-3" colSpan={3}>{t.step5.capexTotal}</td>
              <td className="px-4 py-3">{summary.capexSum.toLocaleString('de-DE')} EUR</td>
              <td></td>
            </tr>
            <tr className="bg-gray-200">
              <td className="px-4 py-4" colSpan={3}>{t.step5.grandTotal}</td>
              <td className="px-4 py-4">{summary.total.toLocaleString('de-DE')} EUR</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const BudgetChat: React.FC<{ demand: any; budgetTable: BudgetTableRow[], t: any, locale: string }> = ({ demand, budgetTable, t, locale }) => {
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
                    forceReload,
                    locale
                })
            });

            // Check HTTP status
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }));
                console.error("Budget assistant API error (HTTP):", res.status, errorData);
                setMessages(prev => [...prev, {
                    role: 'model',
                    text: `❌ **Fehler (${res.status}):**\n\n${errorData.error || 'Der Server hat einen Fehler zurückgegeben.'}\n\n${errorData.details ? `**Details:** ${errorData.details}\n\n` : ''}Bitte versuche es erneut.`
                }]);
                return;
            }

            const data = await res.json();
            console.log("Budget assistant response:", data);

            // Handle error responses
            if (data.error) {
                console.error("Budget assistant error response:", data);
                let errorMessage = `❌ **Fehler:**\n\n${data.error}`;
                if (data.details) {
                    errorMessage += `\n\n**Details:** ${data.details}`;
                }
                if (data.rawResponse) {
                    errorMessage += `\n\n**Debug-Info:** ${data.rawResponse}`;
                }
                setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
                return;
            }

            // Handle successful responses
            if (data.message) {
                setMessages(prev => [...prev, { role: 'model', text: data.message }]);
            } else if (data.frage || data.experten_empfehlung) {
                setMessages(prev => [...prev, { role: 'model', text: data.frage || data.experten_empfehlung }]);
            } else if (data.gesamtschaetzung && data.opex && data.capex) {
                // This is a classification result - shouldn't happen in chat but handle it gracefully
                setMessages(prev => [...prev, {
                    role: 'model',
                    text: `Die Klassifizierung wurde erstellt:\n\n**Gesamtschätzung:** ${data.gesamtschaetzung}\n\n**OPEX:** ${data.opex.summe} EUR\n**CAPEX:** ${data.capex.summe} EUR`
                }]);
            } else {
                console.warn("Unexpected API response format:", data);
                setMessages(prev => [...prev, {
                    role: 'model',
                    text: `⚠️ **Unerwartete Antwort**\n\nDer Assistent hat eine Antwort in einem unerwarteten Format zurückgegeben.\n\n**Debug-Info:**\n\`\`\`json\n${JSON.stringify(data, null, 2).substring(0, 300)}\n\`\`\`\n\nBitte versuche es erneut oder formuliere deine Frage anders.`
                }]);
            }
        } catch (error) {
            console.error("Budget assistant API error (exception):", error);
            setMessages(prev => [...prev, {
                role: 'model',
                text: `❌ **Verbindungsfehler:**\n\nEs gab ein Problem bei der Kommunikation mit dem Assistenten.\n\n**Fehler:** ${error instanceof Error ? error.message : 'Unbekannter Fehler'}\n\nBitte überprüfe deine Internetverbindung und versuche es erneut.`
            }]);
        }
        finally { setIsLoading(false); }
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-lg shadow-md border">
            <div className="p-4 border-b bg-gray-50">
                <h2 className="text-xl font-semibold">{t.step5.budgetAssistant}</h2>
                <p className="text-sm text-gray-600 mt-1">
                    {t.step5.budgetAssistantDesc}
                </p>
            </div>

            <div className="flex-grow p-6 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 p-4">
                        <p>{t.step5.budgetAssistantWelcome}</p>
                        <p className="text-sm mt-2">{t.step5.budgetAssistantHelp}</p>
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
                            <span className="italic">{t.step5.writing}</span>
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
                        placeholder={t.step5.yourQuestion}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
                    >
                        {t.step5.send}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const { t, locale } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const currentStep = 5;

  useEffect(() => {
    setMounted(true);
    // Check if screen is large on mount
    setIsLargeScreen(window.innerWidth >= 1024);

    // Add resize listener
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);

    if (wizard) {
      wizard.setStep(currentStep);
    }

    return () => window.removeEventListener('resize', handleResize);
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
              message: locale === 'en' ? 'Analyze this demand and create a CAPEX/OPEX classification' : 'Analysiere diesen Demand und erstelle eine CAPEX/OPEX Klassifizierung',
              demandDescription: wizard.text,
              budgetTable: [],
              forceReload: false,
              locale
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
            alert("Die automatische Klassifizierung konnte nicht durchgeführt werden. Bitte fülle die Tabelle manuell aus.");
          } else {
alert("Fehler bei der automatischen Klassifizierung. Bitte fülle die Tabelle manuell aus.");
          }
        } catch (error) {
          console.error('Error analyzing demand:', error);
          alert("Fehler bei der automatischen Klassifizierung. Bitte fülle die Tabelle manuell aus.");
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    analyzeAndPopulateTable();
  }, [wizard.text]);

  const handleNext = () => {
    router.push('/step/6');
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
          message: locale === 'en' ? 'Analyze this demand and create a CAPEX/OPEX classification' : 'Analysiere diesen Demand und erstelle eine CAPEX/OPEX Klassifizierung',
          demandDescription: wizard.text,
          budgetTable: [],
          forceReload: true,
          locale
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
        alert("Die automatische Klassifizierung konnte nicht durchgeführt werden. Bitte versuche es erneut.");
      } else {
        console.error("Unexpected API response format:", data);
        alert("Fehler bei der erneuten Klassifizierung. Bitte versuche es erneut.");
      }
    } catch (error) {
      console.error('Error reanalyzing demand:', error);
      alert("Fehler bei der erneuten Klassifizierung. Bitte versuche es erneut.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen lg:h-full">
      <div className="flex flex-col lg:flex-row lg:flex-grow lg:overflow-hidden relative">
        {/* Left side - Demand Text and Budget Table */}
        <div className="p-4 md:p-8 lg:overflow-y-auto bg-white lg:w-auto" style={{ width: isLargeScreen ? `${100 - sidebarWidth}%` : '100%' }}>
          <h2 className="text-2xl font-semibold mb-6">{t.step5.title}</h2>

          {/* Editable Demand Text */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.step5.demandDescription}
            </label>
            <textarea
              value={wizard.text}
              onChange={(e) => wizard.setText(e.target.value)}
              className="w-full p-3 border rounded-md text-sm min-h-[150px]"
              placeholder={t.step5.demandPlaceholder}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t.step5.demandHint}
            </p>
          </div>

          {!mounted || isAnalyzing ? (
            <div className="text-center p-10">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">{!mounted ? t.common.loading : t.step5.analyzing}</p>
            </div>
          ) : (
            <>
              {/* Planning Horizon and Start Year Controls */}
              <div className="mb-6 p-4 bg-gray-50 border rounded-md">
                <h3 className="font-semibold mb-3">{t.step5.budgetParameters}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.step5.startYear}
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
                      {t.step5.planningHorizon}
                    </label>
                    <select
                      value={wizard.budgetPlanningHorizon}
                      onChange={(e) => wizard.setBudgetPlanningHorizon(parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value={3}>3 {t.step5.years}</option>
                      <option value={5}>5 {t.step5.years}</option>
                      <option value={7}>7 {t.step5.years}</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t.step5.parametersHint}
                </p>
              </div>

              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-sm">
                <p className="font-semibold mb-2">{t.step5.hintLabel}</p>
                <p>{t.step5.tableHint}</p>
              </div>
              <EditableBudgetTable
                rows={wizard.budgetTable}
                onRowsChange={wizard.setBudgetTable}
                startYear={wizard.budgetStartYear}
                planningHorizon={wizard.budgetPlanningHorizon}
                t={t}
              />
              <button
                onClick={handleReanalyze}
                disabled={isAnalyzing}
                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
              >
                {t.step5.reanalyze}
              </button>
            </>
          )}
        </div>

        {/* Resize Handle - Hidden on mobile */}
        <div
          className="hidden lg:block w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
          style={{ cursor: isResizing ? 'col-resize' : 'ew-resize' }}
        />

        {/* Right side - Budget Assistant Chat */}
        <aside className="hidden lg:block p-4 md:p-8 bg-gray-100 lg:overflow-y-auto lg:w-auto" style={{ width: isLargeScreen ? `${sidebarWidth}%` : '100%' }}>
          <BudgetChat demand={{ description: wizard.text }} budgetTable={wizard.budgetTable} t={t} locale={locale} />
        </aside>
      </div>

      {/* Bottom navigation */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={7}
        onNext={handleNext}
        onBack={() => router.back()}
        isNextDisabled={false}
        isLoading={isLoading}
        developerTools={
          <>
            <button
              onClick={() => { wizard.reset(); router.push('/step/1'); }}
              className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold text-sm"
            >
              {t.common.deleteSessionData}
            </button>
            <button
              onClick={handleReanalyze}
              disabled={isAnalyzing}
              className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg disabled:opacity-50 font-semibold text-sm"
            >
              {t.common.forceReload}
            </button>
          </>
        }
        t={t}
      />
    </div>
  );
}
