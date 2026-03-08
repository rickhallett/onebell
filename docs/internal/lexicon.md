# The Lexicon — v0.1 (Blueprint)

> A good metaphor constrains the decision space without constraining the solution space.

Status: Template. Customise for your project.
Provenance: Extracted from the noopit calibration run (316+ session decisions, 30+ days of agentic engineering).

---

## YAML Status Header

Every address to the Captain opens with this. Machine-readable. Glanceable.

```yaml
---
watch:
  officer: Weaver               # Who has the watch
  conn: Captain                 # Who holds decision authority
weave: tight                    # loose | tight | extra-tight
register: quarterdeck           # quarterdeck | wardroom | below-decks
tempo: making-way               # full-sail | making-way | tacking | heave-to | beat-to-quarters
true_north: "Will practitioners actually meet through the system?"
bearing: <current heading>      # Relationship to True North
last_known:
  head: <sha>                   # Git HEAD
  gate: green | red             # Last gate result
  tests: <n>                    # Passing tests
  sd: SD-nnn                    # Last session decision
---
```

### Field Notes

- **weave** controls register density. Tight = quarterdeck default. Loose = wardroom. Extra-tight = beat to quarters.
- **register** tracks where on the ship we are. Context shifts are significant.
- **true_north** not `north`. North alone is ambiguous — magnetic north drifts, true north doesn't.
- **tempo** tracks speed and risk. Full sail = fast and exposed. Making way = disciplined forward progress. Tacking = indirect progress against the wind. Heave to = deliberately stopped. Beat to quarters = emergency posture.
- **last_known** is the dead reckoning anchor. If the context window dies, the next session reads this.

---

## Terms — Adopted

### Authority & Handoff

| Term | Definition | Use |
|------|-----------|-----|
| **The Conn** | Decision authority. One holder at a time. Transfer is explicit and logged. | "Captain has the conn." / "Weaver, you have the conn." |
| **Standing Orders (SO)** | Directives that persist across all watches. Obeyed without re-stating. | SD entries marked PERMANENT or Standing order. |
| **The Watch** | Responsibility for monitoring a domain. Implies captain's authority within SOs. | "Analyst, take the watch on citation verification." |
| **Officer of the Watch** | Agent holding the watch with captain's delegated authority. | Weaver during autonomous execution. |

### Navigation & Orientation

| Term | Definition | Use |
|------|-----------|-----|
| **True North** | The objective that doesn't drift. | Constant reference point for all bearing checks. |
| **Bearing** | Direction to target relative to True North. | "Current bearing: pre-launch hardening." |
| **Dead Reckoning** | Navigate from last known position when visibility is lost. | Read `dead-reckoning.md`. |
| **Tacking** | Making progress against the wind by sailing at angles. | "We're tacking, not retreating." |

### Operational Tempo

| Term | Definition | Use |
|------|-----------|-----|
| **Full Sail** | Maximum velocity. High speed, high risk. | "Under full sail — watch the rigging." |
| **Making Way** | Forward progress under discipline. The default state. | What separates this from vibe coding. |
| **Drifting** | Moving without control or bearing. | "No clear bearing — we're drifting." |
| **Heave To** | Deliberately stop. Hold position. | Gate failure, blocking defect. |
| **Beat to Quarters** | Emergency posture. Everything stops. | Credibility threat. Production regression. |
| **Fair-Weather Consensus** | When everyone agrees and no one is checking. | Detection: consecutive agreements without dissent. |

### Integrity & Verification

| Term | Definition | Use |
|------|-----------|-----|
| **The Hull** | The gate, the test suite, the typecheck. Survival, not optimisation. | "Is the hull intact?" = "Does the gate pass?" |
| **On Point** | Convention, convergence, and verification aligning across the stack. | "That was on point." |
| **Staining** | Applying a diagnostic artifact from one context to material from another. | "Have we stained this against the taxonomy?" |
| **Knows the Line** | An agent attuned to this vessel's style and values. | Not general competence — specific attunement. |
| **Model Triangulation** | Cross-model validation. Convergence builds confidence; divergence locates bias. | "Have we triangulated this?" |

### Communication & Record

| Term | Definition | Use |
|------|-----------|-----|
| **Muster** | Present items for O(1) binary decision. Numbered table. | "Muster the options." |
| **Fair Winds** | Closing signal. Conditions are favourable. | "Fair winds, Captain." |
| **Extra Rations** | Captain's commendation. Rare and logged. | "Extra rations for Weaver." |
| **Polecats** | `claude -p` agents in a Makefile pipeline. One-shot, fresh context. | "Dispatch the polecats." |
| **Darkcat** | Adversarial review polecat. Read-only, stains diffs against taxonomies. | "Run the darkcat." |
| **The Gauntlet** | Full verification pipeline. DEV → Darkcats → Synthesis → Pitkeel → Walkthrough. | "Run the gauntlet." |
| **DONE** | Gate green + darkcats + synth + pitkeel + walkthrough. Not "dev finished." | "Is this DONE or dev-complete?" |
| **Prime Context** | Minimum context for an agent to produce correct output. | "The plan file is the polecat's prime context." |
| **Echo / Check Fire** | Compress understanding into Signal before acting. | "Echo that back in Signal." |
| **Learning in the Wild** | Discovery made while doing the work — worth more than the work itself. | "The taxonomy is the catch." |

### Spaces & Registers

| Term | Definition | Use |
|------|-----------|-----|
| **Quarterdeck** | Command register. Formal. Orders given. | Default weave (tight). |
| **Wardroom** | Thinking space. Exploratory, less formal. | "Let's take this to the wardroom." |
| **Below Decks** | Subagent execution. Out of sight. | "Dispatched below decks." |
| **Main Thread** | The command channel. Captain↔Agent direct. | Protected from compaction. |
| **Clear the Decks** | Force compaction. All durable writes confirmed first. | Pre-compaction checklist. |

### Iteration & Tempo

| Term | Definition | Use |
|------|-----------|-----|
| **HOTL** | Human Out The Loop. Machine-speed iteration. Plan → execute → review. | "Go HOTL; the gate is the reviewer." |
| **HODL** | Human grips the wheel. Every step requires human presence. | "HODL until the deploy is confirmed." |
| **Verifiable / Taste-Required** | Can the gate verify it (HOTL), or does it require human judgement (HODL)? | "Is this verifiable or taste-required?" |

### HCI Foot Guns

| Term | Definition | Use |
|------|-----------|-----|
| **Spinning to Infinity** | Recursive self-observation consuming all context without decisions. | "We're spinning — quarterdeck." |
| **High on Own Supply** | Human creativity + sycophantic response = unbounded positive feedback. | "Bearing check — does this serve True North?" |
| **The Dumb Zone** | Operating outside the model's effective context range. | "The polecat has no context — it's in the dumb zone." |
| **Cold Context Pressure** | Too much on-file material narrows the solution space. | "Cold context pressure is high." |
| **Hot Context Pressure** | In-thread accumulation raises compaction risk. | "Hot context pressure — offload to file." |
| **Compaction Loss** | Decisions not written to durable storage are permanently lost. | "Write it now. Compaction loss is permanent." |
| **Cognitive Deskilling** | Progressive atrophy of human verification capacity through delegation. | "Time for hands-on coding." |

### Quality & Process

| Term | Definition | Use |
|------|-----------|-----|
| **Effort Backpressure** | Effort-to-contribute as implicit quality filter. AI eliminates it. | The gate is explicit backpressure. |
| **Interrupt Sovereignty** | Human controls when agent output is reviewed. | "I'll review when I'm ready." |
| **Compound Quality** | Clean code → better context → cleaner code (and inverse). | "Every clean commit helps the next agent run." |
| **Engineering Problem** | Slop in the codebase is an engineering problem, not a model problem. | "Fix the context." |

### Error & Observation

| Term | Definition | Use |
|------|-----------|-----|
| **Oracle Contamination** | Human introduces error that propagates through all verification layers. | "That was an L12 fault." |
| **The Naturalist's Tax** | Discovery overhead from looking closely. | "We're paying the Naturalist's Tax." |

---

## Weave Modes

| Mode | Register | Space | Tempo | When |
|------|----------|-------|-------|------|
| **Tight** | Quarterdeck | Main Thread | Making way | Default. Execution, verification. |
| **Loose** | Wardroom | Main Thread | Making way | By Captain's invitation. Exploratory. |
| **Extra-tight** | Quarterdeck | Main Thread | Beat to quarters | Emergency. Literal execution only. |

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| v0.1 | 2026-03-08 | Blueprint extraction from noopit. Core vocabulary preserved. Project-specific provenance removed. |

---

*The problem of governing semi-autonomous agents under uncertainty, with probabilistic communication, limited bandwidth, and high stakes for unverified action — that problem was solved at sea two hundred years before anyone wrote a line of code.*
