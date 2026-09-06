import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { RANK_LABEL } from '@/lib/rank';

const HISTORY_PAGE_SIZE = 20;

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const tickets = await prisma.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_PAGE_SIZE,
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">내 구매 내역 (최근 {HISTORY_PAGE_SIZE}건)</h1>
      <p className="mb-6 text-gray-600">현재 잔액: {user?.points.toLocaleString()}P</p>

      <ul className="flex flex-col gap-3">
        {tickets.map((ticket) => (
          <li key={ticket.id} className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">{ticket.createdAt.toLocaleString('ko-KR')}</p>
            <p>내 번호: {ticket.chosenNumbers.join(', ')}</p>
            <p>
              당첨 번호: {ticket.drawnNumbers.join(', ')} + 보너스 {ticket.bonusNumber}
            </p>
            <p className="font-semibold">
              {ticket.rank ? `${RANK_LABEL[ticket.rank]} (+${ticket.pointsWon.toLocaleString()}P)` : '낙첨'}
            </p>
          </li>
        ))}
        {tickets.length === 0 && <p className="text-gray-500">구매 내역이 없습니다.</p>}
      </ul>
    </main>
  );
}
