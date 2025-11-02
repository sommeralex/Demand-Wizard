import { MOCK_PORTFOLIO } from '../data/portfolio';

export const MOCK_DEMANDS = MOCK_PORTFOLIO;

export function getDemandById(id: string) {
  return MOCK_DEMANDS.find(demand => demand.id === id);
}
