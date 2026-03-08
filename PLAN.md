# ninebells — Build Plan

Version: **v1.0**
Spec: `SPEC.md v0.2`
Eval: `EVAL.md`

---

## Phases Overview

| Phase | Name | Description | PRs | Deps |
|-------|------|-------------|-----|------|
| P0 | Scaffold | Project init, tooling, gate, empty app shell | 3 | None |
| P1 | Data Layer | Schema, migrations, DB client, domain operations | 2 | P0 |
| P2 | Auth | Clerk integration, middleware, user sync | 2 | P0 |
| P3 | Core Domain | Sit CRUD server actions with validation | 2 | P1, P2 |
| P4 | Board UI | Open sits listing, Available Now / Upcoming split, polling | 2 | P3 |
| P5 | Sit Creation UI | Create Available Now + Schedule Sit forms | 2 | P3 |
| P6 | My Sits | User's sits view (hosting, joined, past) | 1 | P3 |
| P7 | Profile | Profile page with edit form | 1 | P2 |
| P8 | Email | Resend integration, transactional email on sit events | 2 | P3 |
| P9 | Polish | Empty states, mobile refinement, error handling, analytics events | 2 | P4-P8 |
| P10 | Deploy | Vercel deployment, env config, production smoke test | 1 | P9 |

**Estimated total: ~20 PRs, ~8-12 agentic hours**

---

## Phase Details

---

### P0 — Scaffold

**Goal:** Bootable Next.js app with TypeScript, Tailwind, linting, gate command, and app shell layout.

#### PR 0.1 — Project Init

**Scope:** Initialize Next.js App Router project with TypeScript, Tailwind CSS, ESLint.

**Files:**
```
package.json
tsconfig.json
tailwind.config.ts
postcss.config.js
next.config.ts
app/layout.tsx
app/page.tsx
.eslintrc.json
.env.example
.gitignore (update)
```

**Verification:**
- `pnpm dev` starts without error
- `pnpm build` succeeds
- `pnpm lint` passes

**Eval refs:** None (infrastructure)

---

#### PR 0.2 — Gate Command

**Scope:** Configure the verification gate in Makefile and package.json.

**Files:**
```
package.json (scripts: typecheck, lint, test, gate)
Makefile (GATE variable)
```

**Gate command:**
```bash
pnpm run typecheck && pnpm run lint && pnpm run test
```

**Verification:**
- `make gate` runs and exits 0
- `pnpm run gate` runs and exits 0

**Eval refs:** None (infrastructure)

---

#### PR 0.3 — App Shell & Layout

**Scope:** Mobile-first app shell with single-column layout, navigation, and route stubs.

**Files:**
```
app/app/layout.tsx
app/app/page.tsx
app/app/create/page.tsx
app/app/my-sits/page.tsx
app/app/profile/page.tsx
components/app-shell.tsx
```

**Verification:**
- All four routes render without error
- Mobile layout correct at 375px viewport
- Gate green

**Eval refs:** NF1, NF2

---

### P1 — Data Layer

**Goal:** Database schema deployed, Drizzle ORM configured, domain queries operational.

**Depends on:** P0

#### PR 1.1 — Schema & Migrations

**Scope:** Drizzle schema for `users` and `sits` tables, migration generation, Neon client.

**Files:**
```
db/schema.ts
db/client.ts
drizzle.config.ts
package.json (drizzle-kit, @neondatabase/serverless)
```

**Verification:**
- `pnpm drizzle-kit generate` produces migration
- `pnpm drizzle-kit push` applies to Neon (dev)
- Schema matches SPEC.md section 17
- Gate green

**Eval refs:** E2 (schema prerequisite)

---

#### PR 1.2 — Domain Queries

**Scope:** Query functions for the five core operations: createSit, joinSit, leaveSit, cancelSit, listOpenSits. Plus getUserByClerkId, upsertUser.

**Files:**
```
db/queries.ts
lib/sit-utils.ts (isAvailableNow, isExpired helpers)
lib/validation.ts (Zod schemas for sit creation/scheduling)
```

**Verification:**
- Unit tests for each query function
- Unit tests for isAvailableNow threshold logic
- Unit tests for Zod validation schemas
- joinSit uses transaction for atomicity
- Gate green

**Eval refs:** E4, E5, E7, E8, E9, E10, E11, E20, NF4

---

### P2 — Auth

**Goal:** Clerk auth working, middleware protecting routes, user auto-creation on first login.

**Depends on:** P0

#### PR 2.1 — Clerk Integration

**Scope:** Install Clerk, configure provider, middleware for route protection.

**Files:**
```
middleware.ts
app/layout.tsx (ClerkProvider)
lib/auth.ts (requireUser helper)
package.json (@clerk/nextjs)
.env.example (CLERK_* vars)
```

**Verification:**
- Unauthenticated access to /app/* redirects to sign-in
- Sign-in flow completes
- Session persists across refresh
- Gate green

**Eval refs:** E1, E19

---

#### PR 2.2 — User Sync Webhook

**Scope:** On first Clerk login, create user record in DB. Webhook or auth callback approach.

**Files:**
```
app/api/webhooks/clerk/route.ts (or auth callback approach)
db/queries.ts (upsertUser — extend from PR 1.2)
```

**Verification:**
- New Clerk user -> DB record created with clerk_user_id
- Existing user -> no duplicate
- Gate green

**Eval refs:** E2

---

### P3 — Core Domain

**Goal:** All five sit mutations operational as Next.js server actions with authorization.

**Depends on:** P1, P2

#### PR 3.1 — Sit Mutation Actions

**Scope:** Server actions for createSit, joinSit, leaveSit, cancelSit with auth checks.

**Files:**
```
actions/create-sit.ts
actions/join-sit.ts
actions/leave-sit.ts
actions/cancel-sit.ts
```

**Authorization rules per action:**
- createSit: authenticated user
- joinSit: authenticated, not host, sit is open, no guest
- leaveSit: authenticated, is current guest
- cancelSit: authenticated, is host

**Verification:**
- Each action enforces auth
- Each action enforces business rules
- joinSit is transactional
- Error cases return meaningful errors
- Gate green

**Eval refs:** E4, E5, E7, E8, E9, E10, E20

---

#### PR 3.2 — Sit Query Actions

**Scope:** Server-side data fetching for open sits list and user's sits.

**Files:**
```
actions/list-sits.ts (open sits, filtered for expiry)
actions/my-sits.ts (user's hosting, joined, past sits)
```

**Verification:**
- Open sits excludes expired (starts_at < now - 20min)
- Open sits sorted by starts_at ASC
- My sits correctly categorizes hosting/joined/past
- Gate green

**Eval refs:** E11, E15

---

### P4 — Board UI

**Goal:** Main sit board renders Available Now and Upcoming sections with live polling.

**Depends on:** P3

#### PR 4.1 — Sit Board Page

**Scope:** Open sits board with Available Now / Upcoming split, sit cards with join button.

**Files:**
```
app/app/page.tsx (board page)
components/sit-card.tsx
components/sit-list.tsx
components/join-button.tsx
```

**Verification:**
- Available Now section shows sits with starts_at <= now + 10min
- Upcoming section shows sits with starts_at > now + 10min
- Join button calls joinSit action
- Host's own sits show without join button
- Mobile layout correct at 375px
- Gate green

**Eval refs:** E6, E7, E8, NF1, NF2

---

#### PR 4.2 — Polling & Refresh

**Scope:** Client-side polling every 20 seconds on the board page. Manual refresh button.

**Files:**
```
app/app/page.tsx (polling hook)
components/refresh-button.tsx (optional)
```

**Verification:**
- Board re-fetches every 20s without full page reload
- New sit created by another user appears within 20s
- Manual refresh works
- Gate green

**Eval refs:** E17

---

### P5 — Sit Creation UI

**Goal:** Both sit creation flows functional with validation.

**Depends on:** P3

#### PR 5.1 — Available Now Flow

**Scope:** "Start a sit now" button and confirmation. Defaults: starts_at = now + 3min, duration = 40, practice_type = EI.

**Files:**
```
app/app/create/page.tsx (or modal)
components/create-sit-form.tsx (Available Now variant)
```

**Verification:**
- One-tap flow: button -> confirm -> sit created
- Defaults applied correctly
- Redirects to board after creation
- Gate green

**Eval refs:** E4

---

#### PR 5.2 — Schedule Sit Flow

**Scope:** Full form for scheduling a future sit with validation.

**Files:**
```
components/create-sit-form.tsx (Schedule variant)
lib/validation.ts (extend for schedule constraints)
```

**Form fields:** start_time, duration (preset list), practice_type, instruction, meeting_url, note.

**Verification:**
- start_time must be future (validation error otherwise)
- meeting_url validated as URL
- Duration from preset list only
- Redirects to board after creation
- Gate green

**Eval refs:** E5

---

### P6 — My Sits

**Goal:** User can view their hosting, joined, and past sits with actions.

**Depends on:** P3

#### PR 6.1 — My Sits Page

**Scope:** Three-section view: Hosting, Joined, Past. Action buttons: Cancel, Leave, Open Meeting Link.

**Files:**
```
app/app/my-sits/page.tsx
components/cancel-button.tsx
components/leave-button.tsx
```

**Verification:**
- Hosting section shows user's created sits
- Joined section shows sits where user is guest
- Past section shows completed/cancelled sits
- Cancel button calls cancelSit (host only)
- Leave button calls leaveSit (guest only)
- Meeting link opens in new tab
- Gate green

**Eval refs:** E9, E10, E15, E16

---

### P7 — Profile

**Goal:** Users can view and edit their profile.

**Depends on:** P2

#### PR 7.1 — Profile Page

**Scope:** Profile view and edit form for display_name, timezone, bio, open_to_beginners.

**Files:**
```
app/app/profile/page.tsx
actions/update-profile.ts
```

**Verification:**
- Current values displayed on load
- Edit saves to DB
- Timezone selector with common options
- Gate green

**Eval refs:** E3

---

### P8 — Email

**Goal:** Transactional emails sent on sit lifecycle events.

**Depends on:** P3

#### PR 8.1 — Resend Integration

**Scope:** Resend client setup, email sending utility.

**Files:**
```
lib/email.ts (Resend client, sendEmail helper)
package.json (resend)
.env.example (RESEND_API_KEY)
```

**Verification:**
- Resend client initializes
- Test email sends successfully
- Gate green

**Eval refs:** E12, E13, E14 (prerequisite)

---

#### PR 8.2 — Sit Event Emails

**Scope:** Email templates and integration with sit actions.

**Files:**
```
emails/sit-joined.ts
emails/sit-cancelled.ts
emails/guest-left.ts
actions/join-sit.ts (add email send)
actions/leave-sit.ts (add email send)
actions/cancel-sit.ts (add email send)
```

**Email triggers:**
- joinSit -> email to host + guest
- leaveSit -> email to host
- cancelSit -> email to guest (if exists)

**Verification:**
- Each action sends correct email to correct recipient
- Email contains sit details (time, instruction, meeting link)
- Email failure does not block the mutation (fire-and-forget or catch)
- Gate green

**Eval refs:** E12, E13, E14

---

### P9 — Polish

**Goal:** Production-ready UX with empty states, error handling, and analytics.

**Depends on:** P4, P5, P6, P7, P8

#### PR 9.1 — Empty States & Error Handling

**Scope:** Empty state UI for board and my-sits. Error boundaries. Loading states.

**Files:**
```
components/empty-state.tsx
app/app/page.tsx (empty state integration)
app/app/my-sits/page.tsx (empty state integration)
app/error.tsx (error boundary)
app/loading.tsx
```

**Verification:**
- No sits -> empty state with CTAs displayed
- Server errors -> error boundary catches, user sees friendly message
- Loading states render during data fetch
- Gate green

**Eval refs:** E18

---

#### PR 9.2 — Analytics Events & Mobile Polish

**Scope:** Client-side analytics event tracking. Final mobile responsive pass.

**Files:**
```
lib/analytics.ts (event tracking stubs)
actions/*.ts (emit events on mutations)
components/*.tsx (responsive audit)
```

**Events tracked:**
```
user_signed_up, sit_created, sit_joined,
sit_left, sit_cancelled, sit_completed
```

**Verification:**
- Events fire on correct actions
- All UI usable at 375px viewport
- Tap targets >= 44x44px
- Gate green

**Eval refs:** NF1, NF2, NF3

---

### P10 — Deploy

**Goal:** Production deployment on Vercel, passing smoke test.

**Depends on:** P9

#### PR 10.1 — Production Deployment

**Scope:** Vercel project config, environment variables, production migration, smoke test.

**Files:**
```
vercel.json (if needed)
```

**Steps:**
1. Connect GitHub repo to Vercel
2. Set environment variables: DATABASE_URL, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, RESEND_API_KEY
3. Run production migration
4. Deploy
5. Smoke test: sign in -> create sit -> join sit (from second account) -> verify email

**Verification:**
- Production URL loads
- Sign-in works
- Full sit lifecycle completes
- Emails arrive
- All EVAL.md criteria E1-E20 pass

**Eval refs:** All

---

## Dependency Graph

```
P0 (Scaffold)
├── P1 (Data Layer)
│   └── P3 (Core Domain) ← also depends on P2
│       ├── P4 (Board UI)
│       ├── P5 (Sit Creation UI)
│       ├── P6 (My Sits)
│       └── P8 (Email)
├── P2 (Auth)
│   ├── P3 (Core Domain)
│   └── P7 (Profile)
└── (all) → P9 (Polish) → P10 (Deploy)
```

**Critical path:** P0 -> P1 + P2 (parallel) -> P3 -> P4 + P5 + P6 + P8 (parallel) -> P9 -> P10

**Parallelism:** P1 and P2 can run in parallel. P4, P5, P6, P7, P8 can run in parallel after P3.

---

## Completed Table

Track completion as phases merge. Update after each post-merge verification.

| Phase | PR | Status | Merged | Post-Verified | Notes |
|-------|-----|--------|--------|---------------|-------|
| P0 | 0.1 | pending | — | — | |
| P0 | 0.2 | pending | — | — | |
| P0 | 0.3 | pending | — | — | |
| P1 | 1.1 | pending | — | — | |
| P1 | 1.2 | pending | — | — | |
| P2 | 2.1 | pending | — | — | |
| P2 | 2.2 | pending | — | — | |
| P3 | 3.1 | pending | — | — | |
| P3 | 3.2 | pending | — | — | |
| P4 | 4.1 | pending | — | — | |
| P4 | 4.2 | pending | — | — | |
| P5 | 5.1 | pending | — | — | |
| P5 | 5.2 | pending | — | — | |
| P6 | 6.1 | pending | — | — | |
| P7 | 7.1 | pending | — | — | |
| P8 | 8.1 | pending | — | — | |
| P8 | 8.2 | pending | — | — | |
| P9 | 9.1 | pending | — | — | |
| P9 | 9.2 | pending | — | — | |
| P10 | 10.1 | pending | — | — | |
