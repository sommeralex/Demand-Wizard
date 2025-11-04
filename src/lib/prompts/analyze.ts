// src/lib/prompts/analyze.ts

export const getAnalyzePrompt = (text: string) => `
  Analyze the following demand description from a user.
  Determine if the following aspects are mentioned in the text:
  1. A clear problem statement (what is the issue?).
  2. A business goal (what should be improved or achieved?).
  3. The affected user group (who is this for?).
  4. First budget indications (how much will it cost).
  5. First indication how much internal efforts will be required (person days)
  6. First indications, on how this initiative will save time or money.
  7. A rough timeplan. How long will it take, when should it start and finish?

  Respond with a JSON object only, with the following keys set to true or false:
  {
    "problem_statement": boolean,
    "business_goal": boolean,
    "user_group": boolean,
    "first_budget_indications": boolean,
    "first_internal_efforts_indications": boolean,
    "first_timeplan_indications": boolean,
    "rough_timeplan": boolean
  }

  Demand Description:
  "${text}"
`;
