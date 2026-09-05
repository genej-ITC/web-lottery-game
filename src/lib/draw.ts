import { randomInt } from 'crypto';

export function pickUniqueNumbers(count: number, max: number, exclude: Set<number> = new Set()): number[] {
  const picked = new Set<number>();
  while (picked.size < count) {
    const n = randomInt(1, max + 1);
    if (!exclude.has(n)) {
      picked.add(n);
    }
  }
  return Array.from(picked).sort((a, b) => a - b);
}

export function generateAutoPick(): number[] {
  return pickUniqueNumbers(6, 45);
}

export function generateDraw(): { drawnNumbers: number[]; bonusNumber: number } {
  const drawnNumbers = pickUniqueNumbers(6, 45);
  const [bonusNumber] = pickUniqueNumbers(1, 45, new Set(drawnNumbers));
  return { drawnNumbers, bonusNumber };
}
