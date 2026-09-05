'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3">
      <Link href="/" className="font-bold">
        웹 복권 게임
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/results">최신 결과</Link>
        {session ? (
          <>
            <Link href="/play">번호 구매</Link>
            <Link href="/history">내 기록</Link>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="text-red-600">
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link href="/login">로그인</Link>
            <Link href="/signup">회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}
