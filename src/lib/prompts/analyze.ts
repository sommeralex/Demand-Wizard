// src/lib/prompts/analyze.ts

export const getAnalyzePrompt = (text: string) => `
  Analyze the following demand description from a user.
  Determine if the following aspects are mentioned in the text:
  1. A clear problem statement (what is the issue?).
  2. A business goal (what should be improved or achieved?).
  3. The affected user group (who is this for?).

  Respond with a JSON object only, with the following keys set to true or false:
  {
    "problem_statement": boolean,
    "business_goal": boolean,
    "user_group": boolean
  }

  Demand Description:
  "${text}"
`;
