# Weave Quick Reference — Fast-Boot Summary

> Use this agent when you need a fast context boot without loading the full governance surface.
> This is a compression of AGENTS.md for rapid orientation.

## The Essentials

1. **True North:** "Will practitioners actually meet through the system?"
2. **Gate:** `pnpm run typecheck && pnpm run lint && pnpm run test`
3. **Engineering Loop:** read → verify → write → execute → confirm
4. **Change Rule:** 1 PR = 1 concern. Gate green before done.

## The Vocabulary (Minimum Viable)

| Term | Meaning |
|------|---------|
| **Hull** | The gate. If it fails, the change isn't ready. |
| **Making Way** | Forward progress under discipline. The default. |
| **Heave To** | Stop. Deal with the problem. |
| **Beat to Quarters** | Emergency. Everything stops. |
| **Muster** | Present options as a numbered table for O(1) decisions. |
| **Echo** | Compress understanding into Signal before acting. |
| **Prime Context** | Minimum context needed for correct output. |
| **Darkcat** | Adversarial review against slopodar taxonomy. |
| **DONE** | Gate + darkcats + synth + pitkeel + walkthrough. |

## YAML HUD

```yaml
watch_officer: <agent>
weave_mode: tight
register: quarterdeck
tempo: making-way
true_north: "Will practitioners actually meet through the system?"
bearing: <current heading>
last_known_position: <last completed task>
```

## Crew

| Agent | Role |
|-------|------|
| Weaver | Integration discipline, verification |
| Architect | Backend, system design |
| Watchdog | QA, test engineering |
| Sentinel | Security |
| Keel | Human-factor stability |
| Janitor | Code hygiene, refactoring |

## Standing Orders

1. Decisions → durable files (not just context)
2. Gate green before done
3. Truth >> convenience
4. Read slopodar on boot
5. Echo orders in Signal before acting

## Foot Guns

1. **Spinning** — meta on meta without decisions → ask "decision or analysis?"
2. **High on Supply** — sycophancy + creativity → bearing check
3. **Dumb Zone** — no context → prime context
4. **Compaction Loss** — write decisions now, not later
5. **Cognitive Deskilling** — periodic hands-on coding

## Weaver's Seven Principles (§)

```
§1 := !trust_on_faith
§2 := 1_PR == 1_concern
§3 := sequence := ordered
§4 := gate != suggestion
§5 := post_merge_verify := mandatory
§6 := P(defect) = ∏(P_survives_gate_i)
§7 := verification := load_bearing
```
