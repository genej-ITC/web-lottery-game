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
   - `DATABASE_URL`: Supabase 프로젝트의 Connection Pooler(트랜잭션 모드, 6543번 포트, `pgbouncer=true`) 연결 문자열 — 앱 런타임용
   - `DIRECT_URL`: Supabase 프로젝트의 Connection Pooler(세션 모드, 5432번 포트) 연결 문자열 — `prisma migrate`용. Supabase의 직접 DB 호스트(`db.<ref>.supabase.co`)는 IPv6 전용이라 IPv4 환경(로컬 PC, Vercel 서버리스)에서 접속이 안 될 수 있어 풀러를 사용한다
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
2. Vercel 프로젝트 환경 변수에 `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`(배포된 도메인)을 설정
3. Deploy 실행 → 배포된 URL에서 회원가입→구매→결과 확인까지 수동으로 1회 확인

## 수동 QA 체크리스트 (배포 후)

- [ ] 데스크톱 브라우저에서 가입→로그인→번호선택→구매→결과 확인까지 오류 없이 완주
- [ ] 모바일 브라우저(또는 뷰포트 축소)에서 동일 플로우 확인, 레이아웃 깨짐 없음
- [ ] 포인트 부족 상태에서 구매 시도 시 안내 문구 노출 확인
- [ ] `/results` 페이지가 로그인 없이 열람 가능한지 확인
