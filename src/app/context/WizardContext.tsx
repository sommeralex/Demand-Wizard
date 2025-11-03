"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'; // Added useEffect

// --- TYPE DEFINITIONS ---
interface Rating { bewertung: { klarheit: number; vollstaendigkeit: number; business_value: number; }; feedback_text: string; }
interface ClassificationResult { [key: string]: { score: string; begruendung: string }; }
interface SimilarProject { id: string; title: string; status: string; similarity: number; }
interface Recommendation { empfehlung_aktion: string; target_id: string | null; zusammenfassung_benutzer: string; }
interface Proposal { markdown: string; }
interface ChecklistItem { id: string; text: string; checked: boolean; }
interface BudgetTableRow { id: string; kostentyp: 'OPEX' | 'CAPEX'; beschreibung: string; wert: string; jahr: number; }
interface BusinessCaseData {
  planungshorizont_jahre?: number;
  investition?: any;
  nutzen?: any;
  cashflow?: any[];
  kennzahlen?: any;
  empfehlung?: string;
  risiken?: string[];
  optimierungen?: string[];
}

interface WizardContextType {
  step: number;
  setStep: (step: number) => void;
  text: string;
  setText: (text: string) => void;
  checklistItems: ChecklistItem[];
  setChecklistItems: (items: ChecklistItem[]) => void;
  rating: Rating | null;
  setRating: (rating: Rating | null) => void;
  classification: ClassificationResult | null;
  setClassification: (classification: ClassificationResult | null) => void;
  similarProjects: SimilarProject[];
  setSimilarProjects: (projects: SimilarProject[]) => void;
  recommendation: Recommendation | null;
  setRecommendation: (rec: Recommendation | null) => void;
  proposal: Proposal | null;
  setProposal: (prop: Proposal | null) => void;
  budgetTable: BudgetTableRow[];
  setBudgetTable: (table: BudgetTableRow[]) => void;
  budgetStartYear: number;
  setBudgetStartYear: (year: number) => void;
  budgetPlanningHorizon: number;
  setBudgetPlanningHorizon: (years: number) => void;
  businessCaseData: BusinessCaseData | null;
  setBusinessCaseData: (data: BusinessCaseData | null) => void;
  reset: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'wizardState'; // Define local storage key

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  // Function to load state from localStorage
  const loadState = () => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        try {
          return JSON.parse(savedState);
        } catch (e) {
          console.error("Failed to parse wizard state from localStorage", e);
          return {}; // Return empty object to use default initial states
        }
      }
    }
    return {}; // Default empty state if no localStorage or not in browser
  };

  const initialState = loadState();

  const [step, setStep] = useState<number>(initialState.step || 1);
  const [text, setText] = useState<string>(initialState.text || '');
  const [rating, setRating] = useState<Rating | null>(initialState.rating || null);
  const [classification, setClassification] = useState<ClassificationResult | null>(initialState.classification || null);
  const [similarProjects, setSimilarProjects] = useState<SimilarProject[]>(initialState.similarProjects || []);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(initialState.recommendation || null);
  const [proposal, setProposal] = useState<Proposal | null>(initialState.proposal || null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    initialState.checklistItems || [
      { id: "problem_statement", text: "Problemstellung", checked: false },
      { id: "business_goal", text: "Business-Ziel", checked: false },
      { id: "user_group", text: "Betroffene Benutzergruppe", checked: false },
    ]
  );
  const [budgetTable, setBudgetTable] = useState<BudgetTableRow[]>(initialState.budgetTable || []);
  const [budgetStartYear, setBudgetStartYear] = useState<number>(initialState.budgetStartYear || new Date().getFullYear());
  const [budgetPlanningHorizon, setBudgetPlanningHorizon] = useState<number>(initialState.budgetPlanningHorizon || 3);
  const [businessCaseData, setBusinessCaseData] = useState<BusinessCaseData | null>(initialState.businessCaseData || null);

  // Effect to save state to localStorage whenever any relevant state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        step, text, rating, classification, similarProjects, recommendation, proposal, checklistItems, budgetTable, budgetStartYear, budgetPlanningHorizon, businessCaseData
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [step, text, rating, classification, similarProjects, recommendation, proposal, checklistItems, budgetTable, budgetStartYear, budgetPlanningHorizon, businessCaseData]);


  const reset = () => {
    setStep(1);
    setText('');
    setRating(null);
    setClassification(null);
    setSimilarProjects([]);
    setRecommendation(null);
    setProposal(null);
    setChecklistItems([ // Reset checklist items to initial state
      { id: "problem_statement", text: "Problemstellung", checked: false },
      { id: "business_goal", text: "Business-Ziel", checked: false },
      { id: "user_group", text: "Betroffene Benutzergruppe", checked: false },
    ]);
    setBudgetTable([]);
    setBudgetStartYear(new Date().getFullYear());
    setBudgetPlanningHorizon(3);
    setBusinessCaseData(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  return (
    <WizardContext.Provider value={{
      step, setStep,
      text, setText,
      checklistItems, setChecklistItems,
      rating, setRating,
      classification, setClassification,
      similarProjects, setSimilarProjects,
      recommendation, setRecommendation,
      proposal, setProposal,
      budgetTable, setBudgetTable,
      budgetStartYear, setBudgetStartYear,
      budgetPlanningHorizon, setBudgetPlanningHorizon,
      businessCaseData, setBusinessCaseData,
      reset
    }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};
