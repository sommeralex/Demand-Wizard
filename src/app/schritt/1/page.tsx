"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard, type ChecklistItem } from '../../context/WizardContext';
import { BAD_EXAMPLE_TEXT, MODERATE_EXAMPLE_TEXT, COMPLETE_EXAMPLE_TEXT } from '../../../data/examples';
import { DeleteApiCacheButton } from '../../components/DeleteApiCacheButton';
import { DEMAND_DESCRIPTION_HINTS, DEMAND_DESCRIPTION_HINT_SHORT } from '../../../lib/ui_hints';
import { ExplanationBox } from '../../components/ExplanationBox';

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecklistLoading, setIsChecklistLoading] = useState(false);
  const [lastAnalyzedText, setLastAnalyzedText] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [forceReload, setForceReload] = useState(false);
  const [dynamicAnalysisEnabled, setDynamicAnalysisEnabled] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState(false); // Track if text changed during analysis
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const currentStep = 1; // Hardcode currentStep for this page

  useEffect(() => {
    setMounted(true);
  }, []);

  const debounce = useCallback(<F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (...args: F extends (...args: infer P) => any ? P : never) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { func(...args); }, delay);
    };
  }, []);

  const analyzeTextForChecklist = useCallback(async (inputText: string, reload: boolean = false) => {
    if (inputText.trim().length < 20) {
      wizard.setChecklistItems(items => items.map((item: ChecklistItem) => ({ ...item, checked: false })));
      setIsChecklistLoading(false);
      setPendingAnalysis(false);
      return;
    }

    // Don't start new analysis if one is already running
    if (isChecklistLoading && !reload) {
      setPendingAnalysis(true); // Mark that we need to run analysis again after current one finishes
      return;
    }

    // Reset checklist items when analysis starts
    wizard.setChecklistItems(items => items.map((item: ChecklistItem) => ({ ...item, checked: false })));
    setIsChecklistLoading(true);
    setPendingAnalysis(false);

    try {
      const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: inputText, forceReload: reload }) });
      if (!response.ok) throw new Error('Checklist API call failed');
      const analysis = await response.json();
      if (analysis.error) {
        alert(`Error analyzing text: ${analysis.details || analysis.error}`);
        setIsChecklistLoading(false);
        setPendingAnalysis(false);
        return;
      }
      wizard.setChecklistItems(prevItems => prevItems.map((item: ChecklistItem) => ({ ...item, checked: !!analysis[item.id] })))
      setLastAnalyzedText(inputText); // Update lastAnalyzedText on successful analysis
    } catch (error) {
      console.error("Failed to analyze text:", error);
      alert("Failed to analyze text. Please try again.");
    }
    finally {
      setIsChecklistLoading(false);
      setForceReload(false);

      // If text changed during analysis, run again
      if (pendingAnalysis && wizard.text !== inputText) {
        setPendingAnalysis(false);
        setTimeout(() => analyzeTextForChecklist(wizard.text, false), 100);
      }
    }
  }, [wizard, isChecklistLoading, pendingAnalysis]);

  const debouncedAnalyzeText = useCallback(debounce(analyzeTextForChecklist, 1000), [debounce, analyzeTextForChecklist]);

  useEffect(() => {
    // Only run automatic analysis if dynamic analysis is enabled
    if (dynamicAnalysisEnabled && wizard.text && wizard.text !== lastAnalyzedText) {
        debouncedAnalyzeText(wizard.text);
    }
  }, [wizard.text, debouncedAnalyzeText, lastAnalyzedText, dynamicAnalysisEnabled]);

  useEffect(() => {
    wizard.setStep(currentStep);
  }, [currentStep, wizard]);

  const handleNext = async (reload: boolean = false) => {
    if (!wizard.text.trim()) {
      setShowInfoPopup(true);
      return;
    }
    setIsLoading(true);
    try {
      if (wizard.text === lastAnalyzedText && wizard.rating && !reload) {
        // If text hasn't changed and rating is already available, skip API call
        router.push('/schritt/2');
      } else {
        const res = await fetch('/api/rate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: wizard.text, forceReload: reload }) });
        if (!res.ok) throw new Error('Rating API call failed');
        const rating = await res.json();
        if (rating.error) {
          alert(`Error rating text: ${rating.details || rating.error}`);
          setIsLoading(false);
          return;
        }
        wizard.setRating(rating);
        setLastAnalyzedText(wizard.text); // Update lastAnalyzedText after successful rating
        router.push('/schritt/2');
      }
    } catch (error) { console.error(`Error progressing from step ${currentStep}:`, error); alert("Failed to rate text. Please try again."); }
    finally { setIsLoading(false); setForceReload(false); }
  };

  const renderStepContent = () => {
    if (isLoading && wizard.step !== currentStep) return <div className="text-center p-10">Lade nächsten Schritt...</div>;
    return <div><textarea rows={15} className="w-full p-4 border rounded-md text-gray-700 placeholder:text-gray-400" value={wizard.text} onChange={(e) => wizard.setText(e.target.value)} placeholder={DEMAND_DESCRIPTION_HINT_SHORT} /><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => wizard.setText(BAD_EXAMPLE_TEXT)} className="px-4 py-2 bg-red-50 text-red-700 border border-red-300 rounded-md text-sm hover:bg-red-100">❌ Schlechtes Beispiel</button><button onClick={() => wizard.setText(MODERATE_EXAMPLE_TEXT)} className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-md text-sm hover:bg-yellow-100">⚠️ Moderates Beispiel</button><button onClick={() => wizard.setText(COMPLETE_EXAMPLE_TEXT)} className="px-4 py-2 bg-green-50 text-green-700 border border-green-300 rounded-md text-sm hover:bg-green-100">✅ Vollständiges Beispiel</button></div><div className="mt-6">
        <h3 className="text-md font-semibold text-gray-700 mb-3">Was gehört in eine gute Beschreibung?</h3>
        {DEMAND_DESCRIPTION_HINTS.map((hint, index) => (
          <ExplanationBox
            key={hint.id}
            title={hint.title}
            description={hint.description}
            example={hint.example}
            isOpen={index === 0} // Open the first item by default
          />
        ))}
      </div></div>;
  };

  const renderCopilotContent = () => {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Schritt 1: Beschreibe deine Idee</h2>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Deine Anforderungs-Checkliste</h3>
        {isChecklistLoading && <p className="text-gray-600">Analysiere...</p>}
        {mounted && (
          <ul className="space-y-3">
            {wizard.checklistItems.map((item) => (
              <li key={item.id} className="flex items-start">
                <svg
                  className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${item.checked ? "text-green-500" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="flex-1 text-gray-700">{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen lg:h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:flex-grow lg:overflow-hidden">
        <div className="lg:col-span-2 p-4 md:p-8 lg:overflow-y-auto">
            {renderStepContent()}
        </div>
        {/* Mobile: Show copilot content below main content */}
        <div className="block lg:hidden p-4 md:p-8 bg-gray-50 border-t border-gray-200">
            {renderCopilotContent()}
        </div>
        {/* Desktop: Show copilot content in sidebar */}
        <aside className="hidden lg:block lg:col-span-1 p-4 md:p-8 bg-gray-50 border-l border-gray-200 lg:overflow-y-auto">
            {renderCopilotContent()}
        </aside>
        <div className="lg:col-span-3 border-t p-4 bg-white">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <div className="flex flex-col sm:flex-row gap-2 order-2 sm:order-1">
              <button onClick={() => { wizard.reset(); router.push('/schritt/1'); }} className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold text-sm w-full sm:w-auto">Sitzungsdaten löschen</button>
              <DeleteApiCacheButton />

              {/* Toggle Dynamic Analysis */}
              <button
                onClick={() => setDynamicAnalysisEnabled(!dynamicAnalysisEnabled)}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm w-full sm:w-auto ${
                  dynamicAnalysisEnabled
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {dynamicAnalysisEnabled ? '✓ Dynamische Analyse' : 'Dynamische Analyse'}
              </button>

              {/* Manual Analysis Button (only visible when dynamic analysis is off) */}
              {mounted && !dynamicAnalysisEnabled && (
                <button
                  onClick={() => {
                    setForceReload(true);
                    wizard.setChecklistItems(items => items.map((item: ChecklistItem) => ({ ...item, checked: false })));
                    analyzeTextForChecklist(wizard.text, true);
                  }}
                  disabled={isChecklistLoading || !wizard.text}
                  className="px-6 py-2.5 bg-purple-500 text-white rounded-lg disabled:opacity-50 font-semibold text-sm w-full sm:w-auto flex items-center justify-center"
                >
                  {isChecklistLoading ? (
                    <>
                      <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Analysiere...
                    </>
                  ) : (
                    'Analyse starten'
                  )}
                </button>
              )}
            </div>
            <div className="order-1 sm:order-2 relative">
              {currentStep < 6 ? <button onClick={() => handleNext()} disabled={!mounted || isLoading} className="px-8 py-3 bg-[#005A9C] text-white rounded hover:bg-[#004A7C] disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center w-full sm:w-auto transition-colors">{isLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div> : null} Weiter</button> : <button onClick={() => { wizard.reset(); router.push('/schritt/1'); }} className="px-8 py-3 bg-[#005A9C] text-white rounded hover:bg-[#004A7C] font-semibold w-full sm:w-auto transition-colors">Neues Demand starten</button>}
              {showInfoPopup && (
                <div className="absolute bottom-full right-0 mb-2 w-max max-w-sm p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg shadow-lg z-10"
                  role="alert"
                >
                  <div className="flex items-center justify-between">
                    <p>Bitte beschreiben Sie zuerst Ihre Idee, um fortzufahren.</p>
                    <button
                      onClick={() => setShowInfoPopup(false)}
                      className="ml-4 -mr-1 p-1 text-red-500 hover:text-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label="Schließen"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
