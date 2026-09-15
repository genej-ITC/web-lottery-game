import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { RANK_MULTIPLIER } from '@/lib/rank';
import { formatKoreanDate } from '@/lib/date';
import { btnPrimary, btnSecondary, microLabel } from '@/lib/ui';

export const dynamic = 'force-dynamic';

const RANK_MATCH_LABEL: Record<string, string> = {
  '1': '6개 일치',
  '2': '5개 + 보너스 일치',
  '3': '5개 일치',
  '4': '4개 일치',
  '5': '3개 일치',
};

function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div>
      <p className="text-[34px] leading-none tracking-[-0.02em] tabular-nums">
        {value}
        {unit && <span className="text-[16px]">{unit}</span>}
      </p>
      <p className="mt-1.5 text-meta text-gray-700">{label}</p>
    </div>
  );
}

export default async function HomePage() {
  const lastTicket = await prisma.ticket.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { drawnNumbers: true, bonusNumber: true },
  });

  return (
    <main className="mx-auto max-w-page px-ds-4 pt-ds-8">
      <div className="mb-[3px] border-t-[6px] border-ink" />
      <div className="flex items-baseline justify-between gap-ds-4 py-1.5 text-micro uppercase text-gray-700">
        <span>6 / 45 · 가상 포인트</span>
        <span>제 1047 회</span>
        <span>{formatKoreanDate(new Date())}</span>
      </div>
      <div className="mb-ds-8 border-t border-ink" />

      <div className="grid grid-cols-1 items-start gap-ds-8 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div>
          <h1 className="mb-ds-4 text-[clamp(40px,6vw,68px)] font-semibold leading-none tracking-[-0.03em]">
            웹 복권 게임
          </h1>
          <p className="mb-ds-6 max-w-[32ch] text-pretty text-lead text-gray-800">
            가상 포인트로 번호를 구매하고 즉석에서 추첨 결과를 확인해보세요.
          </p>
          <div className="mb-ds-4 flex flex-wrap gap-ds-3">
            <Link href="/signup" className={btnPrimary}>회원가입</Link>
            <Link href="/login" className={btnSecondary}>로그인</Link>
          </div>
          <Link href="/results" className="text-ui text-cyan-700 underline underline-offset-[3px]">
            최신 추첨 결과 보기
          </Link>

          <div className="mt-ds-8 grid gap-ds-6 border-t border-divider pt-ds-6 sm:grid-cols-3">
            <Stat value="1,000" unit="P" label="한 게임 구매 금액" />
            <Stat value="1,000" unit="배" label="1등 당첨 시 지급 배수" />
            <Stat value="즉시" label="구매 직후 추첨·정산" />
          </div>
        </div>

        <aside>
          <p className={microLabel}>직전 추첨</p>
          {lastTicket ? (
            <div className="mt-ds-3 flex flex-wrap items-center gap-2">
              {lastTicket.drawnNumbers.map((n) => (
                <span
                  key={n}
                  className="inline-flex size-ball items-center justify-center rounded-full bg-ink text-[18px] text-paper"
                >
                  {n}
                </span>
              ))}
              <span className="px-1 text-lead text-gray-700">+</span>
              <span className="inline-flex size-ball items-center justify-center rounded-full border border-magenta text-[18px] text-magenta-700">
                {lastTicket.bonusNumber}
              </span>
            </div>
          ) : (
            <p className="mt-ds-3 text-body text-gray-700">아직 추첨 결과가 없습니다.</p>
          )}

          <p className={`${microLabel} mt-ds-6`}>등수 규칙</p>
          <table className="mt-ds-3 w-full border-collapse text-ui">
            <tbody>
              {Object.entries(RANK_MULTIPLIER).map(([rank, multiplier], i) => (
                <tr key={rank} className={i > 0 ? 'border-t border-divider' : ''}>
                  <td className="py-1.5 pr-ds-2 text-gray-800">{rank}등</td>
                  <td className="py-1.5 pr-ds-2 text-gray-700">{RANK_MATCH_LABEL[rank]}</td>
                  <td className="py-1.5 text-right tabular-nums text-magenta-700">{multiplier}배</td>
                </tr>
              ))}
            </tbody>
          </table>
        </aside>
      </div>
    </main>
  );
}
