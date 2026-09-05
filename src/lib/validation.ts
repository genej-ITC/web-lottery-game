export class ValidationError extends Error {}

export function validateChosenNumbers(numbers: number[]): void {
  if (numbers.length !== 6) {
    throw new ValidationError('번호는 정확히 6개를 선택해야 합니다.');
  }

  const unique = new Set(numbers);
  if (unique.size !== 6) {
    throw new ValidationError('중복된 번호는 선택할 수 없습니다.');
  }

  for (const n of numbers) {
    if (!Number.isInteger(n) || n < 1 || n > 45) {
      throw new ValidationError('번호는 1부터 45 사이의 정수여야 합니다.');
    }
  }
}
