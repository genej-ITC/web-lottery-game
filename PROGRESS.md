# 진행 상황 (2026-09-05)

> 이 문서는 사람이 읽는 진행 상황 요약입니다. 상세한 태스크별 리뷰 기록은
> `.superpowers/sdd/2026-09-05-web-lottery-game/progress.md`(git에는 커밋 안 됨, 로컬 전용)에 있습니다.

## 요약

PRD → 스펙(`docs/superpowers/specs/2026-09-05-web-lottery-game-design.md`) → 구현 계획(`docs/superpowers/plans/2026-09-05-web-lottery-game.md`)까지 확정한 뒤,
19개 태스크 중 **18개를 완료**했습니다 (Task 18의 자동화 E2E 테스트만 이 개발 환경의 제약으로 "실행 확인"까지는 못함 — 아래 참고).

- 단위/통합 테스트: **25/25 통과**
- `tsc --noEmit`: 클린
- `npm run build`: 성공 (모든 라우트 정상 생성)
- 실제 Supabase DB 연결 및 마이그레이션: 완료
- 실서버 기동 후 수동 스모크 테스트(curl): `/`, `/signup`, `/login` 200 / `/play` 미로그인 시 `/login`으로 307 리다이렉트 / `/results`가 실제 DB 쿼리 성공

## 완료된 것 (구현 + 코드리뷰 통과)

| # | 태스크 | 상태 |
|---|---|---|
| 1 | 프로젝트 스캐폴딩 (Next.js/TS/Tailwind) | ✅ |
| 2 | Prisma 스키마 + 클라이언트 | ✅ |
| 3 | 번호 선택 검증 | ✅ |
| 4 | 등수 판정 로직 | ✅ |
| 5 | 안전한 추첨(RNG) 로직 | ✅ |
| 6 | 구매 트랜잭션 오케스트레이션 | ✅ |
| 7 | Supabase 프로비저닝 + 마이그레이션 (수동) | ✅ |
| 8 | Prisma 트랜잭션 어댑터 | ✅ |
| 9 | 회원가입 핵심 로직 | ✅ |
| 10 | NextAuth 연동 | ✅ |
| 11 | 서버 액션(가입/구매) | ✅ |
| 12 | 헤더/네비게이션 | ✅ |
| 13 | 회원가입 페이지 | ✅ |
| 14 | 로그인 페이지 | ✅ |
| 15 | 플레이(번호선택/구매) 페이지 | ✅ |
| 16 | 내 구매 내역 페이지 | ✅ |
| 17 | 공개 추첨 결과 페이지 | ✅ (수정 1건: 정적 렌더링 → 동적 렌더링으로 변경) |
| 18 | E2E 테스트 | ⚠️ 코드는 작성/커밋 완료, **실행은 미확인** (아래 "알려진 이슈" 참고) |
| 19 | README / 배포 가이드 | ✅ |

## 남은 일

1. **Task 18 E2E 테스트 실제 실행 확인** — 아래 "알려진 이슈" 참고. 일반 로컬 PC나 CI에서 `npx playwright install chromium && npm run e2e` 실행 필요.
2. **최종 전체 브랜치 리뷰** (아직 실행 안 함) — 태스크별 리뷰는 다 통과했지만, 전체를 통틀어 보는 마지막 리뷰가 아직 남아있습니다.
3. **Vercel 배포** — 아직 실제 배포는 하지 않았습니다. `.env`에 있는 값(`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`)을 Vercel 프로젝트 환경변수에 등록하고 `NEXTAUTH_URL`을 배포 도메인으로 바꿔야 합니다.
4. (선택) P1 항목: 추첨 연출 애니메이션, 리더보드 등 — PRD상 P0 완료 후 시간 남으면 진행.

## 알려진 이슈: Task 18 (E2E 테스트) 실행 불가

`npx playwright install chromium`을 3번 시도했는데, 매번 **다운로드는 100%(136.2MB) 완료**되지만 그 다음 **압축 해제 단계에서 멈춰서** 끝나지 않았습니다 (`chrome.exe` 파일이 끝까지 생성되지 않음, 10분 이상 대기해도 진행 없음). 이건 이 작업 환경(샌드박스)의 제약으로 보이며, 코드 문제는 아닙니다.

대신 실제 서버를 띄워서 curl로 라우트별 동작을 확인했고, 다음을 확인했습니다:
- 미인증 상태에서 `/play` 접근 시 서버가 정확히 `/login`으로 리다이렉트 (307)
- `/results`가 실제 Supabase DB에 쿼리를 날려서 정상 응답 (빈 결과 상태 "아직 추첨 결과가 없습니다" 정상 표시)
- 25개 단위/통합 테스트가 이미 회원가입/구매/추첨/등수판정 로직을 실제로 검증함 (mock이 아닌 실동작 검증)

**다음에 이 프로젝트를 이어서 진행할 때**, 일반 개발 PC(샌드박스 아닌 환경)나 GitHub Actions 같은 CI에서 아래 명령으로 E2E 테스트를 한 번 실행해서 최종 확인하는 걸 권장합니다:
```
npx playwright install chromium
npm run e2e
```

## 주요 결정사항 (Rulings)

- **DB 연결**: Supabase 직접 연결 호스트(`db.<ref>.supabase.co`)가 IPv6 전용이라 이 환경에서 접속 불가 → Connection Pooler로 전환. `DATABASE_URL`은 트랜잭션 풀러(6543, pgbouncer), `DIRECT_URL`은 세션 풀러(5432, 마이그레이션용)로 분리. `prisma/schema.prisma`에 `directUrl` 추가 (Supabase의 공식 Prisma 연동 가이드 방식).
- **`/results` 페이지 렌더링 수정**: 원래 플랜의 코드에는 동적 렌더링 지시자가 빠져 있어서, 빌드 시점에 데이터가 고정되는(정적 스냅샷) 버그가 있었습니다. `export const dynamic = 'force-dynamic'`을 추가해서 항상 최신 데이터를 보여주도록 수정했습니다.
- **비밀번호 해시**: 스펙대로 bcryptjs 사용 (네이티브 bcrypt 대신, Windows 빌드 이슈 회피).

## 재개 방법

다음에 이어서 하려면:
1. `.superpowers/sdd/2026-09-05-web-lottery-game/progress.md`를 먼저 읽어서 상세 이력 확인
2. Task 18 E2E 테스트를 실행 가능한 환경에서 돌려서 확인
3. 최종 전체 브랜치 리뷰 진행 (`superpowers:requesting-code-review`의 code-reviewer, 가장 강력한 모델로)
4. 문제 없으면 Vercel 배포 진행
