"use client";

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  nextButtonTitle?: string;
  actionButtons?: ReactNode; // Custom action buttons for specific steps (e.g., Analyze button)
  developerTools?: ReactNode; // Developer-specific tools
  t: any; // Translation object
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isNextDisabled = false,
  isLoading = false,
  nextButtonTitle,
  actionButtons,
  developerTools,
  t,
}: StepNavigationProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="border-t p-4 bg-white">
      {/* Main Navigation (User Actions) */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={handleBack}
            disabled={currentStep <= 1}
            className="px-6 py-2.5 text-sm bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 font-semibold"
          >
            {t.common.back}
          </button>
          {actionButtons}
        </div>

        <button
          onClick={() => onNext()}
          disabled={isNextDisabled || isLoading}
          className="px-8 py-3 bg-[#005A9C] text-white rounded-lg hover:bg-[#004A7C] disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center w-full sm:w-auto transition-colors"
          title={nextButtonTitle}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
          ) : null}
          {currentStep === totalSteps ? t.step7.newDemand : t.common.next}
        </button>
      </div>

      {/* Developer Tools (Collapsible) */}
      {developerTools && (
        <details className="mt-3 border-t pt-3">
          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 font-medium">
            Developer Tools
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {developerTools}
          </div>
        </details>
      )}
    </div>
  );
}
