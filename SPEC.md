# ninebells — MVP Specification

Version: **v0.2**

Goal: Launch a minimal coordination tool that allows practitioners to **signal availability and form dyad inquiry sits**.

Primary test:

> Will practitioners actually meet through the system?

---

## 1. Product Overview

ninebells is a **mobile-first web app** where practitioners can:

1. Signal **Available Now** to sit immediately
2. **Schedule a sit** in the future
3. **Join** another practitioner's sit
4. **Cancel or leave** if plans change

The app **does not host video meetings**. Users supply an external meeting link (Zoom, Meet, Jitsi, etc). The platform only coordinates the meeting.

---

## 2. Core Concept

The primary object in the system is a **Sit**.

A Sit represents a **dyad inquiry session between exactly two participants**.

Each Sit has:

- one **host**
- zero or one **guest**

---

## 3. Sit Types

Two UI classifications exist.

### Available Now

Immediate availability signal.

Definition:

```
starts_at <= now + 10 minutes
```

Displayed in **Available Now** section. Automatically expires if not joined.

### Scheduled Sit

Future scheduled meeting.

Definition:

```
starts_at > now + 10 minutes
```

Displayed in **Upcoming Sits**.

---

## 4. Sit Lifecycle

Each sit has a **single explicit status**.

Allowed values:

```
open | joined | cancelled | completed | expired
```

Lifecycle transitions:

```
open -> joined -> completed
open -> cancelled
joined -> cancelled
open -> expired
```

---

## 5. Authentication

System uses **Clerk**.

Requirements:

- email sign-in
- session persistence
- protected routes

On first login: create user record in DB.

---

## 6. User Profile

Required fields:

```
display_name
timezone
```

Optional:

```
bio
open_to_beginners
```

Users may update profile.

---

## 7. Sit Creation

### Create Available Now

Button: `Start a sit now`

Defaults:

```
starts_at = now + 3 minutes
duration = 40
practice_type = EI
instruction = last used instruction
```

User confirms and sit is created.

### Schedule Sit

Form fields:

```
start_time
duration
practice_type
instruction
meeting_url
optional_note
```

Constraints:

```
start_time must be future
duration from preset list
meeting_url must be valid URL
```

---

## 8. Joining a Sit

Users may join a sit if:

```
status == open
guest_user_id == null
host_user_id != current_user
```

Join is executed in a **database transaction**.

On success:

```
guest_user_id = user
status = joined
```

Send email confirmation to both participants.

---

## 9. Leaving a Sit

Guest may leave if:

```
status == joined
guest_user_id == current_user
```

Action:

```
guest_user_id = null
status = open
```

Host receives email notification.

---

## 10. Cancelling a Sit

Host may cancel if:

```
host_user_id == current_user
```

Action:

```
status = cancelled
cancelled_at = timestamp
```

Guest receives email if present.

---

## 11. Sit Expiry

Available-now sits expire if not joined.

Rule:

```
open sit
starts_at < now - 20 minutes
-> expired
```

Implementation: handled during queries rather than background job.

---

## 12. Open Sit Listing

Endpoint returns:

```
status = open
starts_at > now - 20 minutes
```

Sorted by `starts_at ASC`.

UI sections: `Available Now` and `Upcoming`. Classification determined client-side.

---

## 13. My Sits View

Shows: Hosting, Joined, Past.

Each sit displays: time, instruction, partner, status, meeting link.

Actions: Cancel Sit, Leave Sit, Open Meeting Link.

---

## 14. Notifications

Email only for MVP.

Triggers:

| Event | Recipient |
|-------|-----------|
| Sit joined | Host and guest |
| Guest left | Host |
| Sit cancelled | Guest |

Optional (later): 15 minute reminder.

---

## 15. User Interface Structure

Main screen:

```
ninebells

AVAILABLE NOW

Richard
Who am I
40 min
[ Join ]

Maya
Tell me who you are
[ Join ]

--------------------

UPCOMING

19:00 — Daniel
20:30 — Sofia

+ Start a sit now
+ Schedule sit
```

Design goals: mobile-first, large tap targets, single-column layout, minimal navigation.

---

## 16. Empty State

If no sits exist:

```
No sits right now.
Be the first to open one.
[ Start a sit now ]
[ Schedule sit ]
```

---

## 17. Database Schema

### users

| Column | Type |
|--------|------|
| id | uuid pk |
| clerk_user_id | text unique |
| display_name | text |
| timezone | text |
| bio | text |
| open_to_beginners | boolean |
| created_at | timestamptz |
| updated_at | timestamptz |

### sits

| Column | Type |
|--------|------|
| id | uuid pk |
| host_user_id | uuid fk |
| guest_user_id | uuid nullable fk |
| starts_at | timestamptz |
| duration_minutes | integer |
| practice_type | text |
| instruction_text | text |
| meeting_url | text |
| note | text |
| status | text |
| created_at | timestamptz |
| updated_at | timestamptz |
| cancelled_at | timestamptz |

---

## 18. Core Backend Operations

Five domain operations:

```
createSit
joinSit
leaveSit
cancelSit
listOpenSits
```

---

## 19. Tech Stack

```
Next.js (App Router)
Vercel
Clerk (auth)
Neon Postgres
Drizzle ORM
Resend (email)
Tailwind CSS
date-fns
Zod
```

---

## 20. Polling Strategy

No realtime infra. Open sits page refreshes every 20 seconds. Manual refresh also supported.

---

## 21. Routes

```
/app
/app/create
/app/my-sits
/app/profile
```

---

## 22. Security Requirements

- Authenticated users only
- Server-side authorization on all mutations
- Meeting links not publicly indexed
- Host cannot join own sit
- Guest slot enforced via transaction

---

## 23. Analytics Events

```
user_signed_up
sit_created
sit_joined
sit_left
sit_cancelled
sit_completed
```

---

## 24. Out of Scope for MVP

```
chat
calendar integration
recurring sits
availability grids
realtime websockets
payments
reputation systems
ratings
group sits
```

---

## 25. Success Metrics

Primary: completed sits per week.

Secondary: open sits created, join rate, median time to join, repeat users.

---

## 26. Deployment

Target: Vercel.

Environment variables:

```
DATABASE_URL
CLERK_SECRET_KEY
CLERK_PUBLISHABLE_KEY
RESEND_API_KEY
```

---

## 27. Guiding Product Principle

ninebells should feel like a **physical bulletin board in a meditation hall**.

The system should reduce the path from `I want to sit` to `I am sitting with someone` to **two or three taps**.
