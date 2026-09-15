'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { btnPrimary, navLink } from '@/lib/ui';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="mx-auto flex max-w-page flex-wrap items-center gap-ds-4 px-ds-4 py-ds-3">
      <Link href="/" className="mr-auto font-serif text-[18px] font-semibold tracking-[-0.01em] text-ink no-underline">
        웹 복권 게임
      </Link>
      <nav className="flex flex-wrap items-center gap-ds-4 text-ui">
        <Link href="/results" className={navLink}>최신 결과</Link>
        {session ? (
          <>
            <Link href="/play" className={navLink}>번호 구매</Link>
            <Link href="/history" className={navLink}>내 기록</Link>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="font-serif text-magenta-700 hover:text-magenta-600">
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={navLink}>로그인</Link>
            <Link href="/signup" className={`${btnPrimary} px-ds-3 py-1.5`}>회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}
