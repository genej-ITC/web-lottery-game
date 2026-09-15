import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { RANK_LABEL } from '@/lib/rank';
import { DatelineRail } from '@/components/DatelineRail';
import { formatKoreanDate } from '@/lib/date';
import { cardRoot, microLabel, tagMagenta, tagNeutral } from '@/lib/ui';

const HISTORY_PAGE_SIZE = 20;

function NumberRow({
  label,
  numbers,
  highlight,
  bonus,
  tone,
}: {
  label: string;
  numbers: number[];
  highlight?: number[];
  bonus?: number;
  tone?: 'ink';
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-[62px] text-meta text-gray-700">{label}</span>
      {numbers.map((n) => {
        const isHighlighted = highlight?.includes(n);
        const cls = tone
          ? 'bg-ink text-paper'
          : isHighlighted
            ? 'bg-magenta text-paper'
            : 'border border-divider text-gray-700';
        return (
          <span key={n} className={`inline-flex size-[30px] items-center justify-center rounded-full text-[13px] ${cls}`}>
            {n}
          </span>
        );
      })}
      {bonus !== undefined && (
        <span className="inline-flex size-[30px] items-center justify-center rounded-full border border-magenta text-[13px] text-magenta-700">
          {bonus}
        </span>
      )}
    </div>
  );
}

function currentStreak(dates: Date[]): number {
  const days = new Set(dates.map((d) => d.toDateString()));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    redirect('/login');
  }

  const [user, tickets, gamesPlayed, gamesWon] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_PAGE_SIZE,
    }),
    prisma.ticket.count({ where: { userId } }),
    prisma.ticket.count({ where: { userId, rank: { not: null } } }),
  ]);

  const freq = Array.from({ length: 45 }, (_, i) => ({ n: i + 1, count: 0 }));
  for (const ticket of tickets) {
    for (const n of ticket.drawnNumbers) {
      freq[n - 1].count += 1;
    }
  }
  const peak = Math.max(1, ...freq.map((f) => f.count));
  const streak = currentStreak(tickets.map((t) => t.createdAt));

  return (
    <main className="mx-auto max-w-page px-ds-4 pt-ds-6">
      <DatelineRail left={`내 기록 · 최근 ${HISTORY_PAGE_SIZE}건`} right={formatKoreanDate(new Date())} />
      <h1 className="mb-ds-6 text-[36px] leading-[1.05]">내 기록</h1>

      <div className="mb-ds-8 grid gap-ds-6 border-b border-divider pb-ds-6 sm:grid-cols-4">
        <div>
          <p className="text-[28px] leading-none tabular-nums">{user?.points.toLocaleString()}</p>
          <p className="mt-1.5 text-meta text-gray-700">현재 잔액</p>
        </div>
        <div>
          <p className="text-[28px] leading-none tabular-nums">{gamesPlayed.toLocaleString()}</p>
          <p className="mt-1.5 text-meta text-gray-700">구매 게임 수</p>
        </div>
        <div>
          <p className="text-[28px] leading-none tabular-nums">{gamesWon.toLocaleString()}</p>
          <p className="mt-1.5 text-meta text-gray-700">당첨 게임 수</p>
        </div>
        <div>
          <p className="text-[28px] leading-none tabular-nums text-magenta-700">{streak}</p>
          <p className="mt-1.5 text-meta text-gray-700">연속 구매(일)</p>
        </div>
      </div>

      <p className={microLabel}>번호 빈도</p>
      <div className="mt-ds-3 flex h-24 max-w-table items-end gap-1 border-b border-ink">
        {freq.map((f) => (
          <span
            key={f.n}
            title={`${f.n}번 · ${f.count}회`}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <span className="block min-h-0.5 w-full bg-cyan-500" style={{ height: `${(f.count / peak) * 100}%` }} />
          </span>
        ))}
      </div>
      <div className="mt-1.5 flex max-w-table justify-between text-micro normal-case text-gray-600">
        <span>1</span>
        <span>15</span>
        <span>30</span>
        <span>45</span>
      </div>

      <ul className="mt-ds-8 flex list-none flex-col gap-ds-3 p-0">
        {tickets.map((ticket) => (
          <li key={ticket.id} className={cardRoot}>
            <div className="flex flex-wrap items-baseline justify-between gap-ds-3">
              <span className="text-meta text-gray-700">{ticket.createdAt.toLocaleString('ko-KR')}</span>
              {ticket.rank ? (
                <span className={tagMagenta}>
                  {RANK_LABEL[ticket.rank]} +{ticket.pointsWon.toLocaleString()}P
                </span>
              ) : (
                <span className={tagNeutral}>낙첨</span>
              )}
            </div>
            <NumberRow label="내 번호" numbers={ticket.chosenNumbers} highlight={ticket.drawnNumbers} />
            <NumberRow label="당첨 번호" numbers={ticket.drawnNumbers} tone="ink" bonus={ticket.bonusNumber} />
          </li>
        ))}
        {tickets.length === 0 && <p className="text-body text-gray-700">구매 내역이 없습니다.</p>}
      </ul>
    </main>
  );
}
