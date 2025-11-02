"use client";

import { useWizard } from '../context/WizardContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const steps = [
  { number: 1, title: 'Idee beschreiben' },
  { number: 2, title: 'Qualität bewerten' },
  { number: 3, title: 'Strategie-Check' },
  { number: 4, title: 'Portfolio-Analyse' },
  { number: 5, title: 'Budget' },
  { number: 6, title: 'Antrag erstellen' },
  // Step 6 will be added later
];

export const Stepper = () => {
  const { step: currentStep } = useWizard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering dynamic content on server
  if (!mounted) {
    return (
      <nav className="p-4 border-b bg-gray-50 h-20">
        <ol className="flex items-center justify-center space-x-4">
          {steps.map((step) => (
            <li key={step.number} className="flex items-center">
              <Link href={`/schritt/${step.number}`} className={`flex flex-col items-center text-center`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-gray-400">
                  {step.number}
                </div>
                <span className="mt-2 text-xs font-semibold text-gray-600">
                  {step.title}
                </span>
              </Link>
              {step.number < steps.length && <div className="w-12 h-px bg-gray-300 mx-4" />}
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <nav className="p-4 border-b bg-gray-50 h-20">
      <ol className="flex items-center justify-center space-x-4">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <li key={step.number} className="flex items-center">
              <Link href={`/schritt/${step.number}`} className={`flex flex-col items-center text-center`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${isCompleted ? 'bg-green-600' : isCurrent ? 'bg-blue-600' : 'bg-gray-400'}`}>
                  {step.number}
                </div>
                <span className={`mt-2 text-xs font-semibold ${isCurrent ? 'text-blue-600' : 'text-gray-600'}`}>
                  {step.title}
                </span>
              </Link>
              {step.number < steps.length && <div className="w-12 h-px bg-gray-300 mx-4" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
