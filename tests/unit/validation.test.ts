import { describe, expect, it } from 'vitest';
import { validateChosenNumbers, ValidationError } from '@/lib/validation';

describe('validateChosenNumbers', () => {
  it('accepts exactly 6 unique numbers in range', () => {
    expect(() => validateChosenNumbers([1, 2, 3, 4, 5, 6])).not.toThrow();
  });

  it('rejects fewer than 6 numbers', () => {
    expect(() => validateChosenNumbers([1, 2, 3])).toThrow(ValidationError);
  });

  it('rejects more than 6 numbers', () => {
    expect(() => validateChosenNumbers([1, 2, 3, 4, 5, 6, 7])).toThrow(ValidationError);
  });

  it('rejects duplicate numbers', () => {
    expect(() => validateChosenNumbers([1, 1, 2, 3, 4, 5])).toThrow(ValidationError);
  });

  it('rejects numbers outside 1-45', () => {
    expect(() => validateChosenNumbers([0, 2, 3, 4, 5, 6])).toThrow(ValidationError);
    expect(() => validateChosenNumbers([1, 2, 3, 4, 5, 46])).toThrow(ValidationError);
  });
});
