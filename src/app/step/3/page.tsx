"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import { useI18n } from '../../../context/I18nContext';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const scoreToNumber = (score: string) => ({ 'hoch': 3, 'mittel': 2, 'gering': 1 }[score?.toLowerCase()] || 0);

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const { t, locale } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const currentStep = 3; // Hardcode currentStep for this page

  useEffect(() => {
    wizard.setStep(currentStep);
  }, [currentStep, wizard]);

  const fetchData = async (forceReload = false) => {
    if (!wizard.text) return;
    setIsLoading(true);
    try {
      // Load classification if not already loaded
      if (!wizard.classification || forceReload) {
        const classifyRes = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: wizard.text, locale })
        });
        const classifyData = await classifyRes.json();

        // Check if there's an error or valid classification
        if (classifyData.error || classifyData.error_message) {
          wizard.setClassification(classifyData);
        } else {
          wizard.setClassification(classifyData.strategische_ausrichtung);
        }
      }

      const similarRes = await fetch('/api/find-similar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: wizard.text, forceReload, locale }) });
      wizard.setSimilarProjects(await similarRes.json());
      const recommendRes = await fetch('/api/recommend-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ demandText: wizard.text, similarProjects: wizard.similarProjects, forceReload, locale }) });
      wizard.setRecommendation(await recommendRes.json());
    } catch (error) { console.error(`Error fetching data for step ${currentStep}:`, error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, [wizard.text]);

  const handleNext = () => {
    router.push('/step/4');
  };

  const renderStepContent = () => {
    if (isLoading || !wizard.classification) {
      return <div className="text-center p-10">{t.step3.loading}</div>;
    }

    // Check if classification returned an error (too vague description)
    const classificationData = wizard.classification as any;

    if (classificationData.error || classificationData.error_message) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg max-w-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-yellow-800">{t.step3.classificationNotPossible}</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  {classificationData.error_message || t.step3.tooVagueDescription}
                </p>
                <p className="mt-3 text-sm text-yellow-700">
                  💡 <strong>{t.step3.hint}:</strong> {t.step3.tipGoBack}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const radarChartData = {
      labels: Object.keys(wizard.classification || {}),
      datasets: [{
        label: t.step3.strategicRelevance,
        data: Object.values(wizard.classification || {}).map(v => scoreToNumber(v.score)),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)'
      }]
    };

    return (
      <div className='h-full flex flex-col'>
        <div className='relative flex-grow p-4 border rounded-lg'>
          <Radar
            data={radarChartData}
            options={{
              maintainAspectRatio: false,
              scales: {
                r: {
                  suggestedMin: 0,
                  suggestedMax: 3,
                  ticks: {
                    stepSize: 1,
                    display: false
                  }
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  const renderCopilotContent = () => {
    if (isLoading || !wizard.classification) return <div className="text-center p-10">{t.step3.loading}</div>;

    // Check if classification returned an error
    const classificationData = wizard.classification as any;
    if (classificationData.error || classificationData.error_message) {
      return (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t.step3.title}</h2>
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500">
            <h4 className="font-semibold text-yellow-800">{t.step3.hint}</h4>
            <p className="mt-2 text-sm text-yellow-700">
              {t.step3.notEnoughDetails}
            </p>
          </div>
        </>
      );
    }

    return (
      <>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t.step3.title}</h2>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">{t.step3.analysisTitle}</h3>
          <ul className="space-y-4">
            {Object.entries(wizard.classification).map(([pillar, result]) => (
              <li key={pillar} className="p-3 bg-white rounded-md border">
                <p className="font-semibold">
                  {pillar}: <span className="font-bold text-blue-600">{result.score}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">{result.begruendung}</p>
              </li>
            ))}
          </ul>
        </div>
      </>
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
              <button onClick={() => router.back()} disabled={currentStep <= 1} className="px-6 py-2.5 text-sm bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 font-semibold w-full sm:w-auto">{t.common.back}</button>
              <button onClick={() => { wizard.reset(); router.push('/step/1'); }} className="px-6 py-2.5 text-sm bg-red-500 text-white rounded-lg font-semibold w-full sm:w-auto">{t.common.delete}</button>
              <button onClick={() => fetchData(true)} disabled={isLoading} className="px-6 py-2.5 text-sm bg-yellow-500 text-white rounded-lg disabled:opacity-50 font-semibold w-full sm:w-auto">{t.common.forceReload}</button>
            </div>
            <button onClick={handleNext} disabled={isLoading} className="px-8 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 font-semibold flex justify-center items-center w-full sm:w-auto order-1 sm:order-2">{isLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div> : null} {t.common.next}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
