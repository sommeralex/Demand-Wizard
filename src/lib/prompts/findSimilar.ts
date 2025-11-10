// src/lib/prompts/findSimilar.ts
import { MOCK_PORTFOLIO } from '../../data/portfolio';

const getFindSimilarPromptDE = (text: string) => `
  Du bist ein Portfolio-Analyst. Deine Aufgabe ist es, eine neue Idee mit einem bestehenden Projektportfolio zu vergleichen.
  Schätze für jedes Projekt im Portfolio eine prozentuale semantische Ähnlichkeit (0-100) zur neuen "Demand".

  Neue Demand:
  "${text}"

  Bestehendes Portfolio:
  ${JSON.stringify(MOCK_PORTFOLIO, null, 2)}

  Gib dein Ergebnis ausschließlich als valides JSON-Array von Objekten zurück. Jedes Objekt muss 'id', 'title', 'status' und einen 'similarity'-Score (als Zahl) enthalten.
`;

const getFindSimilarPromptEN = (text: string) => `
  You are a portfolio analyst. Your task is to compare a new idea with an existing project portfolio.
  Estimate a percentage semantic similarity (0-100) to the new "Demand" for each project in the portfolio.

  New Demand:
  "${text}"

  Existing Portfolio:
  ${JSON.stringify(MOCK_PORTFOLIO, null, 2)}

  Return your result exclusively as a valid JSON array of objects. Each object must contain 'id', 'title', 'status', and a 'similarity' score (as a number).
`;

export const getFindSimilarPrompt = (text: string, locale: string = 'de') => {
  return locale === 'en' ? getFindSimilarPromptEN(text) : getFindSimilarPromptDE(text);
};
