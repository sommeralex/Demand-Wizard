"use client";

import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import { useParams } from 'next/navigation';

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const params = useParams();
  const currentStep = parseInt(params.step as string, 10);

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-3 flex-grow overflow-hidden">
        <div className="col-span-2 p-8 overflow-y-auto">
            <div className="text-center p-10">Ungültiger Schritt.</div>
        </div>
        <aside className="col-span-1 p-8 bg-gray-100 border-l overflow-y-auto">
            <div className="text-center p-10">Ungültiger Schritt.</div>
        </aside>
        <div className="col-span-3 border-t p-4 flex justify-between items-center bg-white">
            <button onClick={() => router.back()} disabled={currentStep <= 1} className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 font-semibold">Zurück</button>
            <button onClick={() => { wizard.reset(); router.push('/schritt/1'); }} className="px-8 py-3 bg-red-500 text-white rounded-lg font-semibold">Sitzungsdaten löschen</button>
            <button onClick={() => { wizard.reset(); router.push('/schritt/1'); }} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold">Neues Demand starten</button>
        </div>
      </div>
    </div>
  );
}
