"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import { useI18n } from '../../../context/I18nContext';
import StarRating from '../../components/StarRating';
import StepNavigation from '../../../components/StepNavigation';

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const { t, locale } = useI18n();
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
        body: JSON.stringify({ text: wizard.text, forceReload, locale }),
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
      const res = await fetch('/api/classify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: wizard.text, locale }) });
      const data = await res.json();

      // Check if there's an error (too vague description) or valid classification
      if (data.error || data.error_message) {
        // Store the error as classification for Schritt 3 to display
        wizard.setClassification(data);
      } else {
        // Normal case: extract strategische_ausrichtung
        wizard.setClassification(data.strategische_ausrichtung);
      }

      router.push('/step/3');
    } catch (error) { console.error(`Error progressing from step ${currentStep}:`, error); }
    finally { setIsLoading(false); }
  };

  const renderStepContent = () => {
    if (!mounted || isLoading || !wizard.rating || !wizard.rating.bewertung) return <div className="text-center p-10">{t.step2.loading}</div>;

    const getProjektTypColor = (typ?: string) => {
      const typLower = typ?.toLowerCase() || '';
      if (typLower.includes('linien') || typLower.includes('line')) return 'bg-green-50 border-green-500 text-green-700';
      if (typLower.includes('maßnahme') || typLower.includes('measure')) return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      if (typLower.includes('projekt') || typLower.includes('project')) return 'bg-red-50 border-red-500 text-red-700';
      if (typLower.includes('unklar') || typLower.includes('unclear')) return 'bg-gray-50 border-gray-500 text-gray-700';
      return 'bg-gray-50 border-gray-500 text-gray-700';
    };

    // Calculate overall score (average of the 3 main criteria)
    const overallScore = Math.round(
      (wizard.rating.bewertung.klarheit +
       wizard.rating.bewertung.vollstaendigkeit +
       wizard.rating.bewertung.business_value) / 3
    );

    // Get smiley based on overall score
    const getSmiley = (score: number) => {
      if (score === 5) return { emoji: '😍', text: t.step2.smileyRatings.excellent, color: 'text-green-600' };
      if (score === 4) return { emoji: '😊', text: t.step2.smileyRatings.veryGood, color: 'text-green-500' };
      if (score === 3) return { emoji: '🙂', text: t.step2.smileyRatings.good, color: 'text-yellow-600' };
      if (score === 2) return { emoji: '😐', text: t.step2.smileyRatings.needsImprovement, color: 'text-orange-500' };
      return { emoji: '😟', text: t.step2.smileyRatings.poorQuality, color: 'text-red-500' };
    };

    const smiley = getSmiley(overallScore);

    return (
      <div className="space-y-6">
        {/* Gesamtscore mit Smiley */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md text-center">
          <div className="text-6xl mb-3">{smiley.emoji}</div>
          <h3 className={`text-2xl font-bold ${smiley.color}`}>{smiley.text}</h3>
          <p className="text-gray-600 mt-2">{t.step2.overallRating}: {overallScore} {t.step2.outOf5Stars}</p>
        </div>

        {/* Hauptbewertungen */}
        <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
          <h3 className="text-xl font-bold mb-4">{t.step2.yourDescriptionInDetail}</h3>
          <div className='flex justify-between items-center'>
            <span className="font-medium text-lg">{t.step2.clarity}</span>
            <StarRating score={wizard.rating.bewertung.klarheit} />
          </div>
          <div className='flex justify-between items-center'>
            <span className="font-medium text-lg">{t.step2.completeness}</span>
            <StarRating score={wizard.rating.bewertung.vollstaendigkeit} />
          </div>
          <div className='flex justify-between items-center'>
            <span className="font-medium text-lg">{t.step2.businessValue}</span>
            <StarRating score={wizard.rating.bewertung.business_value} />
          </div>
        </div>

        {/* Vorhaben-Typ */}
        {wizard.rating.projekt_typ && (
          <div className={`p-4 border-l-4 rounded ${getProjektTypColor(wizard.rating.projekt_typ)}`}>
            <h3 className="font-semibold text-lg mb-2">{t.step2.yourProject}</h3>
            <p className="text-2xl font-bold">{wizard.rating.projekt_typ}</p>
            {wizard.rating.projekt_typ_begruendung && (
              <p className="text-sm mt-2 italic">{wizard.rating.projekt_typ_begruendung}</p>
            )}
          </div>
        )}

        {/* Einzelbewertungen der 7 Kriterien */}
        {wizard.rating.einzelbewertungen && (
          <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
            <h3 className="text-xl font-bold mb-4">{t.step2.detailRatingOfCriteria}</h3>

            {wizard.rating.bewertung.problemstellung !== undefined && (
              <div className="border-b pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{t.step2.problemStatement}</span>
                  <StarRating score={wizard.rating.bewertung.problemstellung} />
                </div>
                {wizard.rating.einzelbewertungen.problemstellung_text && (
                  <p className="text-sm text-gray-600 mt-1">{wizard.rating.einzelbewertungen.problemstellung_text}</p>
                )}
              </div>
            )}

            {wizard.rating.bewertung.business_ziel !== undefined && (
              <div className="border-b pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{t.step2.businessGoal}</span>
                  <StarRating score={wizard.rating.bewertung.business_ziel} />
                </div>
                {wizard.rating.einzelbewertungen.business_ziel_text && (
                  <p className="text-sm text-gray-600 mt-1">{wizard.rating.einzelbewertungen.business_ziel_text}</p>
                )}
              </div>
            )}

            {wizard.rating.bewertung.benutzergruppe !== undefined && (
              <div className="border-b pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{t.step2.userGroup}</span>
                  <StarRating score={wizard.rating.bewertung.benutzergruppe} />
                </div>
                {wizard.rating.einzelbewertungen.benutzergruppe_text && (
                  <p className="text-sm text-gray-600 mt-1">{wizard.rating.einzelbewertungen.benutzergruppe_text}</p>
                )}
              </div>
            )}

            {wizard.rating.bewertung.budget_indikationen !== undefined && (
              <div className="border-b pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{t.step2.budgetIndications}</span>
                  <StarRating score={wizard.rating.bewertung.budget_indikationen} />
                </div>
                {wizard.rating.einzelbewertungen.budget_indikationen_text && (
                  <p className="text-sm text-gray-600 mt-1">{wizard.rating.einzelbewertungen.budget_indikationen_text}</p>
                )}
              </div>
            )}

            {wizard.rating.bewertung.interner_aufwand !== undefined && (
              <div className="border-b pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{t.step2.internalEffort}</span>
                  <StarRating score={wizard.rating.bewertung.interner_aufwand} />
                </div>
                {wizard.rating.einzelbewertungen.interner_aufwand_text && (
                  <p className="text-sm text-gray-600 mt-1">{wizard.rating.einzelbewertungen.interner_aufwand_text}</p>
                )}
              </div>
            )}

            {wizard.rating.bewertung.nutzen_indikationen !== undefined && (
              <div className="border-b pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{t.step2.benefitIndications}</span>
                  <StarRating score={wizard.rating.bewertung.nutzen_indikationen} />
                </div>
                {wizard.rating.einzelbewertungen.nutzen_indikationen_text && (
                  <p className="text-sm text-gray-600 mt-1">{wizard.rating.einzelbewertungen.nutzen_indikationen_text}</p>
                )}
              </div>
            )}

            {wizard.rating.bewertung.zeitplan !== undefined && (
              <div className="pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{t.step2.timeline}</span>
                  <StarRating score={wizard.rating.bewertung.zeitplan} />
                </div>
                {wizard.rating.einzelbewertungen.zeitplan_text && (
                  <p className="text-sm text-gray-600 mt-1">{wizard.rating.einzelbewertungen.zeitplan_text}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCopilotContent = () => {
    if (!mounted || isLoading || !wizard.rating || !wizard.rating.feedback_text) return <div className="text-center p-10">{t.step2.loading}</div>;
    return (
      <>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t.step2.title}</h2>
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500">
          <h4 className="font-semibold text-blue-800">{t.step2.feedbackTitle}</h4>
          <p className="mt-2 text-sm text-blue-700">{wizard.rating.feedback_text}</p>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen lg:h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:flex-grow lg:overflow-hidden">
        <div className="lg:col-span-2 p-4 md:p-8 lg:overflow-y-auto">
            {/* Mobile: Show step title */}
            <div className="block lg:hidden mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">{t.step2.title}</h2>
            </div>
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
        <div className="lg:col-span-3">
          <StepNavigation
            currentStep={currentStep}
            totalSteps={7}
            onNext={handleNext}
            onBack={() => router.back()}
            isNextDisabled={false}
            isLoading={isLoading}
            developerTools={
              <>
                <button
                  onClick={() => { wizard.reset(); router.push('/step/1'); }}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold text-sm"
                >
                  {t.common.deleteSessionData}
                </button>
                <button
                  onClick={() => fetchRating(true)}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg disabled:opacity-50 font-semibold text-sm"
                >
                  {t.common.forceReload}
                </button>
              </>
            }
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
