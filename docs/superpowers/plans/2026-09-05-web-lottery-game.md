# Web Lottery Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack web lottery game (Next.js + Prisma + PostgreSQL/Supabase) where users sign up, buy 6-number tickets with virtual points, get an instant server-side draw, and can review their history and the public results feed.

**Architecture:** Next.js 14 App Router monolith (frontend + API via Server Actions/route handlers), Prisma ORM against PostgreSQL (Supabase), NextAuth Credentials provider with JWT sessions. Core game logic (number validation, rank calculation, secure RNG, purchase orchestration) is written as pure/injectable functions first and unit/integration tested with fakes, then wired to the real Prisma client — this keeps the money-and-randomness logic testable without a live database.

**Tech Stack:** Next.js 14.2, React 18, TypeScript 5, Tailwind CSS 3, Prisma 5 + PostgreSQL, NextAuth 4 (Credentials + Prisma adapter), bcryptjs, Vitest (unit/integration), Playwright (E2E), deployed to Vercel with Supabase as the database.

**Spec:** `docs/superpowers/specs/2026-09-05-web-lottery-game-design.md`

## Global Constraints

- All user-facing copy (labels, buttons, error messages) is Korean, matching the spec's page/error tables.
- Number selection: exactly 6 unique integers in [1, 45]; server re-validates even when the client already validated.
- Points: signup grant is 10,000P; one ticket costs 1,000P; payout multipliers are 1st=1000x, 2nd=100x, 3rd=20x, 4th=5x, 5th=2x (spec section 3) — no other rank tiers exist.
- Draw mechanism: numbers are drawn server-side only via Node's `crypto.randomInt`; the client never computes or receives unrevealed draw logic.
- No shared "Draw" entity — each `Ticket` row stores its own instant-draw result (spec section 4).
- Auth: email/password only (no guest play), sessions persist across reloads via NextAuth JWT strategy.
- Password hashing uses `bcryptjs` (pure JS) instead of native `bcrypt`, to avoid requiring a native build toolchain on Windows dev machines — functionally equivalent to the spec's hashing requirement.
- Database is PostgreSQL via Supabase in both local dev and production; deployment target is Vercel.
- Protected routes (`/play`, `/history`) redirect unauthenticated users to `/login`; `/results` is public.

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/globals.css`
- Create: `src/components/Providers.tsx`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a buildable Next.js project skeleton; `Providers` component wrapping `SessionProvider` for later auth-aware pages; path alias `@/*` → `src/*`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "web-lottery-game",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "next-auth": "4.24.7",
    "@prisma/client": "5.14.0",
    "bcryptjs": "2.4.3"
  },
  "devDependencies": {
    "typescript": "5.4.5",
    "@types/node": "20.12.12",
    "@types/react": "18.3.2",
    "@types/react-dom": "18.3.0",
    "@types/bcryptjs": "2.4.6",
    "prisma": "5.14.0",
    "tailwindcss": "3.4.3",
    "postcss": "8.4.38",
    "autoprefixer": "10.4.19",
    "vitest": "1.6.0",
    "@playwright/test": "1.44.1",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.15"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
```

- [ ] **Step 4: Create `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: Create `postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 7: Create `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

- [ ] **Step 8: Create `.gitignore`**

```
node_modules
.next
.env
.env.local
dist
coverage
playwright-report
test-results
```

- [ ] **Step 9: Create `.env.example`**

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/lottery?schema=public"
NEXTAUTH_SECRET="replace-with-a-random-32-byte-base64-string"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 10: Create `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 11: Create `src/components/Providers.tsx`**

```tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 12: Create `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: '웹 복권 게임',
  description: '포인트로 즐기는 번호 추첨형 복권 게임',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 13: Create `src/app/page.tsx`**

```tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">웹 복권 게임</h1>
      <p className="text-gray-600">
        가상 포인트로 번호를 구매하고 즉석에서 추첨 결과를 확인해보세요.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className="rounded bg-blue-600 px-4 py-2 text-white">
          회원가입
        </Link>
        <Link href="/login" className="rounded border border-blue-600 px-4 py-2 text-blue-600">
          로그인
        </Link>
      </div>
      <Link href="/results" className="text-sm text-gray-500 underline">
        최신 추첨 결과 보기
      </Link>
    </main>
  );
}
```

- [ ] **Step 14: Install dependencies and verify the build**

Run: `npm install`
Expected: installs without errors.

Run: `npm run build`
Expected: `✓ Compiled successfully` and a static/SSR summary for `/`, `/signup`... wait, only `/` exists yet — expect a successful build listing route `/`.

- [ ] **Step 15: Commit**

```bash
git add package.json tsconfig.json next.config.js tailwind.config.ts postcss.config.js vitest.config.ts playwright.config.ts .gitignore .env.example src
git commit -m "chore: scaffold Next.js + TypeScript + Tailwind project"
```

---

## Task 2: Prisma Schema and Client Singleton

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Modify: `package.json` (add `postinstall`, `prisma:generate`, `prisma:migrate` scripts)

**Interfaces:**
- Consumes: `.env` file providing `DATABASE_URL` (from Task 1's `.env.example`, copied by the developer).
- Produces: `prisma` — a singleton `PrismaClient` instance importable from `@/lib/prisma`, and the generated Prisma types (`User`, `Ticket`) used by every later task that touches the database.

- [ ] **Step 1: Create `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  points       Int      @default(10000)
  createdAt    DateTime @default(now())
  tickets      Ticket[]
}

model Ticket {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  chosenNumbers Int[]
  isAuto        Boolean  @default(false)
  drawnNumbers  Int[]
  bonusNumber   Int
  rank          Int?
  pointsSpent   Int
  pointsWon     Int      @default(0)
  createdAt     DateTime @default(now())

  @@index([userId, createdAt])
  @@index([createdAt])
}
```

- [ ] **Step 2: Create `src/lib/prisma.ts`**

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 3: Modify `package.json` scripts**

Add these entries to the `"scripts"` object:

```json
"postinstall": "prisma generate",
"prisma:generate": "prisma generate",
"prisma:migrate": "prisma migrate dev"
```

- [ ] **Step 4: Create a local `.env` and generate the Prisma client**

Run: `cp .env.example .env` (Windows PowerShell: `Copy-Item .env.example .env`)
Run: `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

Run: `npx prisma generate`
Expected: `✔ Generated Prisma Client` — this only needs `DATABASE_URL` to be a non-empty string, not a reachable database, so the placeholder value from `.env.example` is fine at this step.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma src/lib/prisma.ts package.json
git commit -m "feat: add Prisma schema and client singleton"
```

---

## Task 3: Number Selection Validation

**Files:**
- Create: `src/lib/validation.ts`
- Test: `tests/unit/validation.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `ValidationError` class and `validateChosenNumbers(numbers: number[]): void` (throws on invalid input, returns nothing on valid input) — used by `purchase.ts` (Task 6) and the `/play` UI (Task 15).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/validation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { validateChosenNumbers, ValidationError } from '@/lib/validation';

describe('validateChosenNumbers', () => {
  it('accepts exactly 6 unique numbers in range', () => {
    expect(() => validateChosenNumbers([1, 2, 3, 4, 5, 6])).not.toThrow();
  });

  it('rejects fewer than 6 numbers', () => {
    expect(() => validateChosenNumbers([1, 2, 3])).toThrow(ValidationError);
  });

  it('rejects more than 6 numbers', () => {
    expect(() => validateChosenNumbers([1, 2, 3, 4, 5, 6, 7])).toThrow(ValidationError);
  });

  it('rejects duplicate numbers', () => {
    expect(() => validateChosenNumbers([1, 1, 2, 3, 4, 5])).toThrow(ValidationError);
  });

  it('rejects numbers outside 1-45', () => {
    expect(() => validateChosenNumbers([0, 2, 3, 4, 5, 6])).toThrow(ValidationError);
    expect(() => validateChosenNumbers([1, 2, 3, 4, 5, 46])).toThrow(ValidationError);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/validation.test.ts`
Expected: FAIL — `Cannot find module '@/lib/validation'`

- [ ] **Step 3: Implement `src/lib/validation.ts`**

```ts
export class ValidationError extends Error {}

export function validateChosenNumbers(numbers: number[]): void {
  if (numbers.length !== 6) {
    throw new ValidationError('번호는 정확히 6개를 선택해야 합니다.');
  }

  const unique = new Set(numbers);
  if (unique.size !== 6) {
    throw new ValidationError('중복된 번호는 선택할 수 없습니다.');
  }

  for (const n of numbers) {
    if (!Number.isInteger(n) || n < 1 || n > 45) {
      throw new ValidationError('번호는 1부터 45 사이의 정수여야 합니다.');
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/validation.test.ts`
Expected: all 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation.ts tests/unit/validation.test.ts
git commit -m "feat: add chosen-numbers validation"
```

---

## Task 4: Rank Calculation

**Files:**
- Create: `src/lib/rank.ts`
- Test: `tests/unit/rank.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `TICKET_COST` (number, 1000), `RANK_MULTIPLIER` (`Record<number, number>`), `calculateRank(chosenNumbers: number[], drawnNumbers: number[], bonusNumber: number): number | null` — used by `purchase.ts` (Task 6) and rendered by `/play`, `/history` pages (Tasks 15-16).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/rank.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { calculateRank, RANK_MULTIPLIER, TICKET_COST } from '@/lib/rank';

describe('calculateRank', () => {
  it('returns 1st place for 6 matches', () => {
    expect(calculateRank([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], 7)).toBe(1);
  });

  it('returns 2nd place for 5 matches plus the bonus number', () => {
    expect(calculateRank([1, 2, 3, 4, 5, 7], [1, 2, 3, 4, 5, 6], 7)).toBe(2);
  });

  it('returns 3rd place for 5 matches without the bonus number', () => {
    expect(calculateRank([1, 2, 3, 4, 5, 20], [1, 2, 3, 4, 5, 6], 7)).toBe(3);
  });

  it('returns 4th place for 4 matches', () => {
    expect(calculateRank([1, 2, 3, 4, 20, 21], [1, 2, 3, 4, 5, 6], 7)).toBe(4);
  });

  it('returns 5th place for 3 matches', () => {
    expect(calculateRank([1, 2, 3, 20, 21, 22], [1, 2, 3, 4, 5, 6], 7)).toBe(5);
  });

  it('returns null for fewer than 3 matches', () => {
    expect(calculateRank([1, 2, 20, 21, 22, 23], [1, 2, 3, 4, 5, 6], 7)).toBeNull();
  });

  it('exposes the ticket cost and per-rank payout multipliers', () => {
    expect(TICKET_COST).toBe(1000);
    expect(RANK_MULTIPLIER).toEqual({ 1: 1000, 2: 100, 3: 20, 4: 5, 5: 2 });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/rank.test.ts`
Expected: FAIL — `Cannot find module '@/lib/rank'`

- [ ] **Step 3: Implement `src/lib/rank.ts`**

```ts
export const TICKET_COST = 1000;

export const RANK_MULTIPLIER: Record<number, number> = {
  1: 1000,
  2: 100,
  3: 20,
  4: 5,
  5: 2,
};

export function calculateRank(
  chosenNumbers: number[],
  drawnNumbers: number[],
  bonusNumber: number
): number | null {
  const drawnSet = new Set(drawnNumbers);
  const matches = chosenNumbers.filter((n) => drawnSet.has(n)).length;

  if (matches === 6) return 1;
  if (matches === 5 && chosenNumbers.includes(bonusNumber)) return 2;
  if (matches === 5) return 3;
  if (matches === 4) return 4;
  if (matches === 3) return 5;
  return null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/rank.test.ts`
Expected: all 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/rank.ts tests/unit/rank.test.ts
git commit -m "feat: add lottery rank calculation"
```

---

## Task 5: Secure Draw Generation

**Files:**
- Create: `src/lib/draw.ts`
- Test: `tests/unit/draw.test.ts`

**Interfaces:**
- Consumes: nothing (uses Node's built-in `crypto.randomInt`)
- Produces: `pickUniqueNumbers(count: number, max: number, exclude?: Set<number>): number[]`, `generateAutoPick(): number[]`, `generateDraw(): { drawnNumbers: number[]; bonusNumber: number }` — used by `purchase.ts` (Task 6).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/draw.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generateAutoPick, generateDraw, pickUniqueNumbers } from '@/lib/draw';

describe('pickUniqueNumbers', () => {
  it('returns the requested count of unique, sorted numbers within range', () => {
    for (let i = 0; i < 200; i++) {
      const numbers = pickUniqueNumbers(6, 45);
      expect(numbers).toHaveLength(6);
      expect(new Set(numbers).size).toBe(6);
      for (const n of numbers) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(45);
      }
      expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    }
  });

  it('never returns numbers from the exclude set', () => {
    const exclude = new Set([1, 2, 3, 4, 5, 6]);
    for (let i = 0; i < 100; i++) {
      const [n] = pickUniqueNumbers(1, 45, exclude);
      expect(exclude.has(n)).toBe(false);
    }
  });
});

describe('generateAutoPick', () => {
  it('returns 6 unique numbers between 1 and 45', () => {
    const numbers = generateAutoPick();
    expect(numbers).toHaveLength(6);
    expect(new Set(numbers).size).toBe(6);
  });
});

describe('generateDraw', () => {
  it('returns 6 drawn numbers and a bonus number not among them', () => {
    for (let i = 0; i < 200; i++) {
      const { drawnNumbers, bonusNumber } = generateDraw();
      expect(drawnNumbers).toHaveLength(6);
      expect(new Set(drawnNumbers).size).toBe(6);
      expect(drawnNumbers.includes(bonusNumber)).toBe(false);
      expect(bonusNumber).toBeGreaterThanOrEqual(1);
      expect(bonusNumber).toBeLessThanOrEqual(45);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/draw.test.ts`
Expected: FAIL — `Cannot find module '@/lib/draw'`

- [ ] **Step 3: Implement `src/lib/draw.ts`**

```ts
import { randomInt } from 'crypto';

export function pickUniqueNumbers(count: number, max: number, exclude: Set<number> = new Set()): number[] {
  const picked = new Set<number>();
  while (picked.size < count) {
    const n = randomInt(1, max + 1);
    if (!exclude.has(n)) {
      picked.add(n);
    }
  }
  return Array.from(picked).sort((a, b) => a - b);
}

export function generateAutoPick(): number[] {
  return pickUniqueNumbers(6, 45);
}

export function generateDraw(): { drawnNumbers: number[]; bonusNumber: number } {
  const drawnNumbers = pickUniqueNumbers(6, 45);
  const [bonusNumber] = pickUniqueNumbers(1, 45, new Set(drawnNumbers));
  return { drawnNumbers, bonusNumber };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/draw.test.ts`
Expected: all 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/draw.ts tests/unit/draw.test.ts
git commit -m "feat: add secure server-side draw generation"
```

---

## Task 6: Purchase Orchestration (Injectable DB)

**Files:**
- Create: `src/lib/purchase.ts`
- Test: `tests/integration/purchase.test.ts`

**Interfaces:**
- Consumes: `validateChosenNumbers`/`ValidationError` (Task 3), `calculateRank`/`RANK_MULTIPLIER`/`TICKET_COST` (Task 4), `generateAutoPick`/`generateDraw` (Task 5).
- Produces: `InsufficientPointsError`, `PurchaseDb` interface, `TicketCreateData`, `TicketRecord`, `PurchaseInput`, `PurchaseDeps`, `PurchaseResult`, and `purchaseTicket(db, userId, input, deps?): Promise<PurchaseResult>` — used by `purchase-prisma.ts` (Task 8) with the real Prisma transaction client.

`PurchaseDb` is a minimal structural interface (only the methods this function needs). A real `Prisma.TransactionClient` satisfies it structurally, so production code (Task 8) can pass the live transaction client directly with no adapter/mapping layer; tests pass an in-memory fake instead.

- [ ] **Step 1: Write the failing test**

Create `tests/integration/purchase.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/integration/purchase.test.ts`
Expected: FAIL — `Cannot find module '@/lib/purchase'`

- [ ] **Step 3: Implement `src/lib/purchase.ts`**

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/integration/purchase.test.ts`
Expected: all 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/purchase.ts tests/integration/purchase.test.ts
git commit -m "feat: add purchase orchestration with injectable DB and RNG"
```

---

## Task 7: Supabase Provisioning and Migration (Manual Setup)

**This task requires a human with browser/Supabase-account access — it cannot be completed by an autonomous agent.** Every task after this one that touches a live database (Tasks 10, 11, 16, 17, 18) depends on it being done first. Tasks 1-6, 8, 9, 12-15 do not require a live database and can proceed in parallel with this task.

**Files:**
- Modify: `.env` (not committed)
- Create: `prisma/migrations/**` (generated by the migrate command)

**Interfaces:**
- Consumes: nothing
- Produces: a reachable `DATABASE_URL`, a `NEXTAUTH_SECRET`, and applied migrations creating the `User`/`Ticket` tables — required by every task that runs a real Prisma query.

- [ ] **Step 1: Create a Supabase project**

1. Go to https://supabase.com and sign in (or create an account).
2. Click "New Project", name it `web-lottery-game`, choose a nearby region, set and record a database password.
3. Wait for provisioning to finish (roughly 1-2 minutes).
4. Go to Project Settings → Database → Connection string → "URI" tab, and copy the connection string. Use the direct connection (not the pooled one) for local development and migrations.

- [ ] **Step 2: Configure `.env`**

Set `DATABASE_URL` to the copied connection string (with the real database password substituted in).

Generate `NEXTAUTH_SECRET`:
Run: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
Paste the output as `NEXTAUTH_SECRET` in `.env`. Leave `NEXTAUTH_URL="http://localhost:3000"` for local dev.

- [ ] **Step 3: Apply the Prisma migration**

Run: `npx prisma migrate dev --name init`
Expected: `Your database is now in sync with your schema.` and a new `prisma/migrations/<timestamp>_init/` folder is created.

- [ ] **Step 4: Verify the tables in Supabase**

In the Supabase dashboard, open Table Editor and confirm `User` and `Ticket` tables exist with the columns defined in `prisma/schema.prisma`.

- [ ] **Step 5: Commit the migration (not `.env`)**

```bash
git add prisma/migrations
git commit -m "chore: add initial Prisma migration"
```

---

## Task 8: Prisma-Backed Purchase Adapter

**Files:**
- Create: `src/lib/purchase-prisma.ts`

**Interfaces:**
- Consumes: `prisma` (Task 2), `purchaseTicket`/`PurchaseInput`/`PurchaseResult` (Task 6).
- Produces: `purchaseTicketForUser(userId: string, input: PurchaseInput): Promise<PurchaseResult>` — used by the `/play` server action (Task 11).

- [ ] **Step 1: Implement `src/lib/purchase-prisma.ts`**

```ts
import { prisma } from './prisma';
import { purchaseTicket, type PurchaseInput, type PurchaseResult } from './purchase';

export async function purchaseTicketForUser(userId: string, input: PurchaseInput): Promise<PurchaseResult> {
  return prisma.$transaction((tx) => purchaseTicket(tx, userId, input));
}
```

`tx` (a `Prisma.TransactionClient`) structurally satisfies the `PurchaseDb` interface from Task 6: its `user.findUniqueOrThrow`/`user.update`/`ticket.create` methods accept richer argument objects and return richer objects than `PurchaseDb` requires, which is exactly what structural typing needs — no adapter/mapping code required.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `purchase-prisma.ts`. (This requires Task 2's generated Prisma client; it does not require a reachable database.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/purchase-prisma.ts
git commit -m "feat: wire purchase orchestration to the Prisma transaction client"
```

---

## Task 9: Signup Core Logic (Injectable DB)

**Files:**
- Create: `src/lib/signup.ts`
- Test: `tests/unit/signup.test.ts`

**Interfaces:**
- Consumes: `bcryptjs`
- Produces: `DuplicateEmailError`, `InvalidEmailError`, `SignupDb` interface, `createUser(db, email, password): Promise<{ id: string; email: string; points: number }>` — used by `signup-prisma.ts` (Task 10).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/signup.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import { createUser, DuplicateEmailError, InvalidEmailError, type SignupDb } from '@/lib/signup';

function createFakeDb(existingEmails: string[] = []) {
  const users = new Map(
    existingEmails.map((email) => [email, { id: email, email, passwordHash: '', points: 0 }])
  );
  let nextId = 1;

  const db: SignupDb = {
    user: {
      async findUnique({ where: { email } }) {
        return users.has(email) ? { id: users.get(email)!.id } : null;
      },
      async create({ data }) {
        const record = { id: `user-${nextId++}`, ...data };
        users.set(data.email, record);
        return record;
      },
    },
  };

  return { db, users };
}

describe('createUser', () => {
  it('creates a user with the initial point balance', async () => {
    const { db } = createFakeDb();

    const user = await createUser(db, 'player@example.com', 'correct horse battery staple');

    expect(user.email).toBe('player@example.com');
    expect(user.points).toBe(10000);
  });

  it('hashes the password so the plaintext is never stored', async () => {
    const { db, users } = createFakeDb();
    await createUser(db, 'player@example.com', 'my-password');

    const stored = users.get('player@example.com')!;
    expect(stored.passwordHash).not.toBe('my-password');
    expect(await bcrypt.compare('my-password', stored.passwordHash)).toBe(true);
  });

  it('rejects a duplicate email', async () => {
    const { db } = createFakeDb(['taken@example.com']);

    await expect(createUser(db, 'taken@example.com', 'password123')).rejects.toThrow(DuplicateEmailError);
  });

  it('rejects an invalid email format', async () => {
    const { db } = createFakeDb();

    await expect(createUser(db, 'not-an-email', 'password123')).rejects.toThrow(InvalidEmailError);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/signup.test.ts`
Expected: FAIL — `Cannot find module '@/lib/signup'`

- [ ] **Step 3: Implement `src/lib/signup.ts`**

```ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const INITIAL_POINTS = 10000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class DuplicateEmailError extends Error {}
export class InvalidEmailError extends Error {}

export interface SignupDb {
  user: {
    findUnique(args: { where: { email: string } }): Promise<{ id: string } | null>;
    create(args: {
      data: { email: string; passwordHash: string; points: number };
    }): Promise<{ id: string; email: string; points: number }>;
  };
}

export async function createUser(
  db: SignupDb,
  email: string,
  password: string
): Promise<{ id: string; email: string; points: number }> {
  if (!EMAIL_PATTERN.test(email)) {
    throw new InvalidEmailError('올바른 이메일 형식이 아닙니다.');
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new DuplicateEmailError('이미 가입된 이메일입니다.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return db.user.create({ data: { email, passwordHash, points: INITIAL_POINTS } });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/signup.test.ts`
Expected: all 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/signup.ts tests/unit/signup.test.ts
git commit -m "feat: add signup logic with password hashing"
```

---

## Task 10: Auth Wiring (NextAuth + Prisma)

**Files:**
- Create: `src/lib/signup-prisma.ts`
- Create: `src/lib/auth-options.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/types/next-auth.d.ts`

**Interfaces:**
- Consumes: `prisma` (Task 2), `createUser` (Task 9).
- Produces: `signupUser(email, password)` (Task 9's logic bound to the real DB), `authOptions` (NextAuth config, JWT session carrying `user.id`) — used by server actions (Task 11) and protected pages (Tasks 15-16).

- [ ] **Step 1: Implement `src/lib/signup-prisma.ts`**

```ts
import { prisma } from './prisma';
import { createUser } from './signup';

export async function signupUser(email: string, password: string) {
  return createUser(prisma, email, password);
}
```

- [ ] **Step 2: Implement `src/lib/auth-options.ts`**

```ts
import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) {
          return null;
        }
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }
        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
```

- [ ] **Step 3: Add NextAuth type augmentation, create `src/types/next-auth.d.ts`**

```ts
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}
```

- [ ] **Step 4: Create the route handler `src/app/api/auth/[...nextauth]/route.ts`**

```ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (Does not require a reachable database — only the generated Prisma types.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/signup-prisma.ts src/lib/auth-options.ts src/types/next-auth.d.ts src/app/api/auth
git commit -m "feat: wire NextAuth credentials provider"
```

---

## Task 11: Server Actions (Signup, Purchase)

**Files:**
- Create: `src/app/actions/auth.ts`
- Create: `src/app/play/actions.ts`

**Interfaces:**
- Consumes: `signupUser` (Task 10), `authOptions` (Task 10), `purchaseTicketForUser` (Task 8), `InsufficientPointsError` (Task 6), `ValidationError` (Task 3).
- Produces: `signupAction(email, password): Promise<SignupActionResult>` and `purchaseAction(input): Promise<PurchaseActionResult>` — used by the signup page (Task 13) and play page (Task 15).

- [ ] **Step 1: Implement `src/app/actions/auth.ts`**

```ts
'use server';

import { signupUser } from '@/lib/signup-prisma';
import { DuplicateEmailError, InvalidEmailError } from '@/lib/signup';

export interface SignupActionResult {
  ok: boolean;
  error?: string;
}

export async function signupAction(email: string, password: string): Promise<SignupActionResult> {
  try {
    await signupUser(email, password);
    return { ok: true };
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return { ok: false, error: '이미 가입된 이메일입니다.' };
    }
    if (error instanceof InvalidEmailError) {
      return { ok: false, error: '올바른 이메일 형식이 아닙니다.' };
    }
    return { ok: false, error: '가입 중 오류가 발생했습니다.' };
  }
}
```

- [ ] **Step 2: Implement `src/app/play/actions.ts`**

```ts
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
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/actions/auth.ts src/app/play/actions.ts
git commit -m "feat: add signup and purchase server actions"
```

---

## Task 12: Header/Navigation

**Files:**
- Create: `src/components/Header.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `next-auth/react` (`useSession`, `signOut`).
- Produces: `<Header />` rendered in the root layout on every page.

- [ ] **Step 1: Implement `src/components/Header.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3">
      <Link href="/" className="font-bold">
        웹 복권 게임
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/results">최신 결과</Link>
        {session ? (
          <>
            <Link href="/play">번호 구매</Link>
            <Link href="/history">내 기록</Link>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="text-red-600">
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link href="/login">로그인</Link>
            <Link href="/signup">회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Modify `src/app/layout.tsx` to render the header**

Replace the `<body>` contents:

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: '웹 복권 게임',
  description: '포인트로 즐기는 번호 추첨형 복권 게임',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx src/app/layout.tsx
git commit -m "feat: add site header with session-aware navigation"
```

---

## Task 13: Signup Page

**Files:**
- Create: `src/app/signup/page.tsx`

**Interfaces:**
- Consumes: `signupAction` (Task 11), `signIn` from `next-auth/react`.
- Produces: `/signup` route.

- [ ] **Step 1: Implement `src/app/signup/page.tsx`**

```tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { signupAction } from '@/app/actions/auth';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signupAction(email, password);
    if (!result.ok) {
      setError(result.error ?? '가입 중 오류가 발생했습니다.');
      setSubmitting(false);
      return;
    }

    const signInResult = await signIn('credentials', { email, password, redirect: false });
    setSubmitting(false);
    router.push(signInResult?.ok ? '/play' : '/login');
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">회원가입</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="비밀번호 (8자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          가입하기
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, `/signup` listed as a route.

- [ ] **Step 3: Commit**

```bash
git add src/app/signup/page.tsx
git commit -m "feat: add signup page"
```

---

## Task 14: Login Page

**Files:**
- Create: `src/app/login/page.tsx`

**Interfaces:**
- Consumes: `signIn` from `next-auth/react`.
- Produces: `/login` route.

- [ ] **Step 1: Implement `src/app/login/page.tsx`**

```tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn('credentials', { email, password, redirect: false });
    setSubmitting(false);

    if (result?.ok) {
      router.push('/play');
    } else {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">로그인</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border px-3 py-2"
        />
        <input
          type="password"
          required
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          로그인
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, `/login` listed as a route.

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat: add login page"
```

---

## Task 15: Play Page and Number Grid

**Files:**
- Create: `src/components/NumberGrid.tsx`
- Create: `src/app/play/PlayClient.tsx`
- Create: `src/app/play/page.tsx`

**Interfaces:**
- Consumes: `purchaseAction`/`PurchaseActionResult` (Task 11), `authOptions` (Task 10).
- Produces: `/play` route (redirects to `/login` when unauthenticated).

- [ ] **Step 1: Implement `src/components/NumberGrid.tsx`**

```tsx
'use client';

interface NumberGridProps {
  selected: number[];
  onToggle: (n: number) => void;
}

export function NumberGrid({ selected, onToggle }: NumberGridProps) {
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
      {numbers.map((n) => {
        const isSelected = selected.includes(n);
        const disabled = !isSelected && selected.length >= 6;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(n)}
            className={`aspect-square rounded-full text-sm font-medium ${
              isSelected
                ? 'bg-blue-600 text-white'
                : disabled
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Implement `src/app/play/PlayClient.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { NumberGrid } from '@/components/NumberGrid';
import { purchaseAction, type PurchaseActionResult } from './actions';

const RANK_LABEL: Record<number, string> = {
  1: '1등',
  2: '2등',
  3: '3등',
  4: '4등',
  5: '5등',
};

export function PlayClient() {
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PurchaseActionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggle(n: number) {
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : prev.length < 6 ? [...prev, n] : prev
    );
  }

  async function handlePurchase(isAuto: boolean) {
    setError(null);
    setSubmitting(true);
    const outcome = await purchaseAction(
      isAuto ? { isAuto: true } : { isAuto: false, chosenNumbers: selected }
    );
    setSubmitting(false);

    if (!outcome.ok) {
      setError(outcome.error ?? '구매 중 오류가 발생했습니다.');
      return;
    }

    setResult(outcome);
    setSelected([]);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-bold">번호 선택</h1>
      <p className="mb-4 text-sm text-gray-600">
        1~45 중 정확히 6개를 선택하세요. ({selected.length}/6)
      </p>

      <NumberGrid selected={selected} onToggle={toggle} />

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          disabled={selected.length !== 6 || submitting}
          onClick={() => handlePurchase(false)}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          선택 번호로 구매 (1,000P)
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => handlePurchase(true)}
          className="rounded border border-blue-600 px-4 py-2 text-blue-600 disabled:opacity-50"
        >
          자동 선택 구매
        </button>
      </div>

      {result?.ok && result.ticket && (
        <div className="mt-8 rounded border bg-white p-4">
          <p className="font-semibold">내 번호: {result.ticket.chosenNumbers.join(', ')}</p>
          <p>
            당첨 번호: {result.ticket.drawnNumbers.join(', ')} + 보너스 {result.ticket.bonusNumber}
          </p>
          <p className="mt-2 text-lg font-bold">
            {result.ticket.rank
              ? `${RANK_LABEL[result.ticket.rank]} 당첨! +${result.ticket.pointsWon.toLocaleString()}P`
              : '낙첨'}
          </p>
          <p className="text-sm text-gray-600">현재 잔액: {result.pointsBalance?.toLocaleString()}P</p>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Implement `src/app/play/page.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PlayClient } from './PlayClient';

export default async function PlayPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  return <PlayClient />;
}
```

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, `/play` listed as a route.

- [ ] **Step 5: Commit**

```bash
git add src/components/NumberGrid.tsx src/app/play/PlayClient.tsx src/app/play/page.tsx
git commit -m "feat: add play page with number grid and purchase flow"
```

---

## Task 16: History Page

**Files:**
- Create: `src/app/history/page.tsx`

**Interfaces:**
- Consumes: `authOptions` (Task 10), `prisma` (Task 2). Requires the live database from Task 7 to render real data.
- Produces: `/history` route (redirects to `/login` when unauthenticated).

- [ ] **Step 1: Implement `src/app/history/page.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

const RANK_LABEL: Record<number, string> = {
  1: '1등',
  2: '2등',
  3: '3등',
  4: '4등',
  5: '5등',
};

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
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">내 구매 내역</h1>
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
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, `/history` listed as a route.

- [ ] **Step 3: Commit**

```bash
git add src/app/history/page.tsx
git commit -m "feat: add purchase history page"
```

---

## Task 17: Public Results Page

**Files:**
- Create: `src/app/results/page.tsx`

**Interfaces:**
- Consumes: `prisma` (Task 2). Requires the live database from Task 7 to render real data.
- Produces: `/results` route (public, no auth check).

- [ ] **Step 1: Implement `src/app/results/page.tsx`**

```tsx
import { prisma } from '@/lib/prisma';

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
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, `/results` listed as a route.

- [ ] **Step 3: Commit**

```bash
git add src/app/results/page.tsx
git commit -m "feat: add public results page"
```

---

## Task 18: End-to-End Core Flow Test

**Files:**
- Create: `e2e/core-flow.spec.ts`

**Interfaces:**
- Consumes: the full running application (all previous tasks) and the live database from Task 7.
- Produces: an automated regression check for the PRD's P0 success metric ("가입→선택→구매→추첨→결과 확인까지 오류 없이 완주").

- [ ] **Step 1: Implement `e2e/core-flow.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

function uniqueEmail() {
  return `player-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

test('signup, purchase a ticket, and view history end to end', async ({ page }) => {
  const email = uniqueEmail();
  const password = 'correct horse battery staple';

  await page.goto('/signup');
  await page.getByPlaceholder('이메일').fill(email);
  await page.getByPlaceholder('비밀번호 (8자 이상)').fill(password);
  await page.getByRole('button', { name: '가입하기' }).click();

  await page.waitForURL('**/play');

  await page.getByRole('button', { name: '자동 선택 구매' }).click();
  await expect(page.getByText(/당첨 번호:/)).toBeVisible();

  await page.getByRole('link', { name: '내 기록' }).click();
  await page.waitForURL('**/history');
  await expect(page.getByText(/당첨 번호:/)).toBeVisible();
});
```

- [ ] **Step 2: Run the E2E test**

Ensure `.env` has a working `DATABASE_URL` (Task 7 complete) and migrations are applied.

Run: `npm run e2e`
Expected: 1 passed. Playwright starts the app via `npm run build && npm run start` per `playwright.config.ts`.

- [ ] **Step 3: Commit**

```bash
git add e2e/core-flow.spec.ts
git commit -m "test: add end-to-end core game loop test"
```

---

## Task 19: README and Deployment

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: nothing
- Produces: onboarding documentation and a deployment/QA checklist satisfying the PRD's "5분 내 이해" success metric.

- [ ] **Step 1: Write `README.md`**

```markdown
# 웹 복권 게임

번호 추첨형(로또 6/45식) 포인트제 복권 게임. 실제 현금/상품 없이 가상 포인트로만 동작하는
포트폴리오용 풀스택 웹 프로젝트입니다.

## 기술 스택

- Next.js 14 (App Router, TypeScript)
- Prisma + PostgreSQL (Supabase)
- NextAuth (Credentials Provider, JWT 세션)
- Tailwind CSS
- Vitest (단위/통합 테스트), Playwright (E2E)
- 배포: Vercel

## 로컬 개발 환경 설정

1. `npm install`
2. `.env.example`을 `.env`로 복사하고 다음 값을 채운다:
   - `DATABASE_URL`: Supabase 프로젝트의 Postgres 연결 문자열
   - `NEXTAUTH_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` 결과
   - `NEXTAUTH_URL`: `http://localhost:3000`
3. `npx prisma migrate dev --name init` (최초 1회, DB 스키마 적용)
4. `npm run dev` 후 http://localhost:3000 접속

## 테스트

- 단위/통합 테스트: `npm test`
- E2E 테스트(앱 빌드 후 실행): `npm run e2e`

## 게임 규칙

- 신규 가입 시 10,000P 지급
- 번호 1세트(6개, 1~45) 구매 비용: 1,000P
- 등수: 6개일치=1등(1000배) / 5개+보너스=2등(100배) / 5개=3등(20배) / 4개=4등(5배) / 3개=5등(2배)
- 구매 즉시 서버에서 안전한 난수로 추첨하고 결과를 바로 보여준다

## 배포 (Vercel)

1. GitHub 저장소에 push 후 Vercel에서 해당 저장소를 Import
2. Vercel 프로젝트 환경 변수에 `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`(배포된 도메인)을 설정
3. Deploy 실행 → 배포된 URL에서 회원가입→구매→결과 확인까지 수동으로 1회 확인

## 수동 QA 체크리스트 (배포 후)

- [ ] 데스크톱 브라우저에서 가입→로그인→번호선택→구매→결과 확인까지 오류 없이 완주
- [ ] 모바일 브라우저(또는 뷰포트 축소)에서 동일 플로우 확인, 레이아웃 깨짐 없음
- [ ] 포인트 부족 상태에서 구매 시도 시 안내 문구 노출 확인
- [ ] `/results` 페이지가 로그인 없이 열람 가능한지 확인
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup, testing, and deployment guide"
```

---

## Task Dependency Summary

- Tasks 1-6, 9 have no external dependencies and can be built/tested immediately.
- Task 7 (Supabase provisioning) is manual and should be started early since it can run in parallel with Tasks 1-6/9/12-15.
- Task 8 depends on Tasks 2 and 6. Task 10 depends on Tasks 2 and 9. Task 11 depends on Tasks 8 and 10.
- Tasks 12-15 depend on Task 11 (and Task 10 for protected-route session checks) but not on Task 7 being finished yet (they build/type-check without a live DB).
- Tasks 16-18 require Task 7 to be complete, since they read/write real data.
- Task 19 can be written any time after the core flow is understood, but should be finalized last.
