"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
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
  const [isLoading, setIsLoading] = useState(false);
  const currentStep = 3; // Hardcode currentStep for this page

  useEffect(() => {
    wizard.setStep(currentStep);
  }, [currentStep, wizard]);

  const fetchData = async (forceReload = false) => {
    if (!wizard.text) return;
    setIsLoading(true);
    try {
      const similarRes = await fetch('/api/find-similar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: wizard.text, forceReload }) });
      wizard.setSimilarProjects(await similarRes.json());
      const recommendRes = await fetch('/api/recommend-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ demandText: wizard.text, similarProjects: wizard.similarProjects, forceReload }) });
      wizard.setRecommendation(await recommendRes.json());
    } catch (error) { console.error(`Error fetching data for step ${currentStep}:`, error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, [wizard.text]);

  const handleNext = () => {
    router.push('/schritt/4');
  };

  const renderStepContent = () => {
    if (isLoading || !wizard.classification) return <div className="text-center p-10">Lade Klassifizierung...</div>;
    const radarChartData = { labels: Object.keys(wizard.classification || {}), datasets: [{ label: 'Strategische Relevanz', data: Object.values(wizard.classification || {}).map(v => scoreToNumber(v.score)), backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 1)' }] }; return <div className='h-full flex flex-col'><div className='relative flex-grow p-4 border rounded-lg'><Radar data={radarChartData} options={{ maintainAspectRatio: false, scales: { r: { suggestedMin: 0, suggestedMax: 3, ticks: { stepSize: 1, display: false } } } }} /></div></div>;
  };

  const renderCopilotContent = () => {
    if (isLoading || !wizard.classification) return <div className="text-center p-10">Lade Klassifizierung...</div>;
    return <><h2 className="text-2xl font-semibold mb-4">Schritt 3: Strategische Klassifizierung</h2><div><h3 className="text-lg font-semibold mb-4">Analyse der Ausrichtung</h3><ul className="space-y-4">{Object.entries(wizard.classification).map(([pillar, result]) => (<li key={pillar} className="p-3 bg-white rounded-md border"><p className="font-semibold">{pillar}: <span className="font-bold text-blue-600">{result.score}</span></p><p className="text-sm text-gray-600 mt-1">{result.begruendung}</p></li>))}</ul></div></>;
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
            <button onClick={() => fetchData(true)} disabled={isLoading} className="px-8 py-3 bg-yellow-500 text-white rounded-lg disabled:opacity-50 font-semibold">Force Reload</button>
            <button onClick={handleNext} disabled={isLoading} className="px-8 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 font-semibold flex items-center">{isLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div> : null} Weiter</button>
        </div>
      </div>
    </div>
  );
}
