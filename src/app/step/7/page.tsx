"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import { useI18n } from '../../../context/I18nContext';
import ReactMarkdown from 'react-markdown';

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const { t, locale } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const currentStep = 7; // Updated to step 7

  useEffect(() => {
    wizard.setStep(currentStep);
  }, [currentStep, wizard]);

  const fetchProposal = async (forceReload = false) => {
    if (!wizard.text || !wizard.classification || !wizard.recommendation) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ demandText: wizard.text, classification: wizard.classification, recommendation: wizard.recommendation, forceReload, locale }) });
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
    router.push('/step/1');
  };

  const projektTypIstProjekt = wizard.rating?.projekt_typ === 'Projekt';

  const renderStepContent = () => {
    if (!projektTypIstProjekt) {
      return <div className="text-center p-10 space-y-4">
        <div className="text-6xl">✅</div>
        <h2 className="text-2xl font-bold">{t.step7.noProposalRequired}</h2>
        <p className="text-gray-600">
          {t.step7.noProposalRequiredText.replace('{type}', wizard.rating?.projekt_typ || '')}
        </p>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          {t.step7.noProposalRequiredHint}
        </p>
      </div>;
    }

    if (isLoading || !wizard.proposal) return <div className="text-center p-10">{t.step7.loadingProposal}</div>;
    return <div className='h-full flex flex-col'><div className='flex-grow grid grid-cols-2 gap-4 h-full min-h-0'><div><h3 className='font-semibold mb-2'>{t.step7.preview}</h3><div className='prose prose-sm max-w-none p-4 border rounded-md h-full overflow-y-auto'><ReactMarkdown>{wizard.proposal.markdown}</ReactMarkdown></div></div><div><h3 className='font-semibold mb-2'>{t.step7.editor}</h3><textarea className='w-full h-full p-2 border rounded-md bg-gray-50' defaultValue={wizard.proposal.markdown} /></div></div></div>;
  };

  const renderCopilotContent = () => {
    if (!projektTypIstProjekt) {
      return (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t.step7.title}</h2>
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-800">{t.step7.summary}</h4>
            <p className="mt-2 text-sm text-blue-700">
              {t.step7.summaryText}
            </p>
          </div>
        </>
      );
    }

    if (isLoading || !wizard.proposal) return <div className="text-center p-10">{t.step7.loadingProposal}</div>;
    return (
      <>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t.step7.title}</h2>
        <div className="p-4 bg-green-50 border-l-4 border-green-500">
          <h4 className="font-semibold text-green-800">{t.step7.almostDone}</h4>
          <p className="mt-2 text-sm text-green-700">
            {t.step7.almostDoneText}
          </p>
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
              <button onClick={() => fetchProposal(true)} disabled={isLoading} className="px-6 py-2.5 text-sm bg-yellow-500 text-white rounded-lg disabled:opacity-50 font-semibold w-full sm:w-auto">{t.common.forceReload}</button>
            </div>
            <button onClick={handleNext} disabled={isLoading} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold flex justify-center items-center w-full sm:w-auto order-1 sm:order-2">{t.step7.newDemand}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
