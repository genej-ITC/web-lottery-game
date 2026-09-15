'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { DatelineRail } from '@/components/DatelineRail';
import { formatKoreanDate } from '@/lib/date';
import { btnPrimary, fieldLabel, fieldRoot, inputBase } from '@/lib/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn('credentials', { email, password, redirect: false });
    setSubmitting(false);

    if (result?.ok) {
      router.push('/play');
    } else {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  }

  return (
    <main className="mx-auto max-w-page px-ds-4 py-ds-8">
      <DatelineRail left="계정 · 로그인" right={formatKoreanDate(new Date())} />
      <div className="max-w-form">
        <p className="mb-ds-3 text-micro uppercase text-gray-700">계정</p>
        <h1 className="mb-ds-6 text-[36px] leading-[1.05]">로그인</h1>
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
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputBase}
            />
          </label>
          {error && <p className="text-meta text-magenta-700">{error}</p>}
          <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
            로그인
          </button>
          <p className="text-meta text-gray-700">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="underline underline-offset-[3px]">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
