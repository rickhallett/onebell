# SD-008: Production Walkthrough Checklist

**Date:** 2026-03-09
**Status:** ACTIVE
**Depends on:** SD-007 (E2E infrastructure), P0–P9 (all phases complete)

## Purpose

Structured walkthrough to verify production readiness before handing the system to real practitioners. Each item is tagged with who executes it.

```
[M] = machine (agent can execute and verify)
[H] = human (Captain must do this — requires credentials, taste, or external service)
[H+M] = human initiates, machine verifies
```

---

## Phase 1: Infrastructure (must complete before anything else)

| # | Item | Who | Pass criteria | Status |
|---|------|-----|--------------|--------|
| 1.1 | Provision Vercel project | [H] | `vercel` CLI links to project, or dashboard shows project | ☐ |
| 1.2 | Provision production Neon database | [H] | `DATABASE_URL` for production obtained | ☐ |
| 1.3 | Run DB migrations on production | [H+M] | `pnpm db:migrate` succeeds against production `DATABASE_URL` | ☐ |
| 1.4 | Create Clerk production instance (or confirm dev instance is sufficient for soft launch) | [H] | `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` for production obtained | ☐ |
| 1.5 | Configure Resend domain (`onebell.app` or chosen domain) | [H] | Resend dashboard shows domain verified, `RESEND_API_KEY` for production obtained | ☐ |
| 1.6 | Set all env vars on Vercel | [H] | `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `RESEND_API_KEY` all set in Vercel dashboard | ☐ |
| 1.7 | Deploy to Vercel | [H] | `vercel --prod` or git push triggers deploy, build succeeds | ☐ |
| 1.8 | Verify deployment is live | [H] | Production URL responds with landing page | ☐ |

---

## Phase 2: Auth & User Sync (E1, E2, E19)

| # | Item | Who | Pass criteria | Status |
|---|------|-----|--------------|--------|
| 2.1 | Visit production URL unauthenticated, click "Sign in" | [H] | Redirects to Clerk sign-in page | ☐ |
| 2.2 | Sign up as a new user (fresh email, not test user) | [H] | Sign-up completes, redirected to `/app` | ☐ |
| 2.3 | Verify user record created in production DB | [H+M] | Query `SELECT * FROM users WHERE clerk_user_id = '<id>'` returns 1 row | ☐ |
| 2.4 | Verify `display_name` is derived from Clerk name | [H] | Name on board/nav matches Clerk first+last name | ☐ |
| 2.5 | Try accessing `/app` in incognito (unauthenticated) | [H] | Redirects to sign-in (E19) | ☐ |
| 2.6 | Try accessing `/app/create`, `/app/my-sits`, `/app/profile` unauthenticated | [H] | All redirect to sign-in (E19) | ☐ |
| 2.7 | Refresh page after sign-in | [H] | Session persists (E1) | ☐ |

---

## Phase 3: Profile (E3)

| # | Item | Who | Pass criteria | Status |
|---|------|-----|--------------|--------|
| 3.1 | Navigate to Profile page | [H] | Form shows current display name, timezone defaults to UTC | ☐ |
| 3.2 | Change display name, select timezone, add bio, toggle "open to beginners" | [H] | Form accepts all inputs | ☐ |
| 3.3 | Click "Save Profile" | [H] | Success feedback (no error) | ☐ |
| 3.4 | Reload the Profile page | [H] | All saved values persist (E3) — this is the critical check | ☐ |
| 3.5 | Verify in DB | [H+M] | `SELECT display_name, timezone, bio, open_to_beginners FROM users WHERE ...` matches | ☐ |

---

## Phase 4: Sit Creation (E4, E5)

| # | Item | Who | Pass criteria | Status |
|---|------|-----|--------------|--------|
| 4.1 | Navigate to Create a Sit | [H] | "Start now" tab active by default | ☐ |
| 4.2 | Fill instruction, meeting link, select 20 min, click "Start a sit now" | [H] | Redirects to board, sit appears in Available Now | ☐ |
| 4.3 | Verify sit in DB | [H+M] | `SELECT * FROM sits ORDER BY created_at DESC LIMIT 1` — status=open, starts_at within 10 min (E4) | ☐ |
| 4.4 | Create a scheduled sit (switch to Schedule tab, pick future time) | [H] | Redirects to board, sit appears in Upcoming | ☐ |
| 4.5 | Verify scheduled sit in DB | [H+M] | starts_at > now + 10min, status=open (E5) | ☐ |

---

## Phase 5: Board & Two-User Flow (E6, E7, E8, E9, E10)

**Requires two users.** Use two browsers or incognito + normal.

| # | Item | Who | Pass criteria | Status |
|---|------|-----|--------------|--------|
| 5.1 | Sign in as User A (host), create an Available Now sit | [H] | Sit appears on board | ☐ |
| 5.2 | Verify board is sorted by starts_at | [H] | Available Now sits before Upcoming, ordered by time (E6) | ☐ |
| 5.3 | Verify host does NOT see "Sit together" on own sit | [H] | No join button visible on own card (E8) | ☐ |
| 5.4 | Sign in as User B (guest) in second browser | [H] | Board loads, shows User A's sit | ☐ |
| 5.5 | User B clicks "Sit together" on User A's sit | [H] | Sit status changes, button disappears or page updates (E7) | ☐ |
| 5.6 | Verify join in DB | [H+M] | `guest_user_id` set, status=joined (E7) | ☐ |
| 5.7 | User B navigates to My Sits | [H] | Sit appears in "Joined" section, meeting link visible (E16) | ☐ |
| 5.8 | User A navigates to My Sits | [H] | Sit appears in "Hosting" section with guest name | ☐ |
| 5.9 | User B clicks "Leave Sit" | [H] | Sit disappears from Joined, back to open on board (E9) | ☐ |
| 5.10 | User A navigates to My Sits, clicks "Cancel Sit" on hosting sit | [H] | Confirms dialog, sit cancelled (E10) | ☐ |
| 5.11 | User B refreshes board | [H] | Cancelled sit no longer visible | ☐ |

---

## Phase 6: Email Verification (E12, E13, E14)

**This is the coordination channel. If emails don't work, practitioners can't meet.**

| # | Item | Who | Pass criteria | Status |
|---|------|-----|--------------|--------|
| 6.1 | Verify `RESEND_API_KEY` is set in production | [H] | Env var present in Vercel | ☐ |
| 6.2 | Verify `from` address domain matches Resend verified domain | [H] | `noreply@onebell.app` (in `lib/email.ts`) matches Resend domain. If domain is different, update `FROM_EMAIL` | ☐ |
| 6.3 | User A creates sit, User B joins | [H] | Both receive "Your sit has been confirmed" email (E12) | ☐ |
| 6.4 | Check email content | [H] | Shows partner name, time, duration, instruction, "Open Meeting" link | ☐ |
| 6.5 | Click "Open Meeting" link in email | [H] | Opens the meeting URL provided by host | ☐ |
| 6.6 | User B leaves the sit | [H] | User A receives "guest left" email (E13) | ☐ |
| 6.7 | User A creates new sit, User B joins, User A cancels | [H] | User B receives "sit cancelled" email (E14) | ☐ |
| 6.8 | Check Resend dashboard delivery logs | [H] | All emails show "delivered" status, no bounces | ☐ |

---

## Phase 7: Edge Cases & Resilience (E11, E18, E20)

| # | Item | Who | Pass criteria | Status |
|---|------|-----|--------------|--------|
| 7.1 | Wait 20 minutes after creating an Available Now sit (or create one with starts_at in the past via DB) | [H] | Expired sit does NOT appear on board (E11) | ☐ |
| 7.2 | Ensure board is empty (cancel/expire all sits) | [H] | Empty state CTA renders — "Start a sit now" / "Schedule a sit" visible (E18) | ☐ |
| 7.3 | Verify My Sits empty state | [H] | "You are not hosting any sits" / "You have not joined any sits" visible | ☐ |
| 7.4 | Board polls for updates | [H] | Create sit in one browser, wait ~20s in second browser without refreshing — sit appears (E17) | ☐ |
| 7.5 | Server-side auth on mutations | [M] | Action orchestration tests cover this (35 tests, all auth failure paths tested) (E20) — already verified | ☐ |

---

## Phase 8: Non-Functional (NF1–NF4)

| # | Item | Who | Pass criteria | Status |
|---|------|-----|--------------|--------|
| 8.1 | Open production URL on actual phone (iPhone SE or similar small screen) | [H] | Layout is usable, no horizontal scroll, text readable (NF1) | ☐ |
| 8.2 | Tap all interactive elements on phone | [H] | All buttons/links easily tappable, no mis-taps (NF2) | ☐ |
| 8.3 | Run Lighthouse on production URL (Performance tab) | [H] | Note LCP and FCP times. Target: < 3s on simulated 3G (NF3) | ☐ |
| 8.4 | Simultaneous join test (optional stress test) | [H] | Two users click "Sit together" at exact same time — only one succeeds, other gets error. No double-booking (NF4) | ☐ |

---

## Phase 9: Pre-Launch Cleanup

| # | Item | Who | Pass criteria | Status |
|---|------|-----|--------------|--------|
| 9.1 | Remove test sits from production DB | [H+M] | `DELETE FROM sits WHERE ...` for any test data | ☐ |
| 9.2 | Verify `FROM_EMAIL` in `lib/email.ts` matches production domain | [M] | Currently `noreply@onebell.app` — confirm this is correct or update | ☐ |
| 9.3 | Confirm middleware deprecation impact | [M] | Next.js 16 warns about middleware → proxy migration. Document whether this needs addressing before launch or can wait | ☐ |
| 9.4 | Run full E2E suite against production (optional) | [M] | Point `baseURL` at production URL, run `pnpm test:e2e` | ☐ |
| 9.5 | Update PLAN.md — mark P10 complete | [M] | Completed table updated | ☐ |

---

## Summary: What blocks launch

```
BLOCKER   := Phase 1 (no infra = no app)
BLOCKER   := 6.2 (wrong from address = emails bounce = coordination broken)
HIGH_RISK := 6.3-6.7 (emails never tested with real delivery)
MEDIUM    := 3.4 (profile save+persist never E2E verified)
MEDIUM    := 2.2-2.3 (first-login user sync never tested with fresh user)
LOW       := 8.3 (performance unknown but unlikely to be catastrophic)
LOW       := 9.3 (middleware works today, risk is future upgrades)
```

The walkthrough is designed to be done in order. Phase 1 unlocks everything else. Phases 2-7 can be done in a single sitting with two browser windows. Phase 8 needs a phone. Phase 9 is cleanup.

Estimated wall-clock time: **45-60 minutes** for the human portions, assuming infrastructure provisioning goes smoothly.
