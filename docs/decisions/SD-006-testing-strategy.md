# SD-006: Testing Strategy

**Date:** 2026-03-08
**Status:** ACTIVE

## Context

onebell is approaching production deployment (P10). The gate previously had a no-op test stub (`echo "No tests configured yet"`). We need real verification before the hull goes to sea.

## Decision

Three-tier testing strategy: **unit → integration → E2E**.

### Tier 1: Unit Tests (Vitest)

Pure functions with no infrastructure dependencies. These run in <1s and are the cheapest verification gate.

| File | Functions | Tests | Mocking |
|------|-----------|-------|---------|
| `lib/sit-utils.test.ts` | `isAvailableNow`, `isExpired`, constants | 14 | `vi.useFakeTimers` only |
| `lib/time.test.ts` | `formatSitTime`, `formatRelativeTime`, `formatTimezone` | 11 | `vi.useFakeTimers` for first two; `formatTimezone` is fully pure |
| `lib/validation.test.ts` | 3 Zod schemas via `.safeParse()` | 24 | `vi.useFakeTimers` for future-date refinement |
| `lib/user-sync.test.ts` | `buildDisplayName` | 7 | None — pure function |
| `components/avatar.test.ts` | `initials`, `avatarClass` | 10 | None — pure functions |
| `lib/html.test.ts` | `escapeHtml` | 8 | None — pure function |

**Total: 74 unit tests across 6 files.**

Coverage focus: boundary conditions (10-minute available-now window, 20-minute expiry), input validation edge cases (empty strings, max lengths, invalid durations), and deterministic behaviour (avatar colour stability).

### Tier 2: Action Orchestration Tests (Vitest + Mocks)

Server actions with mocked auth, DB, email, and cache. These verify the action orchestration logic (validation → auth → mutation → side effects → response) without hitting real infrastructure. They are NOT integration tests — the DB layer, auth, and email are fully mocked. They verify that the action wiring is correct, not that the underlying services work.

| File | Functions | Tests | Mocked Modules |
|------|-----------|-------|----------------|
| `actions/create-sit.test.ts` | `createAvailableNowSit`, `createScheduledSit` | 8 | auth, db/queries, next/cache, analytics |
| `actions/join-sit.test.ts` | `joinSitAction` | 7 | auth, db/queries, clerk, next/cache, emails, analytics |
| `actions/leave-sit.test.ts` | `leaveSitAction` | 5 | auth, db/queries, clerk, next/cache, emails, analytics |
| `actions/cancel-sit.test.ts` | `cancelSitAction` | 7 | auth, db/queries, clerk, next/cache, emails, analytics |
| `actions/update-profile.test.ts` | `updateProfileAction` | 8 | auth, db/queries, next/cache |

**Total: 35 action orchestration tests across 5 files.**

Coverage focus: happy path, auth failure, user-not-found, validation rejection, DB error propagation, startsAt timing (3-minute offset for available-now).

**What these tests do NOT cover:** actual DB queries, actual Clerk auth, actual email delivery. The DB query layer (`db/queries.ts`) has zero direct test coverage — it is only tested indirectly through E2E tests and manual verification.

### Tier 3: E2E Tests (Playwright)

Browser-level tests against a running dev server. Two modes:

1. **Unauthenticated** — smoke tests that routes respond without 500s, landing page loads, 404 works. These run in CI without Clerk credentials.
2. **Authenticated** — board content, sit creation flow, join/leave/cancel lifecycle. These use `@clerk/testing` with `storageState` for programmatic sign-in (see SD-007, WI-1).

| File | Tests | Auth Required |
|------|-------|---------------|
| `e2e/navigation.spec.ts` | 12 | No |
| `e2e/board.spec.ts` | 16 | Partial (1 unauthenticated, 15 authenticated) |
| `e2e/create-sit.spec.ts` | 14 | Yes |
| `e2e/my-sits.spec.ts` | 12 | Yes |
| `e2e/profile.spec.ts` | 11 | Yes |
| `e2e/sit-lifecycle.spec.ts` | 8 | Yes (two-user) |

**Total: 73 E2E tests across 6 files.**

Browsers: Chromium (desktop) + iPhone 14 (mobile). Dev server auto-started by Playwright.

## Gate Integration

```
pnpm test           → vitest run (unit + integration, ~1s)
pnpm test:e2e       → playwright test (requires running dev server or auto-starts)
pnpm test:e2e:smoke → playwright smoke subset (unauthenticated routes only)
make gate           → typecheck + lint + vitest + e2e smoke
```

The gate runs unit + integration tests and smoke E2E tests (`pnpm test:e2e:smoke`). Full E2E tests run separately (`pnpm test:e2e`) because authenticated tests need Clerk credentials and are too slow/heavy for the default gate loop.

## What Is NOT Tested (and Why)

- **`db/queries.ts`** — Would require a real Neon connection or a test database. Deferred until we have a test DB provisioning strategy.
- **React components (render tests)** — Would require `@testing-library/react` + jsdom. The components are thin (mostly Tailwind classes) and well-covered by E2E tests. Not worth the setup cost at MVP.
- **Email templates** — Fire-and-forget, tested indirectly via integration test mocks. Visual testing would require a dedicated email preview tool.
- **`lib/analytics.ts`** — Currently a console.log stub. Not worth testing until a real provider is wired in.

## Files Added/Changed

- `vitest.config.ts` — Vitest config with `@/` path alias and exclusions
- `playwright.config.ts` — Chromium + mobile, auto-start dev server
- `package.json` — `test`, `test:watch`, `test:e2e`, `test:e2e:ui` scripts
- `lib/sit-utils.test.ts`, `lib/time.test.ts`, `lib/validation.test.ts`, `lib/user-sync.test.ts`, `lib/html.test.ts` — unit tests
- `components/avatar.test.ts` — unit tests
- `actions/create-sit.test.ts`, `actions/join-sit.test.ts`, `actions/leave-sit.test.ts`, `actions/cancel-sit.test.ts`, `actions/update-profile.test.ts` — action orchestration tests
- `e2e/navigation.spec.ts`, `e2e/board.spec.ts`, `e2e/create-sit.spec.ts`, `e2e/my-sits.spec.ts`, `e2e/profile.spec.ts`, `e2e/sit-lifecycle.spec.ts` — E2E tests
- `e2e/auth.setup.ts` — Clerk testing token auth setup
- `e2e/fixtures.ts` — Two-user test fixtures
- `lib/user-sync.ts` — exported `buildDisplayName` and `ClerkUserInfo` for testability
- `components/avatar.tsx` — exported `avatarClass` and `initials` for testability
