import { describe, expect, it } from 'vitest';
import { generateAutoPick, generateDraw, pickUniqueNumbers } from '@/lib/draw';

describe('pickUniqueNumbers', () => {
  it('returns the requested count of unique, sorted numbers within range', () => {
    for (let i = 0; i < 200; i++) {
      const numbers = pickUniqueNumbers(6, 45);
      expect(numbers).toHaveLength(6);
      expect(new Set(numbers).size).toBe(6);
      for (const n of numbers) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(45);
      }
      expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    }
  });

  it('never returns numbers from the exclude set', () => {
    const exclude = new Set([1, 2, 3, 4, 5, 6]);
    for (let i = 0; i < 100; i++) {
      const [n] = pickUniqueNumbers(1, 45, exclude);
      expect(exclude.has(n)).toBe(false);
    }
  });
});

describe('generateAutoPick', () => {
  it('returns 6 unique numbers between 1 and 45', () => {
    const numbers = generateAutoPick();
    expect(numbers).toHaveLength(6);
    expect(new Set(numbers).size).toBe(6);
  });
});

describe('generateDraw', () => {
  it('returns 6 drawn numbers and a bonus number not among them', () => {
    for (let i = 0; i < 200; i++) {
      const { drawnNumbers, bonusNumber } = generateDraw();
      expect(drawnNumbers).toHaveLength(6);
      expect(new Set(drawnNumbers).size).toBe(6);
      expect(drawnNumbers.includes(bonusNumber)).toBe(false);
      expect(bonusNumber).toBeGreaterThanOrEqual(1);
      expect(bonusNumber).toBeLessThanOrEqual(45);
    }
  });
});
