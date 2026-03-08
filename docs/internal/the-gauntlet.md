# The Gauntlet

> Every change runs the gauntlet before it enters the codebase.
> The probability of a defect surviving is the product of the probabilities at each gate.
> Stack enough gates and the product approaches zero.

## Definition of DONE

```signal
DEF DONE := gate.green
           & darkcat{models}.complete
           & darkcat_synth.convergence_report
           & pitkeel.signals_reviewed
           & walkthrough.checked
           & events.marked

RULE := !commit UNTIL DONE
```

---

## The Workflow

```
    ┌─────────────────────────────────────────────────────────────┐
    │                        THE GAUNTLET                         │
    │                                                             │
    │   ┌───────┐                                                 │
    │   │  DEV  │  implement + gate (typecheck + lint + test)     │
    │   └───┬───┘                                                 │
    │       │                                                     │
    │       ▼                                                     │
    │   ┌────────────────────────────────────────────┐            │
    │   │            DARKCAT TRIAD                    │            │
    │   │                                            │            │
    │   │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │            │
    │   │  │ DC-1     │ │ DC-2     │ │ DC-3     │   │            │
    │   │  │ Model A  │ │ Model B  │ │ Model C  │   │            │
    │   │  └────┬─────┘ └────┬─────┘ └────┬─────┘   │            │
    │   │       └────────────┼────────────┘          │            │
    │   │                    ▼                       │            │
    │   │            ┌──────────────┐                │            │
    │   │            │  DC-SYNTH    │                │            │
    │   │            │  convergence │                │            │
    │   │            └──────┬───────┘                │            │
    │   └──────────────────┬─────────────────────────┘            │
    │                      │                                      │
    │           ┌──────────┴──────────┐                           │
    │           │  FINDINGS?          │                           │
    │           └──────────┬──────────┘                           │
    │              ┌───────┴───────┐                              │
    │         YES ─┤          NO ──┤                              │
    │              ▼               ▼                              │
    │         ┌─────────┐  ┌──────────────┐                      │
    │         │ CYCLE   │  │   PITKEEL    │                      │
    │         │ back to │  │   review     │                      │
    │         │  DEV    │  └──────┬───────┘                      │
    │         └─────────┘        │                               │
    │                            ▼                               │
    │                     ┌──────────────┐                       │
    │                     │ WALKTHROUGH  │                       │
    │                     │ human L12    │                       │
    │                     └──────┬───────┘                       │
    │                            ▼                               │
    │                     ┌──────────────┐                       │
    │                     │   COMMIT     │                       │
    │                     └──────────────┘                       │
    └────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1: DEV

**Entry criterion:** Plan file read, task scoped.
**Exit criterion:** Gate exits 0.

### Step 2: DARKCAT TRIAD (parallel)

Three independent model priors, same prompt, same diff.

**Entry criterion:** Gate green from DEV step.
**Exit criterion:** All logs exist and contain structured output.

**Invocation:**
```bash
make darkcat          # Model A (DC-1)
make darkcat-alt1     # Model B (DC-2)
make darkcat-alt2     # Model C (DC-3)
make darkcat-all      # all in parallel
```

### Step 3: DARKCAT SYNTHESIS (4th polecat)

Consumes the DC logs, produces convergence/divergence report.

What the synth polecat does:
1. Reads all DC logs
2. Identifies convergent findings (same defect, different words = high confidence)
3. Identifies divergent findings (one model sees it, others don't = investigate)
4. Identifies unanimous passes (all say clean = high confidence nominal)
5. Produces a single verdict with prioritised finding list

### Step 4: FINDINGS TRIAGE

| Verdict | Action |
|---------|--------|
| FAIL or critical findings | Cycle back to DEV. Fix. Re-run gate. Re-run darkcats. |
| PASS WITH FINDINGS (minor) | Proceed. Log findings. Fix at Captain's discretion. |
| PASS (unanimous nominal) | Proceed directly. |

### Step 5: PITKEEL

Review session signals (velocity, scope, fatigue). If fatigue ≥ moderate or velocity accelerating, human decides whether to continue.

### Step 6: WALKTHROUGH

Human reviews the relevant checklist items for this task.

### Step 7: COMMIT

Gate green + darkcats + synth + pitkeel + walkthrough = DONE. Push.

---

## Invocation

```bash
# Full gauntlet (automated steps)
make gauntlet

# Or step by step
make darkcat          # DC-1
make darkcat-alt1     # DC-2
make darkcat-alt2     # DC-3
make darkcat-synth    # convergence
uv run pitkeel/pitkeel.py  # review signals
```
