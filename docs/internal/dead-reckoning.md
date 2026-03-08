# Dead Reckoning Protocol

> When the instruments fail, navigate from last known fixed position.

**What this is:** Blowout recovery sequence. If the context window died, the session crashed, or you are a fresh instance with no memory of prior sessions, this document tells you where you are and how to get your bearings.

**When to activate:** If you have no memory of the current project state, you have had a blowout. Defer to your notes.

---

## Step 1: Confirm the blowout

```bash
ls docs/internal/session-decisions-index.yaml 2>/dev/null && echo "NOTES INTACT" || echo "BLOWOUT CONFIRMED"
```

If NOTES INTACT: you have durable state. Proceed to Step 2.
If BLOWOUT CONFIRMED: check git reflog. The chain means everything committed is recoverable.

---

## Step 2: Read the session decisions INDEX (FIRST)

```
docs/internal/session-decisions-index.yaml
```

This is your primary instrument. It contains the last N session decisions + standing orders. **Read the index, not the full log.** Loading the full chain on boot is the single largest token cost in the system.

Do NOT read every file in docs/internal/ — that will consume tokens and increase risk of compaction. **Lazy Loading:** know what exists, read only when needed.

**Search strategy:** BFS by default. Scan depth-1 files first. Go deeper only when investigating a specific question.

---

## Step 3: Read the Lexicon

```
docs/internal/lexicon.md
```

The Lexicon defines all adopted terms, YAML HUD fields, and their meanings. If the Lexicon is not in your context window, you are not on this ship.

---

## Step 4: Verify integration state

```bash
git status
git log --oneline -10
```

---

## Step 5: Know your crew (Lazy Loading — do NOT read until needed)

| Role | File | When to read |
|------|------|-------------|
| Weaver | `.claude/agents/weaver.md` | Integration discipline, verification governance |
| Architect | `.claude/agents/architect.md` | Backend engineering, system design |
| Watchdog | `.claude/agents/watchdog.md` | QA, test engineering |
| Sentinel | `.claude/agents/sentinel.md` | Security engineering |
| Keel | `.claude/agents/keel.md` | Human-factor, operational stability |
| Janitor | `.claude/agents/janitor.md` | Code hygiene, refactoring |

Also on disk: `analyst.md`, `maturin.md`, `anotherpair.md`, `captainslog.md`.

---

## Step 6: Know your durable state (Lazy Loading)

### Depth 1 — Operational (boot surface)

| Document | Path | Purpose |
|----------|------|---------|
| Session decisions index | `docs/internal/session-decisions-index.yaml` | Last N SDs + standing orders |
| Lexicon | `docs/internal/lexicon.md` | Vocabulary |
| Slopodar | `docs/internal/slopodar.yaml` | Anti-pattern taxonomy |
| Layer model | `docs/internal/layer-model.md` | L0-L12 |
| Dead reckoning | `docs/internal/dead-reckoning.md` | This file |

### Depth 2 — Reference

| Directory | Contents | Read when |
|-----------|----------|-----------|
| `docs/decisions/` | Session-scoped SD files | Current session decisions |
| `docs/field-notes/` | Field observations | Pattern taxonomy |

---

## Step 7: Know the standing orders

These are in AGENTS.md (auto-loaded). Critical ones:

1. **All decisions must be recorded** — If it exists only in the context window, it does not exist.
2. **The local gate is the authority** — Run the gate command from AGENTS.md.
3. **Truth first** — Telling the truth takes priority.
4. **Agentic estimation** — All estimates assume agentic execution speed.
5. **Slopodar on boot** — Read the anti-pattern taxonomy on load.

---

## Step 8: Resume operations

You now have bearings. Ask the Captain to confirm priorities if bearing is unclear.

---

*"The probability of error is not eliminated. It is distributed across verification gates until it is negligible."*
