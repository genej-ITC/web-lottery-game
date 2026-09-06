import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { signupUser } from '@/lib/signup-prisma';
import { purchaseTicketForUser } from '@/lib/purchase-prisma';
import { InsufficientPointsError } from '@/lib/purchase';

// Manual, one-off verification against the REAL Supabase DB (via the connection pooler).
// Not included in `npm test` (see vitest.config.ts `include`) — run explicitly with:
//   npx vitest run tests/manual/real-db-smoke.test.ts
// Cleans up everything it creates.

describe('real DB smoke test (Supabase pooler + Prisma interactive transaction)', () => {
  let userId: string;

  beforeAll(async () => {
    const email = `smoke-test-${Date.now()}@example.com`;
    const user = await signupUser(email, 'smoke-test-password');
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('completes a single purchase against the real DB via the pooled Prisma transaction', async () => {
    const result = await purchaseTicketForUser(userId, { isAuto: true });

    expect(result.ticket.chosenNumbers).toHaveLength(6);
    expect(result.pointsBalance).toBe(10000 - 1000 + result.ticket.pointsWon);

    const stored = await prisma.ticket.findUnique({ where: { id: result.ticket.id } });
    expect(stored).not.toBeNull();
  });

  it('does not double-spend when two purchases race with only enough points for one (real DB)', async () => {
    await prisma.user.update({ where: { id: userId }, data: { points: 1000 } });

    const outcomes = await Promise.allSettled([
      purchaseTicketForUser(userId, { isAuto: true }),
      purchaseTicketForUser(userId, { isAuto: true }),
    ]);

    const fulfilled = outcomes.filter((o) => o.status === 'fulfilled');
    const rejected = outcomes.filter((o): o is PromiseRejectedResult => o.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBeInstanceOf(InsufficientPointsError);

    const finalUser = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const ticketCount = await prisma.ticket.count({ where: { userId } });

    expect(ticketCount).toBe(2); // 1 from the previous test + 1 from this race
    expect(finalUser.points).toBeGreaterThanOrEqual(0);
  });
});
