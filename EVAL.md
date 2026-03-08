# ninebells — Evaluation Criteria

## Primary Success Criterion

> A real practitioner can sign in, create a sit, and have another practitioner join it — resulting in a completed dyad inquiry session coordinated through the platform.

This is binary. Either practitioners meet through the system or they do not.

---

## Functional Acceptance Tests

Each must pass before MVP is considered complete.

| # | Criterion | Verification |
|---|-----------|-------------|
| E1 | User can sign in via Clerk email auth | Manual: sign in, session persists across refresh |
| E2 | User profile is created on first login | DB: user record exists with clerk_user_id |
| E3 | User can update display_name and timezone | Manual: edit profile, values persist |
| E4 | User can create an Available Now sit | DB: sit created with starts_at <= now + 10min, status = open |
| E5 | User can schedule a future sit | DB: sit created with starts_at > now + 10min, status = open |
| E6 | Open sits appear on the board, sorted by starts_at | Manual: board shows Available Now and Upcoming sections |
| E7 | User can join an open sit | DB: guest_user_id set, status = joined (transaction) |
| E8 | Host cannot join own sit | Manual: join button not shown or action rejected |
| E9 | Guest can leave a joined sit | DB: guest_user_id = null, status = open |
| E10 | Host can cancel a sit | DB: status = cancelled, cancelled_at set |
| E11 | Expired sits do not appear on the board | Query: open sits with starts_at < now - 20min excluded |
| E12 | Email sent when sit is joined | Resend logs: email to host and guest |
| E13 | Email sent when guest leaves | Resend logs: email to host |
| E14 | Email sent when sit is cancelled | Resend logs: email to guest |
| E15 | My Sits view shows hosting, joined, and past sits | Manual: all three sections render correctly |
| E16 | Meeting link accessible to joined participants | Manual: link visible in joined sit card |
| E17 | Board refreshes via polling (20s interval) | Manual: new sit appears without page reload |
| E18 | Empty state renders correctly | Manual: no sits -> CTA displayed |
| E19 | All routes protected (unauthenticated -> redirect) | Manual: direct URL access redirects to sign-in |
| E20 | Server-side authorization on all mutations | Test: API rejects unauthorized requests |

---

## Non-Functional Requirements

| # | Criterion | Threshold |
|---|-----------|-----------|
| NF1 | Mobile-first layout | Usable on 375px viewport (iPhone SE) |
| NF2 | Tap target size | Minimum 44x44px on interactive elements |
| NF3 | Page load | < 3s on 3G connection (Vercel edge) |
| NF4 | Join transaction | Atomic — no double-booking under concurrent joins |

---

## Success Metrics (Post-Launch)

| Metric | Target (first 4 weeks) |
|--------|----------------------|
| Completed sits per week | > 0 (any is signal) |
| Open sits created | Tracked |
| Join rate (joined / created) | Tracked |
| Median time to join | Tracked |
| Repeat users (2+ sits) | Tracked |

---

## Failure Signals

The MVP has failed if any of these are true after 4 weeks of availability with real practitioners:

1. Zero completed sits
2. Users create sits but no one joins (demand without supply matching)
3. Users sign up but never create or join a sit (UX friction too high)
4. Email notifications do not arrive (coordination breaks down)
