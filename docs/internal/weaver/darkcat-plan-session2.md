# Darkcat Plan — Session 2 Full Review

**Date:** 2026-03-09
**Scope:** 941ef75~1..b833cf6 (5 commits, 41 files, +3284/-189)
**Risk:** HIGH — zero adversarial review to date, all code agentic-generated
**Model:** claude-opus-4-6 (monoculture — same model family as author)
**Adversariality:** Maximum

## Constraint

This is a monoculture review (same model family wrote and reviews). This means correlated blind spots are expected. Findings should be treated as a lower bound — what even the same model can catch. Cross-model triangulation would strengthen confidence but is not available in this session.

## Phase Structure

Each phase reads every file in its domain IN FULL (not diff hunks), stains against:
- Slopodar taxonomy (22 primary patterns)
- Watchdog blindspots (5 checks)
- Structural integrity (imports, errors, edges, naming)
- AGENTS.md foot guns (dumb_zone, paper_guardrail)

### Phase 1: Data Layer + Environment
**Files:** `db/env.ts`, `db/queries.ts`, `db/seed.ts`, `db/migrate.ts`, `db/debug.ts`
**Focus:** env loading correctness, query correctness, SQL injection, transaction safety, schema alignment
**Risk vectors:** shadow-validation (hard query paths), phantom-ledger (returned vs recorded), looks-right-trap (wrong column/table ref)

### Phase 2: Domain Logic + Validation
**Files:** `lib/sit-utils.ts`, `lib/time.ts`, `lib/validation.ts`, `lib/user-sync.ts`
**Focus:** business rule correctness, time zone handling, Zod schema completeness, edge cases (zero, null, boundary)
**Risk vectors:** shadow-validation (validation coverage gaps), completeness-bias (duplicated logic), training-data-frequency (date-fns API choices)

### Phase 3: Server Actions
**Files:** `actions/list-sits.ts`, `actions/create-sit.ts`, `actions/join-sit.ts`, `actions/leave-sit.ts`, `actions/cancel-sit.ts`, `actions/update-profile.ts`
**Focus:** authorization enforcement, transaction atomicity, error handling completeness, return type accuracy
**Risk vectors:** right-answer-wrong-work (auth checks that look correct but aren't), paper-guardrail (auth comments without enforcement), looks-right-trap (wrong user ID comparison)

### Phase 4: UI Components
**Files:** `components/avatar.tsx`, `components/sit-card.tsx`, `components/sit-list.tsx`, `components/join-button.tsx`, `components/my-sit-card.tsx`, `components/app-nav.tsx`, `components/create-sit-form.tsx`, `components/profile-form.tsx`
**Focus:** prop type safety, conditional rendering correctness, accessibility, XSS surface, meeting link handling
**Risk vectors:** semantic-hallucination (comments claim behaviour not implemented), dead-code (unreachable branches), completeness-bias (inconsistent patterns across cards)

### Phase 5: Pages + Routing
**Files:** `app/app/page.tsx`, `app/app/my-sits/page.tsx`, `app/app/profile/page.tsx`, `app/globals.css`
**Focus:** data fetching correctness, auth gating, error boundaries, CSS specificity conflicts
**Risk vectors:** dumb-zone (page written without reading component contracts), stale-reference-propagation (type mismatches)

### Phase 6: Test Quality Audit
**Files:** All `*.test.ts` (10 files), `vitest.config.ts`
**Focus:** assertion quality, mock-to-assertion ratio, causal path verification, edge case coverage
**Risk vectors:** mock-castle (mock scaffolding > assertions), phantom-tollbooth (loose assertions), right-answer-wrong-work (tests pass for wrong reasons)
**Note:** E2E specs (e2e/*.spec.ts) reviewed for structural completeness but not deep-stained — they test integration paths, not unit correctness.

### Phase 7: Cross-Cutting
**Focus:** Import graph analysis, type consistency across boundaries, config correctness (package.json, playwright, vitest)
**Risk vectors:** stale-reference-propagation (config describes non-existent state), stowaway-commit (bundled concerns)

## Recording

Findings recorded to: `docs/internal/weaver/darkcat-findings.tsv`
Fixes applied inline, gate re-run after each fix batch.
Final verdict recorded at bottom of this file.

## Exit Criteria

- All critical/major findings fixed or explicitly accepted by Captain
- Gate green after all fixes
- darkcat-findings.tsv populated with all findings and their resolution status

---

## Final Verdict

**Date:** 2026-03-09
**Gate:** GREEN (109 tests, up from 95)
**Verdict:** PASS WITH FINDINGS

### Fixed (7/10)
1. **CRITICAL: Email XSS via meetingUrl** — Added `escapeHtml()` utility, applied to all 3 email templates
2. **MAJOR: HTML injection in email templates** — All interpolated fields now escaped
3. **MAJOR: leaveSit race condition** — Wrapped in `db.transaction()` with `FOR UPDATE`
4. **MAJOR: cancelSit race condition** — Wrapped in `db.transaction()` with `FOR UPDATE`
5. **MINOR: No max length on instructionText** — Added `.max(500)` to both schemas
6. **MINOR: meetingUrl allows non-HTTPS** — Created shared `httpsUrl` refinement, applied to both schemas; also added `.max(200)` to note, `.max(500)` to bio
7. **MINOR: PastSitCard avatar wrong for guest viewer** — Added `currentUserId` prop, compute partner correctly

### Deferred (1/10)
8. **MINOR: Duplicated CTA buttons on board page** — Hygiene, not a defect. Extract to shared component when convenient.

### Accepted (1/10)
9. **MINOR: Test labelling** — "Integration tests" are actually action orchestration tests with mocked deps. Accurate but not a code defect.

### Captain's Call (1/10)
10. **MINOR: listSitsAction no auth check** — Server action callable without auth. Middleware protects the route. For MVP where sits are public-ish, acceptable.

### New Tests Added
- `lib/html.test.ts` — 8 tests for `escapeHtml()` covering all OWASP characters + injection attempt
- `lib/validation.test.ts` — 6 new tests: HTTPS-only URL, javascript: rejection, max lengths for instruction/note/bio

### Files Changed
- `lib/html.ts` (NEW) — `escapeHtml()` utility
- `lib/html.test.ts` (NEW) — 8 tests
- `lib/validation.ts` — HTTPS-only meetingUrl, max lengths on all text fields
- `lib/validation.test.ts` — 6 new tests for security constraints
- `db/queries.ts` — `leaveSit` and `cancelSit` wrapped in transactions with `FOR UPDATE`
- `emails/sit-joined.ts` — HTML escaping on all interpolated values
- `emails/guest-left.ts` — HTML escaping
- `emails/sit-cancelled.ts` — HTML escaping
- `components/my-sit-card.tsx` — PastSitCard accepts `currentUserId`, computes partner correctly
- `actions/my-sits.ts` — Returns `userId` in result for downstream use
- `app/app/my-sits/page.tsx` — Passes `userId` to PastSitCard
- `docs/internal/session-decisions-index.yaml` — SD-005, SD-006 indexed
