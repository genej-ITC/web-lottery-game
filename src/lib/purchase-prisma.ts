import { prisma } from './prisma';
import { purchaseTicket, type PurchaseInput, type PurchaseResult } from './purchase';

export async function purchaseTicketForUser(userId: string, input: PurchaseInput): Promise<PurchaseResult> {
  return prisma.$transaction((tx) => purchaseTicket(tx, userId, input));
}
