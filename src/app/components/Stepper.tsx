"use client";

import { useWizard } from '../context/WizardContext';
import { useI18n } from '../../context/I18nContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export const Stepper = () => {
  const { step: currentStep, text } = useWizard();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  const steps = [
    { number: 1, title: t.stepper.step1 },
    { number: 2, title: t.stepper.step2 },
    { number: 3, title: t.stepper.step3 },
    { number: 4, title: t.stepper.step4 },
    { number: 5, title: t.stepper.step5 },
    { number: 6, title: t.stepper.step6 },
    { number: 7, title: t.stepper.step7 },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStepClick = (e: React.MouseEvent, stepNumber: number) => {
    if (stepNumber > 1 && !text) {
      e.preventDefault();
      alert(t.stepper.alertMessage);
    }
  };

  // Prevent hydration mismatch by not rendering dynamic content on server
  if (!mounted) {
    return (
      <nav className="p-2 md:p-4 border-b bg-gray-50">
            <ol className="flex flex-wrap items-center justify-center gap-4">
              {steps.map((step, index) => (
                <li key={step.number} className="flex items-center">
                  <Link href={`/step/${step.number}`} className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-gray-400 text-sm">
                      {step.number}
                    </div>
                    <span className="mt-1 text-xs font-semibold text-gray-600 md:block whitespace-nowrap">
                      {step.title}
                    </span>
                  </Link>
                  {index < steps.length - 1 && <div className="hidden md:block w-8 md:w-12 h-px bg-gray-300 mx-2 md:mx-4" />}
                </li>
              ))}
            </ol>
          </nav>    );
  }

  return (
    <nav className="p-2 md:p-4 border-b bg-gray-50">
      <ol className="flex flex-wrap items-center justify-center gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isEnabled = text || step.number === 1;

          return (
            <li key={step.number} className="flex items-center">
              <Link href={isEnabled ? `/step/${step.number}` : '#'}
                onClick={(e) => handleStepClick(e, step.number)}
                className={`flex flex-col items-center text-center ${!isEnabled ? 'cursor-not-allowed' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${!isEnabled ? 'bg-gray-300' : isCompleted ? 'bg-green-600' : isCurrent ? 'bg-slate-600' : 'bg-gray-400'}`}>
                  {step.number}
                </div>
                <span className={`mt-1 text-xs font-semibold md:block whitespace-nowrap ${!isEnabled ? 'text-gray-400' : isCurrent ? 'text-slate-600' : 'text-gray-600'}`}>
                  {step.title}
                </span>
              </Link>
              {index < steps.length - 1 && <div className="hidden md:block w-8 md:w-12 h-px bg-gray-300 mx-2 md:mx-4" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
