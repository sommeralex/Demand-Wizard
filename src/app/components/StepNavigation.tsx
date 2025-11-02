// src/app/components/StepNavigation.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useWizard } from '../context/WizardContext';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepNavigation({ currentStep, totalSteps }: StepNavigationProps) {
  const router = useRouter();
  const { reset } = useWizard();

  const handleStepClick = (stepNumber: number) => {
    router.push(`/schritt/${stepNumber}`);
  };

  const handleClearSession = () => {
    reset();
    router.push('/schritt/1');
  };

  return (
    <div className="p-4 bg-white border-b flex items-center justify-between">
      <div className="flex space-x-4">
        {[...Array(totalSteps)].map((_, index) => {
          const stepNumber = index + 1;
          return (
            <button
              key={stepNumber}
              onClick={() => handleStepClick(stepNumber)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                stepNumber === currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-500 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Schritt {stepNumber}
            </button>
          );
        })}
      </div>
      <button
        onClick={handleClearSession}
        className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600"
      >
        Sitzungsdaten löschen
      </button>
    </div>
  );
}
