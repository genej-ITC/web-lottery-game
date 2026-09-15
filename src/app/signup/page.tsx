'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { signupAction } from '@/app/actions/auth';
import { DatelineRail } from '@/components/DatelineRail';
import { formatKoreanDate } from '@/lib/date';
import { btnPrimary, fieldLabel, fieldRoot, inputBase } from '@/lib/ui';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signupAction(email, password);
    if (!result.ok) {
      setError(result.error ?? '가입 중 오류가 발생했습니다.');
      setSubmitting(false);
      return;
    }

    const signInResult = await signIn('credentials', { email, password, redirect: false });
    setSubmitting(false);
    router.push(signInResult?.ok ? '/play' : '/login');
  }

  return (
    <main className="mx-auto max-w-page px-ds-4 py-ds-8">
      <DatelineRail left="계정 · 회원가입" right={formatKoreanDate(new Date())} />
      <div className="grid grid-cols-1 items-start gap-ds-8 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div>
          <p className="mb-ds-3 text-micro uppercase text-gray-700">계정</p>
          <h1 className="mb-ds-6 text-[36px] leading-[1.05]">회원가입</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-ds-4">
            <label className={fieldRoot}>
              <span className={fieldLabel}>이메일</span>
              <input
                type="email"
                required
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
              />
            </label>
            <label className={fieldRoot}>
              <span className={fieldLabel}>비밀번호</span>
              <input
                type="password"
                required
                minLength={8}
                placeholder="비밀번호 (8자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputBase}
              />
            </label>
            {error && <p className="text-meta text-magenta-700">{error}</p>}
            <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
              가입하기
            </button>
          </form>
        </div>

        <div className="md:pt-11">
          <p className="mb-ds-3 text-micro uppercase text-gray-700">가입하면</p>
          <ul className="flex max-w-[30ch] list-none flex-col gap-ds-3 p-0 text-body text-gray-800">
            <li className="border-b border-divider pb-ds-3">시작 포인트 10,000P가 지급됩니다.</li>
            <li className="border-b border-divider pb-ds-3">한 게임 1,000P로 1~45 중 6개를 고릅니다.</li>
            <li>결제는 없습니다. 전부 가상 포인트입니다.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
