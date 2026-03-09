# Darkcat Adversarial Review — Session 2

**Date:** 2026-03-09
**Reviewer:** @Weaver (claude-opus-4-6)
**Scope:** 941ef75~1..b833cf6 (5 commits, 41 files, +3284/-189)
**Monoculture warning:** Same model family authored and reviews. Correlated blind spots expected.

---

## Phase 1: Data Layer + Environment

### [SEVERITY: major] DB connection pool never closed in serverless context
File: `db/client.ts:5`
Pattern: training-data-frequency
What: `new Pool()` is constructed at module scope and never closed. In serverless (Vercel), this is the standard pattern for `@neondatabase/serverless` which handles connection recycling. However, the `Pool` constructor is invoked unconditionally at import time, meaning any file importing db/client.ts (including test mocking contexts) will attempt a connection.
Why: In production on Vercel this is fine (serverless Pool handles it). But it makes the module impossible to import without DATABASE_URL being set, which is why all test files must mock `@/db/queries` rather than `@/db/client`. This is by-design but worth noting as an architectural constraint.
Fix: NOT ACTIONABLE — accepted pattern for `@neondatabase/serverless`. Document the constraint.
Status: ACCEPTED

### [SEVERITY: major] `leaveSit` is NOT transactional — race condition possible
File: `db/queries.ts:159-201`
Pattern: shadow-validation
What: `joinSit` correctly uses `db.transaction()` with `FOR UPDATE` locking. But `leaveSit` does a SELECT then UPDATE in two separate statements without a transaction. Between the SELECT (which checks `guestUserId === userId`) and the UPDATE, another request could modify the sit.
Why: A concurrent request could leave the sit in an inconsistent state. If two requests to leave the same sit arrive simultaneously, both pass the guard but only one update fires. The race window is small but exists.
Fix: Wrap `leaveSit` in `db.transaction()` with `FOR UPDATE`, matching the `joinSit` pattern.

### [SEVERITY: major] `cancelSit` is NOT transactional — same race as leaveSit
File: `db/queries.ts:207-249`
Pattern: shadow-validation
What: Same pattern as `leaveSit` — SELECT then UPDATE without transaction. Two concurrent cancel requests could both pass the `status === "cancelled"` guard.
Why: Less critical than `leaveSit` (cancellation is idempotent-ish) but the guard check `sit.status === "cancelled"` exists specifically to prevent double-cancel, and the non-transactional read defeats it.
Fix: Wrap `cancelSit` in `db.transaction()` with `FOR UPDATE`.

### [SEVERITY: minor] `db/env.ts` logs partial DATABASE_URL to stdout
File: `db/env.ts:42`
Pattern: dead-code (not dead, but security-adjacent)
What: Logs first 40 chars of DATABASE_URL on every script invocation. This includes the protocol, username, and partial hostname. In CI/CD logs this leaks connection metadata.
Why: Acceptable for dev scripts (seed, migrate, debug) but should not be present in production code paths. Since `db/env.ts` is only imported by standalone scripts (not by `db/client.ts`), this is safe. The isolation is correct.
Fix: NOT ACTIONABLE — env.ts is dev-only. Verified: not imported by client.ts.
Status: ACCEPTED

### [SEVERITY: minor] `getUserSits` raw SQL joins may break with Drizzle upgrades
File: `db/queries.ts:322-330`
Pattern: training-data-frequency
What: The `getUserSits` query uses `sql` template literals for the self-join aliases (`host_u`, `guest_u`). This bypasses Drizzle's type system and could break on Drizzle version upgrades if internal SQL generation changes.
Why: Drizzle's API for self-joins with aliases was limited when this was written. The raw SQL is correct and tested via the app, but it's fragile.
Fix: ACCEPTED — Drizzle's alias API is still awkward. Monitor on upgrades.
Status: ACCEPTED

---

## Phase 2: Domain Logic + Validation

### [SEVERITY: major] `createScheduledSitSchema` future-date check uses `new Date()` at parse time — non-deterministic in server actions
File: `lib/validation.ts:30`
Pattern: looks-right-trap
What: `.refine((d) => d > new Date(), ...)` captures a fresh `new Date()` each time `.safeParse()` is called. This is correct — the refinement evaluates at parse time, not at schema definition time. No bug here.
Why: Verified: the `new Date()` is inside the refine callback, evaluated lazily. Tests confirm it works with fake timers. NO FINDING.
Status: NOT A FINDING

### [SEVERITY: minor] `instructionText` has no max length validation
File: `lib/validation.ts:8-9`, `lib/validation.ts:41-43`
Pattern: shadow-validation
What: `instructionText` requires `min(1)` but has no `max()`. A malicious user could submit a megabyte-long instruction text. The DB column is `TEXT` (unlimited).
Why: XSS is not a concern (React escapes output), but storage abuse and UI overflow are. The `note` field has the same issue.
Fix: Add `.max(500)` to `instructionText` and `.max(200)` to `note` in both schemas. Also add `.max(500)` to `bio` in `updateProfileSchema`.

### [SEVERITY: minor] `meetingUrl` allows any valid URL — no protocol restriction
File: `lib/validation.ts:12`, `lib/validation.ts:44`
Pattern: shadow-validation
What: `z.string().url()` accepts any valid URL including `javascript:`, `file:///`, `data:` URIs. These would render as clickable links in the app.
Why: The `meetingUrl` is rendered as an `<a href={...}>` in `my-sit-card.tsx:129`. A `javascript:` URI would execute when clicked. This is a genuine XSS vector.
Fix: Add `.refine((url) => url.startsWith("https://"), { message: "Meeting URL must use HTTPS" })` to both schemas.

---

## Phase 3: Server Actions

### [SEVERITY: critical] XSS via meetingUrl in email templates
File: `emails/sit-joined.ts:12`
Pattern: shadow-validation + looks-right-trap
What: The `meetingUrl` is interpolated directly into an HTML string: `<a href="${meetingUrl}">`. If meetingUrl contains a `javascript:` URI or HTML-breaking characters (e.g., `">`), this is an XSS vector in the email. The Zod schema validates `.url()` but does not restrict to HTTPS.
Why: Email HTML is not escaped by React. Template literal interpolation is raw. A crafted meetingUrl like `"><script>alert(1)</script>` would break the HTML structure. More realistically, `javascript:void(0)` passes `.url()` validation.
Fix: (1) Restrict meetingUrl to HTTPS in validation schemas. (2) HTML-escape all interpolated values in email templates.

### [SEVERITY: major] Email templates vulnerable to HTML injection via all interpolated fields
File: `emails/sit-joined.ts:8-11`, `emails/guest-left.ts:19`, `emails/sit-cancelled.ts:20`
Pattern: shadow-validation
What: `partnerName`, `instruction`, `hostName`, `guestName` are all interpolated into HTML templates without escaping. A display name containing `<script>` tags would be rendered in the email.
Why: Display names come from Clerk (less controllable) and from the profile form (user-controlled). The profile form `displayName` has no sanitisation. While email clients generally strip scripts, some render arbitrary HTML.
Fix: Create an `escapeHtml()` utility and apply to all template interpolations. Or use a template library like React Email.

### [SEVERITY: minor] `listSitsAction` has no auth check
File: `actions/list-sits.ts:13-15`
Pattern: paper-guardrail
What: `listSitsAction()` does not call `requireUser()`. Any request can fetch the open sits list. The board page itself is behind Clerk middleware, but the server action is callable directly.
Why: Open sits are designed to be visible to authenticated users. The middleware protects the route, and the action is only callable from the board page. However, server actions can be invoked directly via POST — a user without auth could enumerate sits. For an MVP where the board is public-ish data, this is LOW risk.
Fix: CAPTAIN'S CALL — add `requireUser()` to `listSitsAction` if sits should not be queryable outside the auth boundary. For MVP, ACCEPTED.
Status: CAPTAIN'S CALL

### [SEVERITY: minor] Unhandled promise in joinSitAction email flow
File: `actions/join-sit.ts:30`
Pattern: looks-right-trap
What: `Promise.all([...]).then(...).catch(...)` is a detached (fire-and-forget) promise. The `catch` is there, so unhandled rejection is prevented. This is correct and intentional — the comment says "Fire-and-forget: email must not block the mutation".
Why: Verified: the catch handler logs the error. The `return { success: true }` on line 52 runs regardless. NO FINDING.
Status: NOT A FINDING

---

## Phase 4: UI Components

### [SEVERITY: minor] `initials()` crashes on empty string
File: `components/avatar.tsx:17-23`
Pattern: edge-case
What: `initials("")` → `"".split(/\s+/)` → `[""]` → `[""][0]` → `""[0]` → `undefined` → `.toUpperCase()` throws? Actually: `"".split(/\s+/)` returns `[""]`, then `.map(w => w[0])` returns `[undefined]`, then `.join("")` returns `""`, then `.toUpperCase()` returns `""`, then `.slice(0,2)` returns `""`. The test confirms empty string returns `""`. NO CRASH.
Why: Verified via test: `initials("")` doesn't crash. But `undefined[0]` doesn't throw in JS — it returns `undefined`. And `[undefined].join("")` returns `""`. This works but is accidental.
Fix: NOT ACTIONABLE — works correctly. The test covers it.
Status: ACCEPTED

### [SEVERITY: minor] SVG icons in `app-nav.tsx` missing `strokeLinejoin` on some elements
File: `components/app-nav.tsx:12-17`
Pattern: completeness-bias
What: The board icon SVG has `strokeLinejoin="round"` on the parent but not all child elements. The My Sits and Profile icons also have it. This is fine — SVG inherits from parent.
Fix: NOT A FINDING.
Status: NOT A FINDING

### [SEVERITY: minor] `PastSitCard` avatar shows wrong person in some cases
File: `components/my-sit-card.tsx:156-158`
Pattern: looks-right-trap
What: `const partnerName = sit.guestDisplayName ?? "No partner"` and `const displayName = sit.guestDisplayName ?? sit.hostDisplayName`. For a past sit where the current user IS the host, `displayName` correctly tries guest first, falls back to host. For a past sit where the current user IS the guest, `displayName` shows the guest's own name (wrong — should show host).
Why: The `PastSitCard` doesn't know which user is viewing. It always prefers guest display name for the avatar, which is wrong when the viewer is the guest. The card should show the partner's avatar, not your own.
Fix: Pass `currentUserId` to `PastSitCard` and compute partner name correctly: if `sit.hostUserId === currentUserId` show guest, else show host.

---

## Phase 5: Pages + Routing

### [SEVERITY: minor] Duplicated CTA buttons on board page
File: `app/app/page.tsx:41-62` and `app/app/page.tsx:66-87`
Pattern: completeness-bias
What: The "Start a sit now" and "Schedule a sit" link blocks are fully duplicated — once inside EmptyState and once at the bottom when sits exist. The SVG icons, classNames, and hrefs are identical. Both point to the same `/app/create` route.
Why: This is intentional UX (CTAs in empty state vs. CTAs below the list). But the duplication means any change to button styling or icons must be made in two places.
Fix: Extract CTA buttons into a shared component. MINOR — not a bug, a hygiene improvement.

---

## Phase 6: Test Quality Audit

### [SEVERITY: major] Integration tests mock the DB layer — they test mock wiring, not integration
File: All `actions/*.test.ts`
Pattern: mock-castle
What: Every integration test mocks `@/db/queries`, `@/lib/auth`, `@/emails/*`, `@clerk/nextjs/server`, and `next/cache`. The tests verify that given specific mock returns, the action returns the expected result. They do NOT test actual DB queries, actual auth, or actual email sending.
Why: These are really unit tests of the action orchestration logic, not integration tests. The name "integration test" in SD-006 is misleading. This is not a code defect — it's a labelling/design choice. The real risk is that the DB queries in `db/queries.ts` have ZERO test coverage, and the mocked tests cannot catch query bugs (wrong column, wrong join, wrong WHERE clause).
Fix: Relabel as "action orchestration tests" in SD-006. The gap in DB query testing is documented in SD-006 as intentional (no test DB). ACCEPTED with label correction.

### [SEVERITY: minor] `formatRelativeTime` test assertions are loose
File: `lib/time.test.ts:33-35`
Pattern: phantom-tollbooth
What: `expect(result).toContain("in")` and `expect(result).toContain("hours")` — these assertions would pass for any string containing "in" and "hours", including error messages. The test doesn't pin the exact expected output.
Why: `date-fns` `formatDistanceToNow` output varies by locale and version. Pinning exact strings is fragile. The loose assertions are a deliberate trade-off. ACCEPTED.
Status: ACCEPTED

### [SEVERITY: minor] `avatarClass` "different classes for different names" test is probabilistic
File: `components/avatar.test.ts:42-52`
Pattern: phantom-tollbooth
What: `expect(classes.size).toBeGreaterThanOrEqual(2)` — with 5 names across 5 colours, getting at least 2 distinct is near-certain but not deterministic. A hash collision could theoretically make this test flaky.
Why: The test acknowledges this with "Not guaranteed but likely." The assertion is deliberately weak. ACCEPTED — the determinism test above is the real test.
Status: ACCEPTED

---

## Phase 7: Cross-Cutting

### [SEVERITY: minor] `drizzle.config.ts` not in session diff but may be stale
Pattern: stale-reference-propagation
What: The drizzle.config.ts was created in an earlier session and not modified. If the schema changed, the config may not reflect current state. Since the schema didn't change in this session, this is NOT A FINDING.
Status: NOT A FINDING

### [SEVERITY: minor] No `instructionText` max length in DB schema
File: `db/schema.ts:46`
Pattern: completeness-bias
What: The `instruction_text` column is `text()` with no length constraint at the DB level. Combined with the validation gap (no max length in Zod), there's no protection against arbitrarily long instructions at any layer.
Why: Same as the validation finding — needs max length at the validation layer (the fix there covers this).
Fix: Already covered by Phase 2 finding on max lengths.

---

## Summary

| # | Severity | Finding | File | Pattern | Status |
|---|----------|---------|------|---------|--------|
| 1 | critical | XSS via meetingUrl in email templates | emails/sit-joined.ts:12 | shadow-validation | FIX |
| 2 | major | Email templates: HTML injection via interpolated fields | emails/*.ts | shadow-validation | FIX |
| 3 | major | `leaveSit` not transactional — race condition | db/queries.ts:159 | shadow-validation | FIX |
| 4 | major | `cancelSit` not transactional — race condition | db/queries.ts:207 | shadow-validation | FIX |
| 5 | minor | `instructionText` no max length validation | lib/validation.ts | shadow-validation | FIX |
| 6 | minor | `meetingUrl` allows non-HTTPS protocols | lib/validation.ts | shadow-validation | FIX |
| 7 | minor | `PastSitCard` avatar shows wrong person for guest viewer | components/my-sit-card.tsx:156 | looks-right-trap | FIX |
| 8 | minor | Duplicated CTA buttons on board page | app/app/page.tsx | completeness-bias | DEFER |
| 9 | minor | Integration tests mislabelled (action orchestration, not integration) | SD-006 | mock-castle | RELABEL |
| 10 | minor | `listSitsAction` has no auth check | actions/list-sits.ts | paper-guardrail | CAPTAIN'S CALL |

**Findings: 10 (critical: 1, major: 3, minor: 6)**
**Verdict: FAIL — critical finding #1 must be fixed before deployment**

### Fix Priority
1. **#1 + #2 + #6**: Email XSS + HTML injection + protocol restriction (all part of same fix: sanitize templates + restrict URLs to HTTPS)
2. **#3 + #4**: Transaction safety on leaveSit and cancelSit
3. **#5**: Add max lengths to validation schemas
4. **#7**: Fix PastSitCard avatar logic
