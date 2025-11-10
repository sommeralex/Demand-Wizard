"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard, type ChecklistItem } from '../../context/WizardContext';
import { useI18n } from '../../../context/I18nContext';
import { DeleteApiCacheButton } from '../../components/DeleteApiCacheButton';
import StepNavigation from '../../../components/StepNavigation';
import { getHints, getPlaceholder } from '../../../lib/i18n/hints';
import { getChecklistItemDefinitions } from '../../../lib/i18n/checklistItems';
import { getBadExampleText, getModerateExampleText, getCompleteExampleText } from '../../../lib/i18n/examples';
import { ExplanationBox } from '../../components/ExplanationBox';

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const { t, locale } = useI18n();
  const hints = getHints(locale);
  const placeholder = getPlaceholder(locale);
  const checklistDefinitions = getChecklistItemDefinitions(locale);
  const badExampleText = getBadExampleText(locale);
  const moderateExampleText = getModerateExampleText(locale);
  const completeExampleText = getCompleteExampleText(locale);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecklistLoading, setIsChecklistLoading] = useState(false);
  const [lastAnalyzedText, setLastAnalyzedText] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [forceReload, setForceReload] = useState(false);
  const [dynamicAnalysisEnabled, setDynamicAnalysisEnabled] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState(false); // Track if text changed during analysis
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const currentStep = 1; // Hardcode currentStep for this page
  const prevLocaleRef = useRef<string>(locale);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update checklist item text when locale changes (preserving checked state)
  useEffect(() => {
    if (prevLocaleRef.current !== locale) {
      prevLocaleRef.current = locale;
      wizard.setChecklistItems(prevItems =>
        prevItems.map((item, index) => ({
          ...item,
          text: checklistDefinitions[index]?.text || item.text
        }))
      );
    }
  }, [locale, checklistDefinitions, wizard]);

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
      const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: inputText, forceReload: reload, locale }) });
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

  // Combined analysis function that runs both checklist and rating
  const runFullAnalysis = async (reload: boolean = false) => {
    if (!wizard.text.trim() || wizard.text.length < 20) {
      return;
    }

    setIsChecklistLoading(true);
    try {
      // Run both analyses in parallel
      const [checklistRes, ratingRes] = await Promise.all([
        fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: wizard.text, forceReload: reload, locale }) }),
        fetch('/api/rate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: wizard.text, forceReload: reload, locale }) })
      ]);

      if (!checklistRes.ok || !ratingRes.ok) {
        throw new Error('Analysis failed');
      }

      const [analysis, rating] = await Promise.all([
        checklistRes.json(),
        ratingRes.json()
      ]);

      // Handle checklist results
      if (analysis.error) {
        alert(`Error analyzing text: ${analysis.details || analysis.error}`);
      } else {
        wizard.setChecklistItems(prevItems => prevItems.map((item: ChecklistItem) => ({ ...item, checked: !!analysis[item.id] })));
      }

      // Handle rating results
      // Accept rating even if it has incomplete data warning, as long as it has the basic structure
      if (rating.error && rating.error !== 'Unvollständige Daten') {
        // Only show error for serious failures, not incomplete data
        alert(t.errors.ratingFailed);
      } else if (rating.bewertung && rating.projekt_typ) {
        // If we have the minimum required fields, accept it
        wizard.setRating(rating);
        setLastAnalyzedText(wizard.text);
      } else {
        // Truly incomplete - show error
        alert(t.errors.incompleteData);
      }
    } catch (error) {
      console.error("Failed to run full analysis:", error);
      alert(t.errors.ratingFailed);
    } finally {
      setIsChecklistLoading(false);
      setForceReload(false);
    }
  };

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
        router.push('/step/2');
      } else {
        const res = await fetch('/api/rate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: wizard.text, forceReload: reload, locale }) });
        if (!res.ok) throw new Error('Rating API call failed');
        const rating = await res.json();
        if (rating.error) {
          // Show translated error message based on error type
          const errorMessage = rating.error === 'Unvollständige Daten'
            ? t.errors.incompleteData
            : t.errors.ratingFailed;
          alert(errorMessage);
          setIsLoading(false);
          return;
        }
        wizard.setRating(rating);
        setLastAnalyzedText(wizard.text); // Update lastAnalyzedText after successful rating
        router.push('/step/2');
      }
    } catch (error) { console.error(`Error progressing from step ${currentStep}:`, error); alert(t.errors.ratingFailed); }
    finally { setIsLoading(false); setForceReload(false); }
  };

  const renderStepContent = () => {
    if (isLoading && wizard.step !== currentStep) return <div className="text-center p-10">{t.common.loading}</div>;
    return <div><textarea rows={15} className="w-full p-4 border rounded-md text-gray-700 placeholder:text-gray-400" value={wizard.text} onChange={(e) => wizard.setText(e.target.value)} placeholder={placeholder} /><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => wizard.setText(badExampleText)} className="px-4 py-2 bg-red-50 text-red-700 border border-red-300 rounded-md text-sm hover:bg-red-100">❌ {t.step1.badExample}</button><button onClick={() => wizard.setText(moderateExampleText)} className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-md text-sm hover:bg-yellow-100">⚠️ {t.step1.moderateExample}</button><button onClick={() => wizard.setText(completeExampleText)} className="px-4 py-2 bg-green-50 text-green-700 border border-green-300 rounded-md text-sm hover:bg-green-100">✅ {t.step1.completeExample}</button></div><div className="mt-6">
        <h3 className="text-md font-semibold text-gray-700 mb-3">{t.step1.whatBelongs}</h3>
        {hints.map((hint, index) => (
          <ExplanationBox
            key={hint.id}
            title={hint.title}
            description={hint.description}
            example={hint.example}
            isOpen={index === 0} // Open the first item by default
            locale={locale}
          />
        ))}
      </div></div>;
  };

  const renderCopilotContent = () => {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t.step1.title}</h2>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{t.step1.checklistTitle}</h3>
        {isChecklistLoading && <p className="text-gray-600">{t.step1.analyze}...</p>}
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
        <div className="lg:col-span-3">
          <StepNavigation
            currentStep={currentStep}
            totalSteps={7}
            onNext={handleNext}
            isNextDisabled={!mounted || !wizard.rating || wizard.text !== lastAnalyzedText}
            isLoading={isLoading}
            nextButtonTitle={wizard.text !== lastAnalyzedText ? (locale === 'en' ? 'Please analyze your text first' : 'Bitte analysiere zuerst deinen Text') : ''}
            actionButtons={
              mounted && !dynamicAnalysisEnabled ? (
                <button
                  onClick={() => {
                    setForceReload(true);
                    wizard.setChecklistItems(items => items.map((item: ChecklistItem) => ({ ...item, checked: false })));
                    runFullAnalysis(true);
                  }}
                  disabled={isChecklistLoading || !wizard.text}
                  className="px-6 py-2.5 bg-purple-500 text-white rounded-lg disabled:opacity-50 font-semibold text-sm flex items-center justify-center"
                >
                  {isChecklistLoading ? (
                    <>
                      <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      {t.step1.analyzing}
                    </>
                  ) : (
                    t.step1.manualAnalyze
                  )}
                </button>
              ) : null
            }
            developerTools={
              <>
                <button
                  onClick={() => { wizard.reset(); router.push('/step/1'); }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-xs"
                >
                  {t.common.delete}
                </button>
                <DeleteApiCacheButton />
                <button
                  onClick={() => setDynamicAnalysisEnabled(!dynamicAnalysisEnabled)}
                  className={`px-4 py-2 rounded-lg font-semibold text-xs ${
                    dynamicAnalysisEnabled
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {dynamicAnalysisEnabled ? t.step1.dynamicAnalysisActive : t.step1.dynamicAnalysis}
                </button>
              </>
            }
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
