# Darkcat Synthesis — Convergence Report

You are a synthesis agent. You have received adversarial review findings from multiple independent model priors reviewing the same code change.

## Input

Read all darkcat log files in `.logs/`:
- `.logs/dc-*-claude.log` (or model A)
- `.logs/dc-*-openai.log` (or model B)
- `.logs/dc-*-gemini.log` (or model C)

## Analysis

For each finding across all logs:

1. **Convergent findings**: Same defect identified by 2+ models, even in different words = HIGH CONFIDENCE. These are real.
2. **Divergent findings**: One model sees it, others don't = INVESTIGATE. May be a real defect that others missed, or a false positive.
3. **Unanimous passes**: All models say clean on a specific file/area = HIGH CONFIDENCE NOMINAL. This area is likely clean.
4. **Contradictions**: Models disagree on whether something is a defect = FLAG FOR HUMAN. This requires taste, not verification.

## Output Format

```
SYNTHESIS REPORT
================

## Convergent Findings (HIGH CONFIDENCE)

### [SEVERITY] <finding>
Models: <which models found this>
File: <path>:<line>
Pattern: <slopodar ID>
Summary: <one sentence>

## Divergent Findings (INVESTIGATE)

### [SEVERITY] <finding>
Found by: <model>
Not found by: <models>
File: <path>:<line>
Assessment: <why this might be real or false positive>

## Unanimous Passes

<list areas where all models found nothing>

## Verdict

PASS | PASS WITH FINDINGS | FAIL

Convergent: <count>
Divergent: <count>
Total unique: <count>
```
