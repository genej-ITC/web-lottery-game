import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">웹 복권 게임</h1>
      <p className="text-gray-600">
        가상 포인트로 번호를 구매하고 즉석에서 추첨 결과를 확인해보세요.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className="rounded bg-blue-600 px-4 py-2 text-white">
          회원가입
        </Link>
        <Link href="/login" className="rounded border border-blue-600 px-4 py-2 text-blue-600">
          로그인
        </Link>
      </div>
      <Link href="/results" className="text-sm text-gray-500 underline">
        최신 추첨 결과 보기
      </Link>
    </main>
  );
}
