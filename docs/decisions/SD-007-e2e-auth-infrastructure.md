# SD-007: E2E Auth Infrastructure & Test Hardening

**Date:** 2026-03-09
**Status:** SPEC (awaiting implementation)
**Depends on:** SD-006 (testing strategy)
**Unlocks:** SD-008, SD-009

## Problem

65 Playwright tests exist across 5 spec files. All authenticated tests (53 of 65) are gated behind `test.skip(() => !process.env.E2E_CLERK_USER_ID)` — they silently skip when the env var is absent. There is:

- No Playwright auth setup (no `storageState`, no login fixture)
- No Clerk testing token configuration
- No documented procedure for running authenticated E2E tests
- No second test user for multi-user flows (join/leave/cancel)
- E2E tests are excluded from the gate entirely

The E2E suite is structurally present but operationally inert.

## Scope

This SD covers **five work items** (WI-1 through WI-5), ordered by dependency. Each is a single PR concern.

---

## WI-1: Clerk Testing Tokens + Playwright Auth Fixture

**PR scope:** 1 concern — auth infrastructure for E2E tests
**Estimated effort:** 30 agent-minutes
**Files to create/modify:**

| File | Action | Purpose |
|------|--------|---------|
| `e2e/auth.setup.ts` | CREATE | Playwright setup project that authenticates via Clerk and saves `storageState` |
| `e2e/.auth/` | CREATE (gitignored) | Directory for stored auth state files |
| `playwright.config.ts` | MODIFY | Add `setup` project + `storageState` to browser projects |
| `.env.example` | MODIFY | Add `E2E_CLERK_USER_*` env var documentation |
| `.gitignore` | MODIFY | Add `e2e/.auth/` |

### Implementation Details

**CONFIRMED: `@clerk/testing@2.0.1` installed. Compatible with `@playwright/test@^1` (we have 1.58.2).**

**API:** `clerk.signIn({ page, emailAddress })` — uses Clerk Backend API to create a sign-in token by email. No password needed. Requires `CLERK_SECRET_KEY` env var (already in `.env.local`).

**Test users provisioned in Clerk dashboard:**

| Role | Clerk ID | Email | Display |
|------|----------|-------|---------|
| Host | `user_3AibVF6oJUU0fLamJ14sBioEbG3` | `rickhallett@live.co.uk` | test user |
| Guest | `user_3AibfEBEK76vUk4WOL3UpIcMtTh` | `rickhallett@icloud.com` | test user2 |

**Auth setup project — `e2e/auth.setup.ts`:**

```ts
import { test as setup, expect } from "@playwright/test"
import { clerkSetup, clerk } from "@clerk/testing/playwright"

// clerkSetup fetches testing token from Backend API, sets CLERK_FAPI + CLERK_TESTING_TOKEN env vars
setup.beforeAll(async () => {
  await clerkSetup()
})

const HOST_EMAIL = "rickhallett@live.co.uk"
const GUEST_EMAIL = "rickhallett@icloud.com"

setup("authenticate host", async ({ page }) => {
  await page.goto("/")
  await clerk.signIn({ page, emailAddress: HOST_EMAIL })
  await page.goto("/app")
  await expect(page.getByRole("heading", { name: "onebell" })).toBeVisible({ timeout: 10000 })
  await page.context().storageState({ path: "e2e/.auth/host.json" })
})

setup("authenticate guest", async ({ page }) => {
  await page.goto("/")
  await clerk.signIn({ page, emailAddress: GUEST_EMAIL })
  await page.goto("/app")
  await expect(page.getByRole("heading", { name: "onebell" })).toBeVisible({ timeout: 10000 })
  await page.context().storageState({ path: "e2e/.auth/guest.json" })
})
```

**Playwright config changes — `playwright.config.ts`:**

```ts
projects: [
  // Auth setup runs first
  { name: "setup", testMatch: /.*\.setup\.ts/ },
  // Browser projects depend on setup — default storageState is host user
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/host.json" },
    dependencies: ["setup"],
  },
  {
    name: "mobile",
    use: { ...devices["iPhone 14"], storageState: "e2e/.auth/host.json" },
    dependencies: ["setup"],
  },
]
```

**Env vars:** No new env vars required. `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (already in `.env.local`) are sufficient — `clerkSetup()` reads them automatically.

**Remove from all 5 spec files:** The `test.skip(() => !process.env.E2E_CLERK_USER_ID)` guards. With `storageState`, auth is handled before any tests run. The 5 skip blocks to remove are in:
- `e2e/navigation.spec.ts` (line 72-75)
- `e2e/board.spec.ts` (line 12-15)
- `e2e/create-sit.spec.ts` (line 4-7)
- `e2e/my-sits.spec.ts` (line 4-7, line 83-85)
- `e2e/profile.spec.ts` (line 4-7)

**Gitignore:** Add `e2e/.auth/` to `.gitignore`.

### Verification

- `pnpm test:e2e` runs all 65 tests without skipping authenticated tests
- Auth state is cached — setup runs once per test run, not per test
- No auth state files committed to git
- `clerkSetup()` successfully fetches testing token (visible in setup output)

### Dependencies

- ✅ `@clerk/testing@2.0.1` — installed
- ✅ Test users — provisioned in Clerk dashboard
- ✅ `CLERK_SECRET_KEY` — already in `.env.local`
- ✅ Dev server — auto-started by Playwright `webServer` config

### Risks

- **`clerk.signIn({ emailAddress })` requires `CLERK_SECRET_KEY`**: It creates a sign-in token via the Backend API. If the key is missing, the setup will fail with a clear error message.
- **Flaky auth**: If Clerk's test token expires during a long test run, the `storageState` may go stale. Mitigate by running setup per-worker if needed.

---

## WI-2: Second Test User Fixture for Multi-User Flows

**PR scope:** 1 concern — second authenticated user for dyad testing
**Estimated effort:** 20 agent-minutes
**Depends on:** WI-1 (auth infrastructure must exist first)
**Files to create/modify:**

| File | Action | Purpose |
|------|--------|---------|
| `e2e/auth.setup.ts` | MODIFY | Add second user auth setup |
| `e2e/fixtures.ts` | CREATE | Custom test fixtures exposing `hostPage` and `guestPage` |
| `playwright.config.ts` | MODIFY | Possibly no changes if setup handles both users |
| `.env.example` | MODIFY | Add second user env vars |

### Implementation Details

**NOTE: WI-1 already creates both auth states (host.json + guest.json) in `e2e/auth.setup.ts`. WI-2 is solely about the fixtures file.**

**Two-user pattern:**

The core product domain is a dyad — two practitioners meeting. E2E verification of the join/leave/cancel flows requires two independent browser contexts with different Clerk sessions.

The default `page` fixture (via `storageState` in playwright.config.ts) is the host user. The guest user is accessed via a custom fixture.

```ts
// e2e/fixtures.ts — custom test fixture
import { test as base, expect, type Page } from "@playwright/test"

type TwoUserFixtures = {
  hostPage: Page
  guestPage: Page
}

export const test = base.extend<TwoUserFixtures>({
  hostPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({ storageState: "e2e/.auth/host.json" })
    const page = await ctx.newPage()
    await use(page)
    await ctx.close()
  },
  guestPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({ storageState: "e2e/.auth/guest.json" })
    const page = await ctx.newPage()
    await use(page)
    await ctx.close()
  },
})

export { expect }
```

**No new env vars required.** Both users authenticated in WI-1 setup.

### Existing test migration

Existing spec files (`board.spec.ts`, `create-sit.spec.ts`, `my-sits.spec.ts`, `profile.spec.ts`, `navigation.spec.ts`) continue to use the default `page` fixture which is the host user. Only WI-3 flow tests import from `e2e/fixtures.ts`.

### Verification

- `hostPage` and `guestPage` fixtures are independently authenticated
- Creating a sit as host and navigating as guest shows the sit on guest's board
- The two contexts have different `clerk_user_id` values

### Risks

- ✅ **Two Clerk test users**: Already provisioned (see WI-1 table)
- **Test data isolation**: Both users see the same database. Tests that create sits will be visible to both. This is correct for testing but means tests must clean up or be order-independent.

---

## WI-3: E2E Flow Tests — Join, Leave, Cancel

**PR scope:** 1 concern — end-to-end user flow verification
**Estimated effort:** 45 agent-minutes
**Depends on:** WI-1 + WI-2 (both auth fixtures must exist)
**Files to create/modify:**

| File | Action | Purpose |
|------|--------|---------|
| `e2e/sit-lifecycle.spec.ts` | CREATE | Full sit lifecycle: create → join → leave → cancel |
| `e2e/fixtures.ts` | IMPORT | Uses `hostPage` / `guestPage` from WI-2 |

### Test Specifications

Each test maps to one or more EVAL.md criteria:

```
Test 1: Host creates an Available Now sit (E4)
  hostPage → /app/create
  Fill instruction, meeting link, select duration
  Submit "Start a sit now"
  Verify redirect to /app (or /app/my-sits)
  Verify sit appears in board

Test 2: Guest sees sit on board and joins (E6, E7)
  guestPage → /app
  Verify host's sit is visible
  Click "Sit together" on the sit
  Verify status changes (button text changes or redirect)

Test 3: Host cannot join own sit (E8)
  hostPage → /app
  Verify own sit does NOT show "Sit together" button
  (Or if button exists, clicking shows error)

Test 4: Guest sees meeting link after joining (E16)
  guestPage → /app/my-sits
  Verify joined sit appears in "Joined" section
  Verify meeting link is visible/accessible

Test 5: Guest leaves a joined sit (E9)
  guestPage → /app/my-sits
  Click "Leave" on joined sit
  Verify sit disappears from Joined section
  hostPage → /app (refresh)
  Verify sit is back to "open" status

Test 6: Host cancels a sit (E10)
  hostPage creates a new sit
  hostPage → /app/my-sits
  Click "Cancel" on hosting sit
  Verify sit status changes to cancelled
  guestPage → /app (refresh)
  Verify cancelled sit no longer appears on board

Test 7: My Sits shows correct sections (E15)
  hostPage → /app/my-sits
  Verify "Hosting" section shows created sits
  guestPage → /app/my-sits
  Verify "Joined" section shows joined sits (if any remain)

Test 8: Board polling refresh (E17)
  hostPage creates a sit
  guestPage → /app (already loaded)
  Wait ≤ 25 seconds (20s polling + margin)
  Verify new sit appears without page reload
```

### EVAL Criteria Coverage After WI-3

| EVAL | Before | After |
|------|--------|-------|
| E4 Create Available Now | Structural only | ✅ Full flow |
| E5 Schedule future sit | ❌ | ⚠️ Add if time (tab switch + form fill + submit) |
| E6 Board sorted | Structural | ✅ Verified with real data |
| E7 Join sit | ❌ | ✅ Full flow |
| E8 Host can't join own | ❌ | ✅ Verified |
| E9 Guest leaves | ❌ | ✅ Full flow |
| E10 Host cancels | ❌ | ✅ Full flow |
| E15 My Sits sections | Structural | ✅ With real data |
| E16 Meeting link | ❌ | ✅ Verified |
| E17 Polling | ❌ | ✅ Verified |

### Test Data Strategy

Tests create their own data (sits) during execution. No DB seeding required.

**Ordering concern:** Tests in this spec file are sequential — each test depends on state from prior tests. Use `test.describe.serial()` to enforce order.

**Cleanup:** Not strictly required for test isolation since each test run creates fresh sits. Old sits expire naturally (20-minute expiry rule). But if test pollution becomes an issue, add a teardown that cancels all sits created by the test user.

### Verification

- All 8 tests pass with two authenticated users
- Tests do not depend on pre-existing DB state (beyond the two user accounts)
- Tests complete in < 60 seconds total

### Risks

- **Sequential coupling**: Tests depend on order. If test 2 fails, tests 3-8 may cascade-fail. Mitigate by having each test that needs a sit create its own where possible.
- **Timing sensitivity**: Polling test (test 8) depends on 20s interval. May be flaky on slow CI.
- **DB state**: Tests leave sits in the database. Acceptable for dev, may need cleanup for CI.

---

## WI-4: Add Smoke E2E to Gate

**PR scope:** 1 concern — gate expansion to include E2E smoke tests
**Estimated effort:** 15 agent-minutes
**Depends on:** WI-1 (auth infrastructure — but smoke tests don't need auth)
**Files to create/modify:**

| File | Action | Purpose |
|------|--------|---------|
| `Makefile` | MODIFY | Add `gate-e2e` target and update `GATE` |
| `playwright.config.ts` | MODIFY | Add `smoke` project that runs only unauthenticated tests |
| `package.json` | MODIFY | Add `test:e2e:smoke` script |

### Implementation Details

The gate should include the 12 unauthenticated E2E tests (route smoke tests + landing page content). These don't need Clerk credentials and verify the app doesn't crash.

**Option A: Tag-based filtering (preferred)**

Add a `@smoke` tag to unauthenticated test describes, then filter:

```json
"test:e2e:smoke": "playwright test --grep @smoke"
```

**Option B: Separate project with grep**

Add a `smoke` project in playwright config that only matches unauthenticated describes.

**Makefile change:**

```makefile
GATE := pnpm run typecheck && pnpm run lint && pnpm run test && pnpm run test:e2e:smoke
```

### Verification

- `make gate` runs typecheck + lint + vitest + E2E smoke tests
- Gate still completes in < 30 seconds (smoke tests are fast — no auth, no data dependency)
- Authenticated E2E tests remain separate via `pnpm test:e2e`

### Risks

- **Gate speed**: Adding `pnpm run test:e2e:smoke` adds browser startup time (~5-10s). Acceptable.
- **Dev server requirement**: Playwright auto-starts dev server. If gate is run during active development with `pnpm dev` already running, `reuseExistingServer` handles this. In CI without a running server, Playwright will start one.

---

## WI-5: Update SD-006 to Reflect Actual State

**PR scope:** 1 concern — documentation accuracy
**Estimated effort:** 10 agent-minutes
**Depends on:** None (can be done anytime, but best done after WI-1 through WI-4)
**Files to modify:**

| File | Action | Purpose |
|------|--------|---------|
| `docs/decisions/SD-006-testing-strategy.md` | MODIFY | Update test counts, file list, coverage notes |
| `docs/internal/session-decisions-index.yaml` | MODIFY | Update SD-006 summary, add SD-007 |

### What's stale in SD-006

| Section | SD-006 says | Reality |
|---------|------------|---------|
| Unit test count | 60 | 60 (correct — `lib/html.test.ts` has 8 but `components/avatar.test.ts` has 10, totals align) |
| Action test count | 15 | 35 (`leave-sit.test.ts` has 5, `cancel-sit.test.ts` has 7, `update-profile.test.ts` has 8 — these 3 files not in SD-006) |
| E2E test count | 16 | 65 (`my-sits.spec.ts` with 12 and `profile.spec.ts` with 11 not in SD-006; existing files grew) |
| E2E file list | 3 files | 5 files |
| Total test count | ~91 implied | 168 actual |
| "What is NOT tested" | Lists db/queries.ts, React components, emails, analytics | Still accurate |
| Gate integration | Accurate | Accurate (but should note E2E excluded) |

### Verification

- SD-006 test counts match `vitest run` output and `playwright test --list` output
- All test files mentioned in SD-006 exist and are accurate

---

## Dependency Graph

```
WI-1 (Auth Infrastructure)
  ├── WI-2 (Two-User Fixture)  ──depends──▶ WI-1
  │     └── WI-3 (Flow Tests)  ──depends──▶ WI-1 + WI-2
  ├── WI-4 (Smoke in Gate)     ──depends──▶ WI-1 (loosely — smoke tests don't need auth)
  └── WI-5 (SD-006 Update)     ──depends──▶ none (but best done last)
```

**Implementation order:** WI-1 → WI-2 → WI-3 → WI-4 → WI-5

WI-4 can run in parallel with WI-2/WI-3 since smoke tests don't need auth, but sequencing after WI-1 is cleaner.

---

## EVAL Criteria Remaining After All 5 WIs

| EVAL | Status | Notes |
|------|--------|-------|
| E1 Sign in | ⚠️ Covered by auth setup, not by a dedicated test | Auth setup project IS the E1 verification |
| E2 Profile on first login | ❌ | Requires fresh user — risky to automate (Clerk dashboard state) |
| E5 Schedule future sit | ⚠️ | Structural E2E exists; add flow test in WI-3 if time |
| E11 Expired sits excluded | ❌ | Needs DB time manipulation or waiting 20 minutes — defer |
| E12-E14 Email delivery | ❌ | Requires Resend log inspection — separate concern |
| E19 Route protection | ✅ | Already covered by navigation.spec.ts smoke tests |
| E20 Server-side auth | ✅ | Already covered by action orchestration tests (mocked) |
| NF2 Tap targets | ❌ | Requires accessibility audit tooling — separate concern |
| NF3 3G load time | ❌ | Requires network throttling — separate concern |
| NF4 Atomic join | ✅ | Covered by DB transaction (`SELECT FOR UPDATE`) — code-level guarantee |

Items marked ❌ are explicitly deferred — they require different tooling or infrastructure beyond E2E browser testing.
