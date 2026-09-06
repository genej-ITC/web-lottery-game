import { describe, expect, it } from 'vitest';
import { calculateRank, RANK_MULTIPLIER, TICKET_COST } from '@/lib/rank';

describe('calculateRank', () => {
  it('returns 1st place for 6 matches', () => {
    expect(calculateRank([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], 7)).toBe(1);
  });

  it('returns 2nd place for 5 matches plus the bonus number', () => {
    expect(calculateRank([1, 2, 3, 4, 5, 7], [1, 2, 3, 4, 5, 6], 7)).toBe(2);
  });

  it('returns 3rd place for 5 matches without the bonus number', () => {
    expect(calculateRank([1, 2, 3, 4, 5, 20], [1, 2, 3, 4, 5, 6], 7)).toBe(3);
  });

  it('returns 4th place for 4 matches', () => {
    expect(calculateRank([1, 2, 3, 4, 20, 21], [1, 2, 3, 4, 5, 6], 7)).toBe(4);
  });

  it('returns 5th place for 3 matches', () => {
    expect(calculateRank([1, 2, 3, 20, 21, 22], [1, 2, 3, 4, 5, 6], 7)).toBe(5);
  });

  it('returns null for fewer than 3 matches', () => {
    expect(calculateRank([1, 2, 20, 21, 22, 23], [1, 2, 3, 4, 5, 6], 7)).toBeNull();
  });

  it('exposes the ticket cost and per-rank payout multipliers', () => {
    expect(TICKET_COST).toBe(1000);
    expect(RANK_MULTIPLIER).toEqual({ 1: 1000, 2: 100, 3: 20, 4: 5, 5: 2 });
  });

  it('does not throw when given a malformed draw where the bonus number overlaps the drawn numbers', () => {
    // calculateRank is a pure function that trusts its inputs; generateDraw() guarantees the
    // bonus number is always distinct from the drawn numbers, but calculateRank itself has no
    // such guard. This documents its defined (non-throwing) behavior on that malformed input.
    expect(() => calculateRank([1, 2, 3, 4, 5, 20], [1, 2, 3, 4, 5, 6], 3)).not.toThrow();
    expect(calculateRank([1, 2, 3, 4, 5, 20], [1, 2, 3, 4, 5, 6], 3)).toBe(2);
  });
});
