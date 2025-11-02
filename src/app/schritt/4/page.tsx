"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import CytoscapeComponent from 'react-cytoscapejs';

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const currentStep = 4;

  useEffect(() => {
    setMounted(true);
    wizard.setStep(currentStep);
  }, [currentStep, wizard]);

  const fetchData = async (forceReload = false) => {
    if (!wizard.text) return;
    setIsLoading(true);
    try {
      const similarRes = await fetch('/api/find-similar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: wizard.text, forceReload }) });
      const similarProjectsData = await similarRes.json();
      console.log("Similar projects data received:", similarProjectsData);
      wizard.setSimilarProjects(similarProjectsData);
      const recommendRes = await fetch('/api/recommend-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ demandText: wizard.text, similarProjects: wizard.similarProjects, forceReload }) });
      wizard.setRecommendation(await recommendRes.json());
    } catch (error) { console.error(`Error fetching data for step ${currentStep}:`, error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, [wizard.text]);

  const handleNext = () => {
    router.push('/schritt/5');
  };

  const renderStepContent = () => {
    if (!mounted || isLoading || !wizard.recommendation || !Array.isArray(wizard.similarProjects)) {
      return <div className="text-center p-10">Lade Analyse...</div>;
    }

    const graphElements = [
      { data: { id: 'new-demand', label: 'Ihre Idee', type: 'new' } },
      ...wizard.similarProjects.map(p => ({
        data: {
          id: p.id,
          label: `${p.id} (${p.similarity}%)`,
          type: p.similarity > 85 ? 'duplicate' : 'related'
        }
      })),
      ...wizard.similarProjects.map(p => ({
        data: { source: 'new-demand', target: p.id }
      }))
    ];

    const graphStylesheet = [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': '#1f2937',
          'font-size': '11px',
          'font-weight': 'bold',
          'background-color': '#FBBF24',
          'width': '80px',
          'height': '80px',
          'text-wrap': 'wrap',
          'text-max-width': '70px',
          'border-width': 2,
          'border-color': '#d97706'
        }
      },
      {
        selector: 'node[type="new"]',
        style: {
          'background-color': '#2563EB',
          'color': '#ffffff',
          'border-color': '#1d4ed8',
          'border-width': 3,
          'width': '100px',
          'height': '100px',
          'font-size': '13px',
          'text-outline-color': '#1e40af',
          'text-outline-width': 2
        }
      },
      {
        selector: 'node[type="duplicate"]',
        style: {
          'background-color': '#DC2626',
          'color': '#ffffff',
          'border-color': '#991b1b',
          'text-outline-color': '#7f1d1d',
          'text-outline-width': 1
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#9ca3af',
          'target-arrow-shape': 'triangle',
          'target-arrow-color': '#9ca3af',
          'curve-style': 'bezier'
        }
      }
    ];

    return (
      <div className='h-full flex flex-col'>
        <div className="w-full flex-grow border rounded-lg bg-gray-50">
          <CytoscapeComponent
            elements={graphElements}
            stylesheet={graphStylesheet}
            layout={{ name: 'cose' }}
            className="w-full h-full"
          />
        </div>
      </div>
    );
  };

  const renderCopilotContent = () => {
    if (isLoading || !wizard.recommendation) return <div className="text-center p-10">Lade Analyse...</div>;
    return <><h2 className="text-2xl font-semibold mb-4">Schritt 4: Abhängigkeits- & Duplikatsanalyse</h2><div className={`p-4 border-l-4 rounded-r-lg ${wizard.recommendation.empfehlung_aktion === 'MERGE' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}><h4 className="font-semibold">Empfehlung: {wizard.recommendation.empfehlung_aktion}</h4><p className="mt-2 text-sm">{wizard.recommendation.zusammenfassung_benutzer}</p></div></>;
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
