'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { purchaseTicketForUser } from '@/lib/purchase-prisma';
import { InsufficientPointsError } from '@/lib/purchase';
import { ValidationError } from '@/lib/validation';

export interface PurchaseActionResult {
  ok: boolean;
  error?: string;
  ticket?: {
    chosenNumbers: number[];
    drawnNumbers: number[];
    bonusNumber: number;
    rank: number | null;
    pointsWon: number;
  };
  pointsBalance?: number;
}

export async function purchaseAction(input: {
  chosenNumbers?: number[];
  isAuto: boolean;
}): Promise<PurchaseActionResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, error: '로그인이 필요합니다.' };
  }

  try {
    const result = await purchaseTicketForUser(userId, input);
    return {
      ok: true,
      ticket: {
        chosenNumbers: result.ticket.chosenNumbers,
        drawnNumbers: result.ticket.drawnNumbers,
        bonusNumber: result.ticket.bonusNumber,
        rank: result.ticket.rank,
        pointsWon: result.ticket.pointsWon,
      },
      pointsBalance: result.pointsBalance,
    };
  } catch (error) {
    if (error instanceof InsufficientPointsError) {
      return { ok: false, error: '포인트가 부족합니다.' };
    }
    if (error instanceof ValidationError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: '구매 중 오류가 발생했습니다.' };
  }
}
