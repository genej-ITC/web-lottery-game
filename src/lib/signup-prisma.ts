import { prisma } from './prisma';
import { createUser } from './signup';

export async function signupUser(email: string, password: string) {
  return createUser(prisma, email, password);
}
