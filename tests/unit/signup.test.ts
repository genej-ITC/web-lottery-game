import { describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import { createUser, DuplicateEmailError, InvalidEmailError, WeakPasswordError, type SignupDb } from '@/lib/signup';

function createFakeDb(existingEmails: string[] = []) {
  const users = new Map(
    existingEmails.map((email) => [email, { id: email, email, passwordHash: '', points: 0 }])
  );
  let nextId = 1;

  const db: SignupDb = {
    user: {
      async findUnique({ where: { email } }) {
        return users.has(email) ? { id: users.get(email)!.id } : null;
      },
      async create({ data }) {
        const record = { id: `user-${nextId++}`, ...data };
        users.set(data.email, record);
        return record;
      },
    },
  };

  return { db, users };
}

describe('createUser', () => {
  it('creates a user with the initial point balance', async () => {
    const { db } = createFakeDb();

    const user = await createUser(db, 'player@example.com', 'correct horse battery staple');

    expect(user.email).toBe('player@example.com');
    expect(user.points).toBe(10000);
  });

  it('hashes the password so the plaintext is never stored', async () => {
    const { db, users } = createFakeDb();
    await createUser(db, 'player@example.com', 'my-password');

    const stored = users.get('player@example.com')!;
    expect(stored.passwordHash).not.toBe('my-password');
    expect(await bcrypt.compare('my-password', stored.passwordHash)).toBe(true);
  });

  it('rejects a duplicate email', async () => {
    const { db } = createFakeDb(['taken@example.com']);

    await expect(createUser(db, 'taken@example.com', 'password123')).rejects.toThrow(DuplicateEmailError);
  });

  it('rejects an invalid email format', async () => {
    const { db } = createFakeDb();

    await expect(createUser(db, 'not-an-email', 'password123')).rejects.toThrow(InvalidEmailError);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const { db } = createFakeDb();

    await expect(createUser(db, 'player@example.com', 'short')).rejects.toThrow(WeakPasswordError);
  });
});
