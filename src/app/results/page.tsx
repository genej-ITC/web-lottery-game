import { prisma } from '@/lib/prisma';
import { DatelineRail } from '@/components/DatelineRail';
import { formatKoreanDate } from '@/lib/date';
import { tableRoot, tableTd, tableTh } from '@/lib/ui';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, drawnNumbers: true, bonusNumber: true, createdAt: true },
  });
  const [latest, ...rest] = tickets;

  return (
    <main className="mx-auto max-w-page px-ds-4 pt-ds-6">
      <DatelineRail left="추첨 기록 · 최근 20건" center="제 1047 회" right={formatKoreanDate(new Date())} />
      <h1 className="mb-ds-6 text-[36px] leading-[1.05]">최신 추첨 결과</h1>

      {latest ? (
        <div className="mb-ds-8 border-t-[3px] border-ink pt-ds-4">
          <p className="text-meta text-gray-700">직전 추첨 · {latest.createdAt.toLocaleString('ko-KR')}</p>
          <div className="mt-ds-3 flex flex-wrap items-center gap-2">
            {latest.drawnNumbers.map((n) => (
              <span
                key={n}
                className="inline-flex size-[52px] items-center justify-center rounded-full bg-ink text-[20px] text-paper"
              >
                {n}
              </span>
            ))}
            <span className="px-1 text-lead text-gray-700">+</span>
            <span className="inline-flex size-[52px] items-center justify-center rounded-full border border-magenta text-[20px] text-magenta-700">
              {latest.bonusNumber}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-body text-gray-700">아직 추첨 결과가 없습니다.</p>
      )}

      {rest.length > 0 && (
        <table className={`${tableRoot} max-w-table`}>
          <thead>
            <tr>
              <th className={tableTh}>시각</th>
              <th className={tableTh}>당첨 번호</th>
              <th className={`${tableTh} text-right`}>보너스</th>
            </tr>
          </thead>
          <tbody>
            {rest.map((d) => (
              <tr key={d.id} className="hover:bg-ink/[0.04]">
                <td className={`${tableTd} whitespace-nowrap text-gray-700`}>{d.createdAt.toLocaleString('ko-KR')}</td>
                <td className={`${tableTd} tabular-nums tracking-[0.02em]`}>{d.drawnNumbers.join('  ·  ')}</td>
                <td className={`${tableTd} text-right text-magenta-700`}>{d.bonusNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
