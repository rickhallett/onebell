# Session 4 Continuation Prompt — onebell

## Project Identity
**onebell** — mobile-first web app where meditation practitioners signal availability and form dyad inquiry sits (two-person sessions). Coordination tool, not video host. Users provide their own meeting links.

## Tech Stack
Next.js 16 App Router, TypeScript, Tailwind v4, Clerk v7 auth, Neon Postgres (`@neondatabase/serverless` Pool driver), Drizzle ORM, Resend email, Zod v4 validation, Vitest, Playwright. Target: Vercel. Governance: nooprint blueprint, `AGENTS.md` standing orders.

## Current State
- **Branch:** `master`
- **HEAD:** `8d912c7` — darkcat DC-1 fixes (XSS, transactions, auth-gated board)
- **Working tree:** clean except `docs/internal/qa-checklist.yaml` (untracked, partially complete)
- **Gate:** GREEN — 109 tests passing, typecheck clean, lint clean
- **Test breakdown:** 11 test files, 109 vitest tests (60 unit + 35 action orchestration + 14 security). Plus 55 E2E specs (not in gate).

---

## TASK 1: Complete QA Checklist (human checks section)

The file `docs/internal/qa-checklist.yaml` has Section 1 (15 automated checks, A-001 to A-015) complete. Section 2 (human verification checks) has only a header comment and NO items.

**Write the complete file** (do not try to append — write the whole thing). The human section should contain these items:

```yaml
human:

  # ── Core User Flows (run against pnpm dev) ───────────────────
  - id: H-001
    name: "Create sit: available-now flow"
    severity: blocker
    status: pending
    steps:
      - "Navigate to /app/create"
      - "Select 'Available now', fill all fields with valid data"
      - "Submit — sit appears on board page within 20s polling cycle"
    verify: "Sit card shows correct host name, practice type, duration, instructions"

  - id: H-002
    name: "Create sit: scheduled flow"
    severity: blocker
    status: pending
    steps:
      - "Navigate to /app/create"
      - "Select 'Schedule', pick a future date/time"
      - "Submit — sit appears on board ordered by start time"
    verify: "Scheduled time displays correctly in host's timezone"

  - id: H-003
    name: "Join a sit"
    severity: blocker
    status: pending
    steps:
      - "Sign in as a DIFFERENT user than the host"
      - "Click join on an open sit"
      - "Sit status changes to 'joined', meeting URL revealed"
    verify: "Host sees sit as joined in /app/my-sits. Join button disappears from board."

  - id: H-004
    name: "Leave a sit"
    severity: blocker
    status: pending
    steps:
      - "As the guest of a joined sit, click leave"
      - "Sit returns to 'open' on board"
    verify: "Host's my-sits shows sit as open again. Guest no longer listed."

  - id: H-005
    name: "Cancel a sit"
    severity: blocker
    status: pending
    steps:
      - "As host of a sit (open or joined), click cancel"
      - "Sit disappears from board, shows as cancelled in my-sits"
    verify: "If sit had a guest, guest sees cancellation in their my-sits"

  - id: H-006
    name: "My sits page: all states render"
    severity: major
    status: pending
    steps:
      - "Navigate to /app/my-sits"
      - "Verify active sits (open/joined) and past sits (cancelled/completed/expired) sections"
    verify: "Partner names display correctly for both host and guest perspectives"

  - id: H-007
    name: "Profile update"
    severity: major
    status: pending
    steps:
      - "Navigate to /app/profile"
      - "Update display name, bio, timezone, open-to-beginners toggle"
      - "Save and refresh — changes persist"
    verify: "Updated name appears on board for subsequent sits"

  # ── Auth & Access Control ────────────────────────────────────
  - id: H-008
    name: "Unauthenticated board: names obfuscated"
    severity: blocker
    status: pending
    steps:
      - "Open /app in an incognito/signed-out browser"
      - "Board loads with sits visible"
    verify: "Host names show as 'R•••' format. No bio, no timezone. No join buttons."

  - id: H-009
    name: "Auth redirect: protected routes"
    severity: blocker
    status: pending
    steps:
      - "While signed out, navigate to /app/create, /app/my-sits, /app/profile"
    verify: "Each redirects to /sign-in (Clerk middleware)"

  - id: H-010
    name: "Host cannot join own sit"
    severity: major
    status: pending
    steps:
      - "Create a sit, then attempt to join it as the same user"
    verify: "Join button not rendered for own sits. Server action rejects if forced."

  # ── Mobile & Responsive ─────────────────────────────────────
  - id: H-011
    name: "Mobile viewport: board page"
    severity: major
    status: pending
    steps:
      - "Open board at 375px width (iPhone SE) in devtools"
      - "Scroll through sit cards"
    verify: "Cards stack cleanly, no horizontal overflow, bottom nav accessible"

  - id: H-012
    name: "Mobile viewport: create sit form"
    severity: major
    status: pending
    steps:
      - "Open /app/create at 375px width"
      - "Fill and submit form"
    verify: "All fields reachable, submit button visible without awkward scrolling"

  - id: H-013
    name: "Bottom tab navigation"
    severity: major
    status: pending
    steps:
      - "Tap each tab: Board, Create, My Sits, Profile"
    verify: "Active tab highlighted, correct page loads, no flicker"

  # ── Edge Cases & Error States ────────────────────────────────
  - id: H-014
    name: "Empty board state"
    severity: minor
    status: pending
    steps:
      - "Ensure no open sits exist (cancel all or wait for expiry)"
    verify: "Empty state message 'The hall is quiet' with CTA to create a sit"

  - id: H-015
    name: "Validation errors on create form"
    severity: major
    status: pending
    steps:
      - "Submit create form with: empty fields, HTTP URL (not HTTPS), excessively long instruction text (>500 chars)"
    verify: "Zod errors surface to user. HTTP URL rejected. Long text truncated/rejected."

  - id: H-016
    name: "Concurrent join race condition"
    severity: minor
    status: pending
    steps:
      - "Open same sit in two browser tabs as two different users"
      - "Click join simultaneously"
    verify: "Only one succeeds. Other gets clear error. Sit shows correct single guest."
    notes: "Transaction + row locking should handle this — but verify visually"

  # ── Email (requires RESEND_API_KEY) ──────────────────────────
  - id: H-017
    name: "Email: sit joined notification"
    severity: major
    status: pending
    steps:
      - "Join a sit with RESEND_API_KEY configured"
    verify: "Host receives email with correct guest name, sit details, escaped content"
    notes: "Skip if no RESEND_API_KEY — check console log fallback message instead"

  - id: H-018
    name: "Email: guest left notification"
    severity: minor
    status: pending
    steps:
      - "Leave a joined sit"
    verify: "Host receives email notification"

  - id: H-019
    name: "Email: sit cancelled notification"
    severity: minor
    status: pending
    steps:
      - "Cancel a sit that has a guest"
    verify: "Guest receives cancellation email with link back to board"

  # ── Visual & Copy Quality ────────────────────────────────────
  - id: H-020
    name: "Zendo theme: warm minimalism"
    severity: minor
    status: pending
    steps:
      - "Browse all pages: landing, board, create, my-sits, profile"
    verify: "Consistent warm palette, serif headings, no jarring colour breaks, card hover lift works"

  - id: H-021
    name: "Copy review: no placeholder or lorem ipsum text"
    severity: minor
    status: pending
    steps:
      - "Read all user-facing copy across pages"
    verify: "Language is warm, clear, practitioner-appropriate. No dev placeholder text."

  # ── Performance (subjective feel) ────────────────────────────
  - id: H-022
    name: "Board page load time"
    severity: major
    status: pending
    steps:
      - "Hard refresh /app (Cmd+Shift+R)"
      - "Note perceived load time"
    verify: "Page usable within ~2s on broadband. If >3s, flag for perf investigation."
    notes: "Known issue — serial DB roundtrips. Perf investigation is next task."

  - id: H-023
    name: "Polling: board updates without manual refresh"
    severity: major
    status: pending
    steps:
      - "Keep board open, create a sit from another browser/tab"
    verify: "New sit appears within ~20s without manual refresh"
```

Preserve the entire Section 1 (automated checks A-001 through A-015) exactly as-is. Append the above as Section 2.

---

## TASK 2: Run Automated Checks

Execute each automated check from Section 1 and update the YAML `status` and `output` fields in-place:

1. **A-001 through A-003** (gate): `make gate`
2. **A-004** (build): `pnpm run build` — this is the first time we're building for production. Watch for RSC serialisation errors.
3. **A-005 through A-009** (security): run each grep/git command
4. **A-010** (audit): `pnpm audit --prod`
5. **A-011 through A-015** (hygiene, env, auth): run each grep command

For each check:
- Set `status: pass` or `status: fail`
- Set `output:` to the actual command output (or summary for long output)
- If a **blocker** fails: stop, report, and do NOT continue to human checks
- If a **major** fails: note it and continue — Captain decides disposition

**Known expected failure:** A-013 (`NEXT_PUBLIC_APP_URL` missing from `.env.example`). Fix this inline by adding the line to `.env.example` before running the check.

After all automated checks complete, present a summary table:

```
| ID    | Name                        | Severity | Status |
|-------|-----------------------------|----------|--------|
| A-001 | TypeScript typecheck        | blocker  | ?      |
| ...   | ...                         | ...      | ...    |
```

---

## TASK 3: Present Human Checks for Captain Sign-off

After automated results are surfaced, present the human checks as a muster table:

```
| #  | ID    | Check                              | Severity | Status  |
|----|-------|------------------------------------|----------|---------|
| 1  | H-001 | Create sit: available-now flow      | blocker  | pending |
| ...
```

The Captain will walk through these manually against a running `pnpm dev` instance and mark pass/fail.

---

## TASK 4: Commit QA Checklist

Once the automated checks are run and the YAML is updated with results:

```
git add docs/internal/qa-checklist.yaml .env.example
git commit -m "chore: QA checklist — 15 automated checks + 23 human verification items"
```

---

## TASK 5: Performance Investigation

Captain's order from session 3: investigate page load time. Low-hanging fruit, not complex caching architectures.

### What to investigate

**Board page (`app/app/page.tsx`)** currently does:
1. `await auth()` — Clerk auth check
2. `await getUserByClerkId(clerkId)` — DB roundtrip to get internal user
3. `await listOpenSits()` — DB roundtrip to get open sits

These are **serial** — each awaits before the next starts.

**App layout (`app/app/layout.tsx`)** does on EVERY page:
1. `await auth()` — Clerk auth check
2. `await currentUser()` — Clerk API call
3. `await ensureUserExists(...)` — DB roundtrip (upsert)

This means board page actually does **6 serial async calls** (3 in layout + 3 in page).

### Low-hanging fruit to evaluate

1. **`Promise.all` where possible** — `getUserByClerkId` and `listOpenSits` are independent after `auth()` returns. Run them in parallel.

2. **Layout deduplication** — `auth()` is called in both layout and page. Next.js deduplicates `fetch` calls but Clerk's `auth()` is not a fetch — verify whether it's memoized per request. If not, the page call is redundant.

3. **`ensureUserExists` frequency** — This runs on every page load for every authenticated user. After the first visit, the user always exists. Consider:
   - Cache the existence check with `React.cache()` (per-request memoization)
   - Or check a cookie/header that indicates "user synced this session"

4. **Polling mechanism** — Board uses `<PollingWrapper>` with `router.refresh()` every 20s. This triggers a full RSC re-render of the entire page tree (layout + page). Consider:
   - Client-side data fetching (React Query / SWR / plain fetch) for the sit list only
   - Or `revalidateTag` with on-demand ISR when sits are created/joined

5. **`unstable_cache` / `cache()`** — For `getUserByClerkId`, user data changes rarely. Could cache for 60s.

### What to produce

1. **Read all data-fetching code** — board page, layout, each action that mutates sits
2. **Measure current state** — Add timing logs or use `performance.now()` to measure each call
3. **Propose changes** as a plan with expected impact, ordered by effort:cost ratio
4. **Implement the lowest-effort wins** — `Promise.all` parallelisation is nearly free
5. **Run gate after changes**

### Constraints
- Do NOT introduce React Query or SWR yet — that's a larger change the Captain hasn't approved
- Do NOT add complex caching layers
- DO parallelize independent calls
- DO eliminate redundant calls
- DO use `React.cache()` for per-request memoization if appropriate

---

## Files of Interest

```
app/app/page.tsx              — Board page (serial data fetching)
app/app/layout.tsx            — App layout (auth + user sync on every load)
app/app/my-sits/page.tsx      — My sits page
app/app/create/page.tsx       — Create sit form page
app/app/profile/page.tsx      — Profile page
components/polling-wrapper.tsx — Client-side polling via router.refresh()
db/queries.ts                 — All DB queries (listOpenSits, getUserByClerkId, getUserSits)
db/client.ts                  — Neon pool connection
lib/user-sync.ts              — ensureUserExists (called from layout)
lib/auth.ts                   — requireUser helper
actions/*.ts                  — Server actions (create, join, leave, cancel, list, my-sits, update-profile)
docs/internal/qa-checklist.yaml — QA checklist (Section 1 complete, Section 2 needs writing)
.env.example                  — Missing NEXT_PUBLIC_APP_URL
```

## Key Constraints
- **Gate command:** `make gate` (typecheck + lint + vitest)
- **Standing orders:** Read `AGENTS.md` — truth >> convenience, atomic commits, gate green before done
- **Commit style:** conventional commits (`feat:`, `fix:`, `chore:`)
- Deploy is **DEFERRED** — do not set up GitHub remote or Vercel
- DC-2 cross-model darkcat is **DEFERRED** — do not attempt
