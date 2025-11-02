"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import { GOOD_EXAMPLE_TEXT, BAD_EXAMPLE_TEXT } from '../../../data/examples';
import { DeleteApiCacheButton } from '../../components/DeleteApiCacheButton';

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecklistLoading, setIsChecklistLoading] = useState(false);
  const [lastAnalyzedText, setLastAnalyzedText] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [forceReload, setForceReload] = useState(false);
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
      wizard.setChecklistItems(items => items.map(item => ({ ...item, checked: false })));
      setIsChecklistLoading(false);
      return;
    }
    setIsChecklistLoading(true);
    try {
      const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: inputText, forceReload: reload }) });
      if (!response.ok) throw new Error('Checklist API call failed');
      const analysis = await response.json();
      if (analysis.error) {
        alert(`Error analyzing text: ${analysis.details || analysis.error}`);
        setIsChecklistLoading(false);
        return;
      }
      wizard.setChecklistItems(prevItems => prevItems.map(item => ({ ...item, checked: !!analysis[item.id] })))
      setLastAnalyzedText(inputText); // Update lastAnalyzedText on successful analysis
    } catch (error) { console.error("Failed to analyze text:", error); alert("Failed to analyze text. Please try again."); } 
    finally { setIsLoading(false); setForceReload(false); }
  }, [wizard]);

  const debouncedAnalyzeText = useCallback(debounce(analyzeTextForChecklist, 1000), [debounce, analyzeTextForChecklist]);

  useEffect(() => {
    if (wizard.text && wizard.text !== lastAnalyzedText) {
        debouncedAnalyzeText(wizard.text);
    }
  }, [wizard.text, debouncedAnalyzeText, lastAnalyzedText]);

  useEffect(() => {
    wizard.setStep(currentStep);
  }, [currentStep, wizard]);

  const handleNext = async (reload: boolean = false) => {
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
    return <div><textarea rows={20} className="w-full p-4 border rounded-md" value={wizard.text} onChange={(e) => wizard.setText(e.target.value)} placeholder="Beschreiben Sie hier Ihr Problem, Ihr Ziel oder Ihre Idee..." /><div className="mt-4 flex space-x-2"><button onClick={() => wizard.setText(GOOD_EXAMPLE_TEXT)} className="px-4 py-2 bg-gray-100 rounded-md border text-sm">Gutes Beispiel</button><button onClick={() => wizard.setText(BAD_EXAMPLE_TEXT)} className="px-4 py-2 bg-gray-100 rounded-md border text-sm">Schlechtes Beispiel</button></div></div>;
  };

  const renderCopilotContent = () => {
    return <div><h2 className="text-2xl font-semibold mb-4">Schritt 1: Beschreiben Sie Ihre Idee</h2><h3 className="text-lg font-semibold mb-4">Anforderungs-Checkliste</h3>{isChecklistLoading && <p>Analysiere...</p>}{mounted && <ul className="space-y-3">{wizard.checklistItems.map((item) => (<li key={item.id} className="flex items-center"><svg className={`w-5 h-5 mr-3 ${item.checked ? "text-green-500" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>{item.text}</li>))}</ul>}</div>;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-3 flex-grow overflow-hidden">
        <div className="col-span-2 p-8 overflow-y-auto">
            {renderStepContent()}
        </div>
        <aside className="col-span-1 p-8 bg-gray-100 border-l overflow-y-auto">
            {renderCopilotContent()}
        </aside>
        <div className="col-span-3 border-t p-4 flex justify-between items-center bg-white">
            <button onClick={() => router.back()} disabled={currentStep <= 1} className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 font-semibold">Zurück</button>
            <button onClick={() => { wizard.reset(); router.push('/schritt/1'); }} className="px-8 py-3 bg-red-500 text-white rounded-lg font-semibold">Sitzungsdaten löschen</button>
            <DeleteApiCacheButton />
            <button
              onClick={() => {
                setForceReload(true);
                analyzeTextForChecklist(wizard.text, true);
                handleNext(true);
              }}
              className="px-8 py-3 bg-purple-500 text-white rounded-lg font-semibold"
            >
              Force Reload
            </button>
            {currentStep < 6 ? <button onClick={() => handleNext()} disabled={!mounted || isLoading || (currentStep === 1 && !wizard.text)} className="px-8 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 font-semibold flex items-center">{isLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div> : null} Weiter</button> : <button onClick={() => { wizard.reset(); router.push('/schritt/1'); }} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold">Neues Demand starten</button>}
        </div>
      </div>
    </div>
  );
}
