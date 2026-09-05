import { describe, expect, it } from 'vitest';
import {
  purchaseTicket,
  InsufficientPointsError,
  type PurchaseDb,
  type TicketCreateData,
  type TicketRecord,
} from '@/lib/purchase';
import { ValidationError } from '@/lib/validation';

function createFakeDb(initialPoints: number) {
  let points = initialPoints;
  const tickets: TicketRecord[] = [];
  let nextId = 1;

  const db: PurchaseDb = {
    user: {
      async findUniqueOrThrow() {
        return { id: 'user-1', points };
      },
      async update({ data }) {
        points = data.points;
        return { id: 'user-1', points };
      },
    },
    ticket: {
      async create({ data }: { data: TicketCreateData }) {
        const record: TicketRecord = { ...data, id: `ticket-${nextId++}`, createdAt: new Date() };
        tickets.push(record);
        return record;
      },
    },
  };

  return { db, tickets, getPoints: () => points };
}

describe('purchaseTicket', () => {
  it('deducts the ticket cost and credits winnings on a winning ticket', async () => {
    const { db, tickets, getPoints } = createFakeDb(10000);
    const fixedDraw = () => ({ drawnNumbers: [1, 2, 3, 4, 5, 6], bonusNumber: 7 });

    const result = await purchaseTicket(
      db,
      'user-1',
      { chosenNumbers: [1, 2, 3, 4, 5, 6], isAuto: false },
      { draw: fixedDraw }
    );

    expect(result.ticket.rank).toBe(1);
    expect(result.ticket.pointsWon).toBe(1_000_000);
    expect(getPoints()).toBe(10000 - 1000 + 1_000_000);
    expect(tickets).toHaveLength(1);
  });

  it('deducts only the ticket cost on a losing ticket', async () => {
    const { db, getPoints } = createFakeDb(10000);
    const fixedDraw = () => ({ drawnNumbers: [10, 11, 12, 13, 14, 15], bonusNumber: 16 });

    const result = await purchaseTicket(
      db,
      'user-1',
      { chosenNumbers: [1, 2, 3, 4, 5, 6], isAuto: false },
      { draw: fixedDraw }
    );

    expect(result.ticket.rank).toBeNull();
    expect(result.ticket.pointsWon).toBe(0);
    expect(getPoints()).toBe(10000 - 1000);
  });

  it('throws InsufficientPointsError and makes no changes when points are too low', async () => {
    const { db, tickets, getPoints } = createFakeDb(500);

    await expect(
      purchaseTicket(db, 'user-1', { chosenNumbers: [1, 2, 3, 4, 5, 6], isAuto: false })
    ).rejects.toThrow(InsufficientPointsError);

    expect(getPoints()).toBe(500);
    expect(tickets).toHaveLength(0);
  });

  it('throws ValidationError for an invalid manual selection', async () => {
    const { db } = createFakeDb(10000);

    await expect(
      purchaseTicket(db, 'user-1', { chosenNumbers: [1, 2, 3], isAuto: false })
    ).rejects.toThrow(ValidationError);
  });

  it('auto-picks 6 unique numbers when isAuto is true', async () => {
    const { db } = createFakeDb(10000);

    const result = await purchaseTicket(db, 'user-1', { isAuto: true });

    expect(result.ticket.chosenNumbers).toHaveLength(6);
    expect(new Set(result.ticket.chosenNumbers).size).toBe(6);
  });
});
