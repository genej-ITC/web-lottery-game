import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const INITIAL_POINTS = 10000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class DuplicateEmailError extends Error {}
export class InvalidEmailError extends Error {}

export interface SignupDb {
  user: {
    findUnique(args: { where: { email: string } }): Promise<{ id: string } | null>;
    create(args: {
      data: { email: string; passwordHash: string; points: number };
    }): Promise<{ id: string; email: string; points: number }>;
  };
}

export async function createUser(
  db: SignupDb,
  email: string,
  password: string
): Promise<{ id: string; email: string; points: number }> {
  if (!EMAIL_PATTERN.test(email)) {
    throw new InvalidEmailError('올바른 이메일 형식이 아닙니다.');
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new DuplicateEmailError('이미 가입된 이메일입니다.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return db.user.create({ data: { email, passwordHash, points: INITIAL_POINTS } });
}
