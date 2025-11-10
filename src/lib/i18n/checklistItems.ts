import { Locale } from './index';

export interface ChecklistItemDefinition {
  id: string;
  text: string;
}

const checklistItemsDE: ChecklistItemDefinition[] = [
  { id: "problem_statement", text: "Problemstellung" },
  { id: "business_goal", text: "Business-Ziel" },
  { id: "user_group", text: "Betroffene Benutzergruppe" },
  { id: "first_budget_indications", text: "Budget-Indikationen (OPEX/CAPEX)" },
  { id: "first_internal_efforts_indications", text: "Interner Aufwand (Personentage)" },
  { id: "first_timeplan_indications", text: "Nutzen-Indikationen (Zeit-/Geldeinsparungen)" },
  { id: "rough_timeplan", text: "Zeitplan (Start/Ende)" },
];

const checklistItemsEN: ChecklistItemDefinition[] = [
  { id: "problem_statement", text: "Problem Statement" },
  { id: "business_goal", text: "Business Goal" },
  { id: "user_group", text: "Affected User Groups" },
  { id: "first_budget_indications", text: "Budget Indications (OPEX/CAPEX)" },
  { id: "first_internal_efforts_indications", text: "Internal Effort (Person-Days)" },
  { id: "first_timeplan_indications", text: "Benefit Indications (Time/Cost Savings)" },
  { id: "rough_timeplan", text: "Timeline (Start/End)" },
];

export function getChecklistItemDefinitions(locale: Locale): ChecklistItemDefinition[] {
  return locale === 'de' ? checklistItemsDE : checklistItemsEN;
}
