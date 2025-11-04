"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import StarRating from '../../components/StarRating';

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const currentStep = 2; // Hardcode currentStep for this page

  useEffect(() => {
    setMounted(true);
    wizard.setStep(currentStep);
  }, [currentStep, wizard]);

  const fetchRating = async (forceReload = false) => {
    if (!wizard.text) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: wizard.text, forceReload }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Rating data received:", data);
      wizard.setRating(data);
    } catch (error) {
      console.error("Error fetching rating:", error);
      wizard.setRating(null); // Reset rating on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRating();
  }, [wizard.text]);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/classify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: wizard.text }) });
      wizard.setClassification((await res.json()).strategische_ausrichtung);
      router.push('/schritt/3');
    } catch (error) { console.error(`Error progressing from step ${currentStep}:`, error); }
    finally { setIsLoading(false); }
  };

  const renderStepContent = () => {
    if (!mounted || isLoading || !wizard.rating || !wizard.rating.bewertung) return <div className="text-center p-10">Lade Bewertung...</div>;

    const getProjektTypColor = (typ?: string) => {
      if (typ === 'Linientätigkeit') return 'bg-green-50 border-green-500 text-green-700';
      if (typ === 'Maßnahme') return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      if (typ === 'Projekt') return 'bg-red-50 border-red-500 text-red-700';
      return 'bg-gray-50 border-gray-500 text-gray-700';
    };

    return <div className="space-y-6"><div className="p-6 bg-white rounded-lg shadow-md space-y-4"><div className='flex justify-between items-center'><span className="font-medium text-lg">Klarheit</span><StarRating score={wizard.rating.bewertung.klarheit} /></div><div className='flex justify-between items-center'><span className="font-medium text-lg">Vollständigkeit</span><StarRating score={wizard.rating.bewertung.vollstaendigkeit} /></div><div className='flex justify-between items-center'><span className="font-medium text-lg">Business Value</span><StarRating score={wizard.rating.bewertung.business_value} /></div></div>{wizard.rating.projekt_typ && <div className={`p-4 border-l-4 rounded ${getProjektTypColor(wizard.rating.projekt_typ)}`}><h3 className="font-semibold text-lg mb-2">Projekt Typ</h3><p className="text-2xl font-bold">{wizard.rating.projekt_typ}</p><p className="text-sm mt-2">{wizard.rating.projekt_typ === 'Linientätigkeit' ? 'Überschaubarer Aufwand, keine externen Kosten (< 5 Personentage)' : wizard.rating.projekt_typ === 'Maßnahme' ? 'Mittlerer Aufwand bis 10.000 EUR' : 'Hoher Aufwand > 10.000 EUR, erfordert Projektantrag'}</p></div>}</div>;
  };

  const renderCopilotContent = () => {
    if (!mounted || isLoading || !wizard.rating || !wizard.rating.feedback_text) return <div className="text-center p-10">Lade Bewertung...</div>;
    return <><h2 className="text-2xl font-semibold mb-4">Schritt 2: Qualitäts-Bewertung</h2><div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500"><h4 className="font-semibold">Feedback vom Copilot</h4><p className="mt-2 text-sm text-blue-700">{wizard.rating.feedback_text}</p></div></>;
  };

  return (
    <div className="flex flex-col min-h-screen lg:h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:flex-grow lg:overflow-hidden">
        <div className="lg:col-span-2 p-4 md:p-8 lg:overflow-y-auto">
            {renderStepContent()}
        </div>
        <aside className="hidden lg:block lg:col-span-1 p-4 md:p-8 bg-gray-100 border-l lg:overflow-y-auto">
            {renderCopilotContent()}
        </aside>
        <div className="lg:col-span-3 border-t p-4 bg-white">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <div className="flex flex-col sm:flex-row gap-2 order-2 sm:order-1">
              <button onClick={() => router.back()} disabled={currentStep <= 1} className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 font-semibold text-sm w-full sm:w-auto">Zurück</button>
              <button onClick={() => { wizard.reset(); router.push('/schritt/1'); }} className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold text-sm w-full sm:w-auto">Sitzungsdaten löschen</button>
              <button onClick={() => fetchRating(true)} disabled={isLoading} className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg disabled:opacity-50 font-semibold text-sm w-full sm:w-auto">Force Reload</button>
            </div>
            <button onClick={handleNext} disabled={isLoading} className="px-8 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 font-semibold flex items-center justify-center w-full sm:w-auto order-1 sm:order-2">{isLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div> : null} Weiter</button>
          </div>
        </div>
      </div>
    </div>
  );
}
