// src/lib/prompts/findSimilar.ts
import { MOCK_PORTFOLIO } from '../../data/portfolio';

export const getFindSimilarPrompt = (text: string) => `
  Du bist ein Portfolio-Analyst. Deine Aufgabe ist es, eine neue Idee mit einem bestehenden Projektportfolio zu vergleichen.
  Schätze für jedes Projekt im Portfolio eine prozentuale semantische Ähnlichkeit (0-100) zur neuen "Demand".

  Neue Demand:
  "${text}"

  Bestehendes Portfolio:
  ${JSON.stringify(MOCK_PORTFOLIO, null, 2)}

  Gib dein Ergebnis ausschließlich als valides JSON-Array von Objekten zurück. Jedes Objekt muss 'id', 'title', 'status' und einen 'similarity'-Score (als Zahl) enthalten.
`;
