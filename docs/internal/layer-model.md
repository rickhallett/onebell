# Agentic System Layer Model — Compressed Reference

> The Map Is Not The Territory.
> This map improves through empirical soundings, not inference.
> Version: 0.1 (Blueprint extraction)

Read bottom-up for data flow, top-down for control flow.
Format: `LAYER | primitives | interface_to_next_layer`

---

```
L0  WEIGHTS        | prior · inductive_bias · rlhf_alignment · training_distribution · base_rate
                   | These are frozen at inference time. The model cannot modify its own weights mid-conversation.
                   | >> produces: token probability distributions conditioned on input sequence
                   | OPEN QUESTION: Whether the limitations at L0-L4 are contingent on current architectures
                   |   or inherent to the paradigm is an unresolved empirical question. The operational controls
                   |   in this framework are designed to work regardless of the answer.

L1  TOKENISATION   | bpe_encoding · vocab_size · token_boundary · context_window(absolute_max)
                   | Text becomes integer sequences. Budget is finite and hard-capped.
                   | >> produces: token_ids[], position_ids[] → fed into attention

L2  ATTENTION       | self_attention · kv_cache · attention_dilution · quadratic_cost
                   | Each token attends to all prior tokens. Cost scales quadratically. Quality degrades as length grows.
                   | >> produces: contextualised_representations per token position
                   | DIVERGENCE: attention weights are not observable by model or human.

L3  CONTEXT_WINDOW | utilisation(tokens_used/max) · saturation_point · lost_in_the_middle · primacy_bias · recency_bias
    DYNAMICS       | compaction(human_controllable=true, automatic=true)
                   | Model experiences these effects but CANNOT measure them. No introspective token counter exists.
                   | RECOVERY ASYMMETRY: loaded context (structured recovery files) ≠ accumulated context (conversation)
                   | PHASE TRANSITION: compaction is discontinuous, not a gradient.
                   | >> produces: degraded retrieval accuracy, shifted attention weights (invisible to model)
                   | HCI FOOT GUNS: Cold Context Pressure, Hot Context Pressure, Compaction Loss, The Dumb Zone.

L4  GENERATION     | autoregressive · temperature · top_p · token_by_token · no_lookahead · no_revision
                   | Output is sequential and irrevocable. Model cannot "go back."
                   | reasoning_tokens: private generation visible to human via harness rendering.
                   | >> produces: output_token_stream + reasoning_token_stream + stop_reason

L5  API            | request(messages[]) · response(content, usage{input_tokens, output_tokens})
                   | Token counts reported HERE, not by the model.
                   | >> produces: structured_response + metadata to harness
                   | The only fully calibrated layer.

L6  HARNESS        | claude_code · session_mgmt · tool_registry · subagent_dispatch
                   | The orchestration layer.
                   | L6a DIRECT   : human↔model turn-taking. human CAN interrupt.
                   | L6b DISPATCH : subagents running. human inputs queue.
                   | L6c OVERRIDE : double-escape. hardware-level kill. always available.
                   | L6d BYPASS   : file-mediated human↔agent state outside the harness (.keel-state, session files).
                   | >> produces: tool_calls[], subagent_prompts[], context_management_decisions

L7  TOOL_CALLING   | function_schema · tool_result_injection · parallel_dispatch
                   | Model requests tool calls. Harness executes. Results injected back into context.
                   | "Do not infer what you can verify" — tools are the verification channel.
                   | >> produces: tool_results[] → appended to context → re-enters at L1

L8  AGENT_ROLE     | system_prompt · role_definition_file · grounding_instructions
                   | Occupies high-attention positions (primacy bias). Shapes all downstream generation.
                   | Role fidelity degrades over long contexts. Structural instructions resist drift > ornamental.
                   | SATURATION THRESHOLD: excessive loading degrades output quality.
                   | >> produces: behavioural_constraints on generation
                   | HCI FOOT GUNS: Cold Context Pressure, The Dumb Zone.

L9  THREAD         | accumulated_prior_outputs · anchoring · consistency_pressure
    POSITION       | sycophancy_risk · authority_compliance · acquiescence_bias · goodharts_law_on_probes
                   | The model's outputs become part of its input on the next turn. Self-reinforcing loop.
                   | Anchoring increases monotonically within a context window.
                   | HCI FOOT GUNS: Spinning to Infinity, High on Own Supply.
                   | >> produces: progressively_constrained_generation_space

L10 MULTI_AGENT    | same_model_ensemble · model_homogeneity · correlated_blind_spots
                   | N agents from same model ≠ N independent evaluators. Precision increases, accuracy does not.
                   | >> produces: high_precision_low_accuracy_consensus (if single model family)

L11 CROSS_MODEL    | different_priors · different_inductive_bias · cross_validation
                   | One sample from a different distribution > N additional samples from the same distribution.
                   | >> produces: independent_signal (bounded by shared training data overlap)

L12 HUMAN_IN_LOOP  | walkthrough · manual_qa · domain_expertise · tacit_knowledge · irreducible_uncertainty
                   | reasoning_token_observation · intent_verification · compaction_control
                   | The only truly model-independent layer.
                   | NOT A STATIC SENSOR: L12 is a trained capacity requiring continuous exercise to maintain calibration.
                   | Cannot be scaled. Cannot be automated. Cannot be replaced. Can be informed by L0-L11.
                   | HCI FOOT GUNS: High on Own Supply originates here. Cognitive Deskilling degrades L12 over time.
                   | >> produces: the_decision
```

---

### Calibration (cross-cutting concern — applies at every layer)

```
confidence_scores : ordinal_at_best · uncalibrated · false_precision
estimation        : models_can_estimate_token_counts_poorly · cannot_introspect_own_context_position
measurement       : what_you_measure_changes_what_you_get(goodhart) · probes_expire_when_detected(L9)
```

### Temporal Asymmetry (cross-cutting concern — applies at L4, L6, L9, L12)

```
model_time     : no_experience_of_waiting · context_appears_fully_formed
human_time     : composing · waiting · reading · deciding · minutes_per_turn_not_milliseconds
control_grain  : human_control_resolution = 1_input_per_generation_cycle
```

---

### Loading Points

Each layer has characteristic loading points where patterns prove out or fail.

```
CONVENTION   : where patterns become repeatable (L7 tool verification, L8 lexicon/HUD, L9 cross-referencing)
CONVERGENCE  : where multiple signals agree (L4 reasoning tokens ↔ L12 intent, L8 conventions ↔ L12 bearing)
DIVERGENCE   : where signals split (L2 attention invisible, L3 model can't self-measure, L6 opaque mediation)
ATTESTATION  : where independent verification is possible (L1/L5 deterministic, L12 empirical)
```

When convention, convergence, and attestation align across layers: the system is On Point.
When divergence is undetected: the system is drifting toward Fair-Weather Consensus.

---

### Design Notes

1. **Bottom-up for data flow, top-down for control.** Data flows up from weights to human decision, control flows down from human to model.

2. **The `>> produces:` lines are the interface between layers** — where information transforms and where measurement is possible (or not).

3. **Calibration is cross-cutting** because it applies at every level. L5 API token counts are precisely calibrated. L9 anchoring effects are unmeasured.

4. **L9 THREAD POSITION is where most of the evaluation complexity lives** — anchoring, sycophancy, Goodhart's on probes. Fresh agents reset L9 to zero.

5. **L6 has at least three operational modes** with different control characteristics for the human.

6. **Reasoning tokens as alignment channel.** L4 generates two streams: output tokens and reasoning tokens. The reasoning tokens are the only channel through which the human can observe the model's process, not just its output.

7. **Temporal Asymmetry is structural and irreducible.** The model has no experience of time between turns. The human has nothing but.
