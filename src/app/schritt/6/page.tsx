"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import ReactMarkdown from 'react-markdown';

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const [isLoading, setIsLoading] = useState(false);
  const currentStep = 6; // Hardcode currentStep for this page

  useEffect(() => {
    wizard.setStep(currentStep);
  }, [currentStep, wizard]);

  const fetchProposal = async (forceReload = false) => {
    if (!wizard.text || !wizard.classification || !wizard.recommendation) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ demandText: wizard.text, classification: wizard.classification, recommendation: wizard.recommendation, forceReload }) });
      wizard.setProposal(await res.json());
    } catch (error) { console.error(`Error fetching proposal for step ${currentStep}:`, error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchProposal();
  }, [wizard.text, wizard.classification, wizard.recommendation]);

  const handleNext = () => {
    // No next step, so we just reset the wizard
    wizard.reset();
    router.push('/schritt/1');
  };

  const renderStepContent = () => {
    if (isLoading || !wizard.proposal) return <div className="text-center p-10">Lade Antrag...</div>;
    return <div className='h-full flex flex-col'><div className='flex-grow grid grid-cols-2 gap-4 h-full min-h-0'><div><h3 className='font-semibold mb-2'>Vorschau</h3><div className='prose prose-sm max-w-none p-4 border rounded-md h-full overflow-y-auto'><ReactMarkdown>{wizard.proposal.markdown}</ReactMarkdown></div></div><div><h3 className='font-semibold mb-2'>Editor (Markdown)</h3><textarea className='w-full h-full p-2 border rounded-md bg-gray-50' defaultValue={wizard.proposal.markdown} /></div></div></div>;
  };

  const renderCopilotContent = () => {
    if (isLoading || !wizard.proposal) return <div className="text-center p-10">Lade Antrag...</div>;
    return <><h2 className="text-2xl font-semibold mb-4">Schritt 6: Projektantrag</h2><div className="p-4 bg-green-50 border-l-4 border-green-500"><h4 className="font-semibold">Fast geschafft!</h4><p className="mt-2 text-sm">Überprüfen Sie den generierten Antrag. Sie können den Markdown-Text auf der linken Seite kopieren oder bei Bedarf anpassen.</p></div></>;
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
            <button onClick={() => fetchProposal(true)} disabled={isLoading} className="px-8 py-3 bg-yellow-500 text-white rounded-lg disabled:opacity-50 font-semibold">Force Reload</button>
            <button onClick={handleNext} disabled={isLoading} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold">Neues Demand starten</button>
        </div>
      </div>
    </div>
  );
}
