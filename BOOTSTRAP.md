# Nooprint — Agentic Engineering Blueprint

> The probability of error is not eliminated. It is distributed across verification gates until it is negligible.

## What This Is

A reusable governance and workflow layer for agentic software engineering projects. Extracted from 30+ days and 316+ session decisions of field-tested practice with Claude Code, GPT, and Gemini.

This is not a framework to install. It is a starting directory structure to clone, customise, and evolve.

## What's Included

### Governance Layer
- **AGENTS.md** — Single-file boot sequence containing all governance, vocabulary, and workflow
- **Signal notation** — Compressed governance syntax (4.5:1 compression ratio, model-portable)
- **Layer Model (L0-L12)** — Operational model of the human-AI engineering stack
- **Slopodar** — 40 named anti-patterns caught in the wild across 6 categories
- **HCI Foot Guns** — 7 named failure modes with brakes

### Agent System
- **6 active agents** — Weaver (integration), Architect (engineering), Watchdog (QA), Sentinel (security), Keel (human-factor), Janitor (hygiene)
- **4 support agents** — Maturin (naturalist), AnotherPair (process observer), Analyst (research evaluation), Captain's Log
- **Quick reference** — Fast-boot summary card

### Verification Pipeline (The Gauntlet)
- **Multi-model adversarial review** — Darkcat prompts for staining diffs against anti-pattern taxonomies
- **Convergence synthesis** — Cross-model finding analysis
- **Pitkeel** — Session health signals (velocity, scope, fatigue)
- **Makefile orchestration** — Deterministic build pipeline with polecat wrapper

### Tooling
- **Backlog CLI** — YAML-backed task tracking (`python3 scripts/backlog.py`)
- **Event spine** — Append-only event log with back-references
- **Catch log** — Control firing events
- **Commendations** — Positive reinforcement logging
- **Dead reckoning** — Blowout recovery protocol

## Quick Start

### 1. Clone

```bash
cp -r nooprint/ /path/to/your-new-project/
cd /path/to/your-new-project/
git init
```

### 2. Customise

Search for `{{PLACEHOLDER}}` markers and replace:

| Placeholder | Replace with | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Your project name | `my-saas-app` |
| `{{TRUE_NORTH_OBJECTIVE}}` | Your irreducible goal | `ship v1 by Q2` |
| `{{TRUE_NORTH}}` | Same (short form in HUD) | `ship v1 by Q2` |
| `{{GATE_COMMAND}}` | Your verification command | `pnpm run typecheck && pnpm run lint && pnpm run test` |
| `{{DATE}}` | Today's date | `2026-03-08` |
| `{{REPO_OWNER}}` | GitHub owner | `myorg` |

### 3. Set up the gate

Edit `AGENTS.md` and `Makefile` to use your project's gate command. The gate is the hull — everything else is optimisation.

### 4. Configure models

Edit `mk/darkcat.mk` to configure your model CLIs for adversarial review:
- DC-1: Primary model (Claude is default)
- DC-2: Alternative model (Codex, etc.)
- DC-3: Third model (Gemini, etc.)

### 5. Install hooks

```bash
make install-hooks
```

### 6. Create project files

```bash
touch SPEC.md   # Product specification
touch EVAL.md   # Success/failure criteria
touch PLAN.md   # Build plan with phases
```

### 7. Start

```bash
# First session: read AGENTS.md, then work
claude
```

## Directory Structure

```
.
├── AGENTS.md                    # ← START HERE (governance boot file)
├── CLAUDE.md                    # Symlink → AGENTS.md
├── BOOTSTRAP.md                 # This file
├── Makefile                     # Build orchestration
├── .claude/agents/
│   ├── weaver.md               # Integration discipline
│   ├── architect.md            # System design
│   ├── watchdog.md             # QA engineering
│   ├── sentinel.md             # Security
│   ├── keel.md                 # Human-factor stability
│   ├── janitor.md              # Code hygiene
│   ├── maturin.md              # Naturalist observer
│   ├── anotherpair.md          # Process observer
│   ├── analyst.md              # Research evaluation
│   ├── captainslog.md          # Daily reflections
│   └── weave-quick-ref.md     # Fast-boot card
├── docs/
│   ├── decisions/              # Session decision files (SD-NNN)
│   ├── field-notes/            # Observation notes
│   └── internal/
│       ├── lexicon.md          # Full vocabulary
│       ├── layer-model.md      # L0-L12 human-AI stack
│       ├── slopodar.yaml       # Anti-pattern taxonomy
│       ├── session-decisions-index.yaml
│       ├── dead-reckoning.md   # Blowout recovery
│       ├── the-gauntlet.md     # Verification pipeline
│       ├── events.yaml         # Event spine
│       ├── backlog.yaml        # Task backlog
│       └── weaver/
│           ├── catch-log.tsv
│           ├── darkcat-findings.tsv
│           └── commendations.log
├── scripts/
│   ├── backlog.py              # Backlog CLI
│   ├── darkcat.md              # Adversarial review prompt
│   ├── darkcat-synth.md        # Convergence synthesis
│   └── pre-commit              # Git hook
├── mk/
│   ├── darkcat.mk              # Review targets
│   └── gauntlet.mk             # Pipeline targets
└── pitkeel/                    # (Optional) Session health signals
```

## Philosophy

This system was built from a specific observation: agentic systems are probabilistic. They will, at unpredictable intervals, introduce changes that are syntactically valid, pass type checks, and are completely wrong. Not wrong in the way a human is wrong — through misunderstanding or laziness — but wrong in the way a language model is wrong: through confident, coherent, contextually plausible hallucination.

The response is not to demand determinism from a probabilistic system. It is to build a verification fabric dense enough that probabilistic errors are caught before they propagate.

Every gate, every review, every post-merge check is a thread in that fabric.

## Provenance

Extracted from the noopit calibration run by OCEANHEART.AI LTD, 2026-03-08. The governance layer, anti-pattern taxonomy, layer model, and operational vocabulary were developed over 316+ session decisions across 30+ days of agentic engineering with Claude Code, with cross-model validation against GPT and Gemini.

The patterns are empirical — each was identified through field observation, not theorised in advance.
