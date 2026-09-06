'use server';

import { signupUser } from '@/lib/signup-prisma';
import { DuplicateEmailError, InvalidEmailError, WeakPasswordError } from '@/lib/signup';

export interface SignupActionResult {
  ok: boolean;
  error?: string;
}

export async function signupAction(email: string, password: string): Promise<SignupActionResult> {
  try {
    await signupUser(email, password);
    return { ok: true };
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return { ok: false, error: '이미 가입된 이메일입니다.' };
    }
    if (error instanceof InvalidEmailError) {
      return { ok: false, error: '올바른 이메일 형식이 아닙니다.' };
    }
    if (error instanceof WeakPasswordError) {
      return { ok: false, error: '비밀번호는 8자 이상이어야 합니다.' };
    }
    return { ok: false, error: '가입 중 오류가 발생했습니다.' };
  }
}
