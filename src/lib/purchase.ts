import { validateChosenNumbers, ValidationError } from './validation';
import { calculateRank, RANK_MULTIPLIER, TICKET_COST } from './rank';
import { generateAutoPick, generateDraw } from './draw';

export class InsufficientPointsError extends Error {}

export interface TicketCreateData {
  userId: string;
  chosenNumbers: number[];
  isAuto: boolean;
  drawnNumbers: number[];
  bonusNumber: number;
  rank: number | null;
  pointsSpent: number;
  pointsWon: number;
}

export interface TicketRecord extends TicketCreateData {
  id: string;
  createdAt: Date;
}

export interface PurchaseDb {
  user: {
    findUniqueOrThrow(args: { where: { id: string } }): Promise<{ id: string; points: number }>;
    update(args: { where: { id: string }; data: { points: number } }): Promise<{ id: string; points: number }>;
  };
  ticket: {
    create(args: { data: TicketCreateData }): Promise<TicketRecord>;
  };
}

export interface PurchaseInput {
  chosenNumbers?: number[];
  isAuto: boolean;
}

export interface PurchaseDeps {
  draw: () => { drawnNumbers: number[]; bonusNumber: number };
}

const defaultDeps: PurchaseDeps = { draw: generateDraw };

export interface PurchaseResult {
  ticket: TicketRecord;
  pointsBalance: number;
}

export async function purchaseTicket(
  db: PurchaseDb,
  userId: string,
  input: PurchaseInput,
  deps: PurchaseDeps = defaultDeps
): Promise<PurchaseResult> {
  const chosenNumbers = input.isAuto ? generateAutoPick() : sortedValidNumbers(input.chosenNumbers);

  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.points < TICKET_COST) {
    throw new InsufficientPointsError('포인트가 부족합니다.');
  }

  const { drawnNumbers, bonusNumber } = deps.draw();
  const rank = calculateRank(chosenNumbers, drawnNumbers, bonusNumber);
  const pointsWon = rank ? TICKET_COST * RANK_MULTIPLIER[rank] : 0;

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: { points: user.points - TICKET_COST + pointsWon },
  });

  const ticket = await db.ticket.create({
    data: {
      userId,
      chosenNumbers,
      isAuto: input.isAuto,
      drawnNumbers,
      bonusNumber,
      rank,
      pointsSpent: TICKET_COST,
      pointsWon,
    },
  });

  return { ticket, pointsBalance: updatedUser.points };
}

function sortedValidNumbers(numbers: number[] | undefined): number[] {
  if (!numbers) {
    throw new ValidationError('번호는 정확히 6개를 선택해야 합니다.');
  }
  validateChosenNumbers(numbers);
  return [...numbers].sort((a, b) => a - b);
}
