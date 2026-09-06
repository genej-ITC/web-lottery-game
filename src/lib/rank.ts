export const TICKET_COST = 1000;

export const RANK_MULTIPLIER: Record<number, number> = {
  1: 1000,
  2: 100,
  3: 20,
  4: 5,
  5: 2,
};

export const RANK_LABEL: Record<number, string> = {
  1: '1등',
  2: '2등',
  3: '3등',
  4: '4등',
  5: '5등',
};

export function calculateRank(
  chosenNumbers: number[],
  drawnNumbers: number[],
  bonusNumber: number
): number | null {
  const drawnSet = new Set(drawnNumbers);
  const matches = chosenNumbers.filter((n) => drawnSet.has(n)).length;

  if (matches === 6) return 1;
  if (matches === 5 && chosenNumbers.includes(bonusNumber)) return 2;
  if (matches === 5) return 3;
  if (matches === 4) return 4;
  if (matches === 3) return 5;
  return null;
}
