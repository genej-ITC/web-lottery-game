import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, drawnNumbers: true, bonusNumber: true, createdAt: true },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">최신 추첨 결과</h1>
      <ul className="flex flex-col gap-3">
        {tickets.map((ticket) => (
          <li key={ticket.id} className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">{ticket.createdAt.toLocaleString('ko-KR')}</p>
            <p>
              당첨 번호: {ticket.drawnNumbers.join(', ')} + 보너스 {ticket.bonusNumber}
            </p>
          </li>
        ))}
        {tickets.length === 0 && <p className="text-gray-500">아직 추첨 결과가 없습니다.</p>}
      </ul>
    </main>
  );
}
