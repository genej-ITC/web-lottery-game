# Design: 웹 복권 게임 (번호 추첨형, 포인트제)

- **Source PRD**: `../../../../PRD_web_lottery_game.md` (C:\Claude\PRJ\PRD_web_lottery_game.md)
- **Status**: Approved for implementation planning
- **Date**: 2026-09-05

## 1. Scope

P0 요구사항(회원가입/로그인, 번호 선택, 추첨, 당첨 판정, 결과/히스토리 조회, 반응형 UI)을 완전히 동작하는 상태로 구현한다. P1(연출 애니메이션 등)은 P0 완료 후 여유가 있을 때 추가하는 stretch scope로 취급하며 이 스펙의 완료 기준에는 포함하지 않는다.

## 2. Resolved Open Questions

PRD의 Open Questions는 다음과 같이 확정되었다.

| 항목 | 결정 |
|---|---|
| 추첨 주기 | 즉시 추첨 (구매와 동시에 서버가 즉석으로 추첨) |
| 인증 방식 | 이메일 가입만 (게스트 플레이 없음) |
| 기술 스택 | Next.js 14 (App Router, TypeScript) 풀스택 |
| DB/배포 | Supabase(PostgreSQL) + Vercel |
| 포인트 밸런스 | 아래 3절 참조 |

## 3. 포인트 및 배당 규칙

- 신규 가입 시 지급: **10,000P**
- 번호 1세트(6개) 구매 비용: **1,000P**
- 등수 판정 (선택 6개 vs 당첨 6개 + 보너스 1개 비교):

| 등수 | 조건 | 배당 |
|---|---|---|
| 1등 | 6개 일치 | 1,000배 |
| 2등 | 5개 일치 + 보너스 일치 | 100배 |
| 3등 | 5개 일치 | 20배 |
| 4등 | 4개 일치 | 5배 |
| 5등 | 3개 일치 | 2배 |
| 낙첨 | 그 외 | 0 |

당첨금 = 구매비용(1,000P) × 배당 배율. 낙첨 시 환급 없음.

## 4. 아키텍처

- **프레임워크**: Next.js 14, App Router, TypeScript, Tailwind CSS
- **ORM/DB**: Prisma + PostgreSQL(Supabase)
- **인증**: NextAuth.js, Credentials Provider, Prisma Adapter, JWT 세션(새로고침 후에도 로그인 유지)
- **비밀번호 해시**: bcrypt
- **난수 생성**: Node.js `crypto.randomInt` (서버 전용 코드 경로에서만 호출, 클라이언트로 절대 전달되지 않음)
- **배포**: Vercel (프론트+API 통합), Supabase(DB 호스팅)

"즉시 추첨" 방식이므로 여러 사용자가 공유하는 회차(Draw) 개념이 없다 — 각 티켓 구매가 그 자리에서 독립적으로 추첨되는 즉석 복권 구조다. 따라서 별도 Draw 테이블 없이 Ticket에 추첨 결과를 직접 저장한다.

## 5. 데이터 모델 (Prisma schema 초안)

```prisma
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
  chosenNumbers Int[]    // length 6, values 1-45, sorted ascending
  isAuto        Boolean  @default(false)
  drawnNumbers  Int[]    // length 6, values 1-45, sorted ascending
  bonusNumber   Int      // 1-45, distinct from drawnNumbers
  rank          Int?     // 1-5, null = 낙첨
  pointsSpent   Int
  pointsWon     Int      @default(0)
  createdAt     DateTime @default(now())

  @@index([userId, createdAt])
  @@index([createdAt])
}
```

`chosenNumbers`/`drawnNumbers`를 Int[]로 저장해 등수 판정 로직에서 배열 교집합 계산만 하면 되도록 한다.

## 6. 핵심 게임 루프

서버 액션 `purchaseTicket(chosenNumbers: number[] | 'auto')`가 다음을 **하나의 Prisma 트랜잭션**으로 원자적 처리한다:

1. 세션에서 userId 확인 (미인증 시 거부)
2. `isAuto`면 서버에서 1~45 중 6개 랜덤 선택, 아니면 클라이언트가 보낸 6개 검증(범위 1-45, 중복 없음, 정확히 6개 — 서버 재검증 필수)
3. `user.points >= 1000` 확인 → 부족하면 트랜잭션 중단, 명확한 에러 반환
4. `points -= 1000`
5. `crypto.randomInt(1, 46)`로 중복 없는 6개 당첨번호 + 1개 보너스번호(당첨번호와 중복 안 되게) 생성
6. 일치 개수 계산 → 등수 판정 (3절 표 적용)
7. 당첨이면 `pointsWon = 1000 * 배율`, `points += pointsWon`
8. Ticket 레코드 생성, 갱신된 User 반환

등수 판정 로직(`calculateRank(chosen, drawn, bonus)`)은 DB/세션에 의존하지 않는 순수 함수로 분리해 단위 테스트가 가능하게 한다.

## 7. 인증 흐름

- **회원가입**: 서버 액션에서 이메일 형식/중복 검증 → bcrypt 해시 → User 생성(points=10000 기본값) → 자동 로그인
- **로그인**: NextAuth Credentials provider, 이메일+비밀번호 검증
- **세션 유지**: JWT 전략, 새로고침해도 로그인 상태 유지
- **보호 라우트**: `/play`, `/history`는 미인증 시 `/login`으로 리다이렉트. `/results`는 인증 불필요(공개)

## 8. 페이지 구성

| 경로 | 설명 | 인증 |
|---|---|---|
| `/signup` | 이메일/비밀번호 가입 | 불필요 |
| `/login` | 로그인 | 불필요 |
| `/play` | 1~45 번호 그리드에서 정확히 6개 선택 또는 자동선택, 구매 버튼, 구매 즉시 결과 모달(당첨번호/보너스/등수/당첨금 표시) | 필요 |
| `/history` | 내 구매·당첨 내역 시간순 목록, 포인트 잔액 표시 | 필요 |
| `/results` | 최근 추첨 결과(당첨번호) 공개 목록, 유저 식별 정보 없이 표시 | 불필요 |

번호 선택 그리드는 6개 초과 선택 시 추가 선택 차단 + 안내 문구, 6개 미만 상태에서 구매 버튼 비활성화로 처리한다. Tailwind 반응형 브레이크포인트로 데스크톱/모바일 레이아웃을 대응한다.

## 9. 에러 처리

- 번호 개수 오류(≠6개): 클라이언트 즉시 검증 + 서버 액션에서도 재검증(방어적 이중 체크)
- 포인트 부족: 구매 요청 자체를 트랜잭션 진입 전에 차단, "포인트가 부족합니다" 안내와 함께 구매 버튼 비활성화
- 이메일 중복 가입: 가입 폼에 "이미 가입된 이메일입니다" 표시
- 로그인 실패: NextAuth 표준 에러를 사용자 친화적 문구로 매핑

## 10. 테스트 전략

- **단위 테스트**: `calculateRank` 순수 함수 — 6개 일치/5개+보너스/5개/4개/3개/낙첨 각 케이스, 경계값(보너스 번호가 당첨번호와 겹치는 이상 상태 등)
- **통합 테스트**: `purchaseTicket` 트랜잭션 — 정상 구매, 잔액 부족 시 차단, 자동선택 시 중복 없는 6개 생성 검증
- **E2E 테스트(Playwright)**: 회원가입 → 로그인 → 번호 선택/구매 → 결과 확인 → 히스토리 조회까지 최소 1개 시나리오가 오류 없이 완주하는지 검증

## 11. Non-Goals (PRD 승계)

실제 현금/결제 연동, 대규모 동시접속 최적화, 모바일 네이티브 앱, 소셜 기능, 고급 관리자 대시보드는 이번 스펙 범위에서 제외한다.

## 12. Out of Scope for this Spec (later, if time permits)

- P1: 추첨 연출 애니메이션, 리더보드, 당첨 알림, 즐겨찾는 번호 저장
- P2: 소셜 로그인, SNS 공유, 관리자 통계, 다국어
