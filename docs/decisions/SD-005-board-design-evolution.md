# SD-005: Board Design Evolution

**Date:** 2026-03-08
**Status:** ACTIVE
**Commits:** `d57b1bf` (v1), `f3a5ca8` (v2)

## Context

After building the full P0-P9 feature set with the Zendo theme (warm minimalism — `#F5F0E8` background, charcoal `#2C2825` text, sage `#7C8B6F` accent, Lora/Geist fonts), the board was functional but visually plain. The palette and typography were right, but the cards were informationally thin and visually flat — everything carried equal weight. For a contemplative practice app, the board needed to feel like a space, not a spreadsheet.

Two distinct enrichment passes were made, each committed separately so the Captain could compare and choose.

---

## Level 1 — Informational Richness (`d57b1bf`)

**Problem:** Cards showed only name, instruction, duration, and a Join button. Four lines in a `rounded-xl` box. The data we already had in the database (bio, timezone, open-to-beginners, notes) was invisible on the board. Upcoming rows showed only time + name — too sparse to decide whether to return.

**Changes:**

| Area | Before | After |
|------|--------|-------|
| **Available Now instruction** | Plain text | Serif italic with smart quotes — *"Who am I?"* |
| **Host timezone** | Hidden | Shown beside name ("London", "New York") |
| **Open-to-beginners** | Hidden | Sage pill badge: `open to beginners` |
| **Host note** | Hidden | Muted text below metadata ("Happy to work with beginners") |
| **Section header** | Static text | Green breathing pulse dot (3s ease-in-out) + count "(3)" |
| **Upcoming rows** | Time + name only | Added instruction text in serif italic + duration |
| **Join button** | "Join" | "Sit together" — domain-specific |
| **Board header** | "onebell" only | Added subline: "Who's sitting?" |
| **Empty state** | "No sits right now." | "The hall is quiet. Open a sit and someone may join you." |

**Query change:** `listOpenSits` expanded to join `users.timezone`, `users.bio`, `users.openToBeginners` alongside the existing `users.displayName`.

**Utility added:** `formatTimezone()` in `lib/time.ts` — converts "Europe/London" to "London".

---

## Level 2 — Visual Presence (`f3a5ca8`)

**Problem:** Level 1 made the cards informationally richer but they were still structurally flat. No visual anchors, no sense of different people, no tactile interaction cues.

**Changes:**

| Area | Before | After |
|------|--------|-------|
| **Host avatar** | None | Warm earth-tone initials circle (deterministic colour per name). 5-colour palette: sandstone, sage, amber, slate-blue, dusty rose. Dark mode variants. `md` (40px) on Available Now, `sm` (32px) on Upcoming. |
| **Instruction text** | Inline italic | Visual blockquote — `border-l-2 border-accent/30` left border, indented. Reads like a note pinned to a wall. |
| **Available Now section** | Same background as page | Warm wash — `bg-surface/50` rounded panel bleeding to edges (`-mx-5`). Subtle distinction from Upcoming. |
| **Card hover** | None | `translateY(-1px)` + soft shadow on hover. Cards feel tactile. |
| **Section divider** | `<hr>` | Three small dots (zendo-style breath between sections) |
| **Upcoming time** | Clock time only ("22:33") | Clock time + relative ("22:33 · in about 1 hour") |
| **Bottom nav** | Text-only labels | Inline SVG icons (grid, figure, person) + `backdrop-blur-sm` on the bar. Taller touch targets (56px). |
| **CTA buttons** | Plain rounded-lg | `rounded-xl` + SVG icons (plus-circle, calendar) + `shadow-sm` → `hover:shadow-md`. More presence. |
| **Join button** | Single variant | Compact variant for Upcoming rows ("Join", smaller) vs full "Sit together" on Available Now cards. |

**New component:** `components/avatar.tsx` — deterministic colour hash from name, `initials()` extraction, warm palette with dark mode.

**New CSS:** `.card-lift` hover animation, `.avatar-warm-{1-5}` palette classes, dark mode variants.

---

## Design Principles Maintained

Both levels preserve the Zendo aesthetic:
- **Warm minimalism** — additions add personality, not noise
- **Information over decoration** — every new element surfaces real data (timezone, bio, relative time) rather than ornament
- **Contemplative tone** — serif italic for instructions, "Sit together" not "Join", breathing pulse not blinking alert
- **The noticeboard metaphor** — blockquote left-border, pinned-note cards, "The hall is quiet" empty state

## Files Changed

**Level 1:** `db/queries.ts`, `actions/list-sits.ts`, `components/sit-card.tsx`, `components/sit-list.tsx`, `components/join-button.tsx`, `app/app/page.tsx`, `app/globals.css`, `lib/time.ts`

**Level 2:** `components/sit-card.tsx`, `components/sit-list.tsx`, `components/join-button.tsx`, `components/app-nav.tsx`, `app/app/page.tsx`, `app/globals.css` + new `components/avatar.tsx`
