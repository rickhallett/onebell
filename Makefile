# ============================================================
# Agentic Engineering — Deterministic Build Orchestration
# ============================================================
#
# Blueprint Makefile. Modular structure:
#   mk/darkcat.mk   — adversarial review (multi-model)
#   mk/gauntlet.mk  — full verification pipeline
#
# Usage:
#   make gate           # run the verification gate
#   make darkcat        # adversarial review (primary model)
#   make darkcat-all    # all model priors
#   make gauntlet       # full verification pipeline
#   make status         # show build status
#   make install-hooks  # install git hooks
#
# ============================================================

SHELL := /bin/bash
.ONESHELL:

# ── Shared Variables ──────────────────────────────────────────

DONE := .done
LOGS := .logs

# IMPORTANT: Replace with your project's gate command
GATE := pnpm run typecheck && pnpm run lint && pnpm run test

DARKCAT_PROMPT := scripts/darkcat.md
DARKCAT_SYNTH_PROMPT := scripts/darkcat-synth.md
DARKCAT_TIMEOUT := 180

# Identity: tree hash of staged content
TREE := $(shell git write-tree 2>/dev/null | cut -c1-8)
SHA := $(shell git rev-parse --short HEAD 2>/dev/null)

# ── Polecat Wrapper ───────────────────────────────────────────
#
# Observable, timeout-guarded, delta-detecting.
define POLECAT
	@TASK=$$(basename $(1) .md); \
	echo "▶ polecat $$TASK — streaming to $(LOGS)/$$TASK.log"; \
	PRE_HEAD=$$(git rev-parse HEAD); \
	PRE_DIFF=$$(git diff --stat); \
	PRE_UNTRACKED=$$(git ls-files --others --exclude-standard | sort); \
	timeout $(POLECAT_TIMEOUT) claude -p "$$(cat $(1))" \
		--dangerously-skip-permissions \
		2>&1 | tee $(LOGS)/$$TASK.log; \
	EXIT_CODE=$$?; \
	if [ $$EXIT_CODE -eq 124 ]; then \
		echo "ERROR: polecat $$TASK timed out after $(POLECAT_TIMEOUT)s"; exit 1; \
	fi; \
	if [ $$EXIT_CODE -ne 0 ]; then \
		echo "ERROR: polecat $$TASK exited with code $$EXIT_CODE"; exit 1; \
	fi; \
	POST_HEAD=$$(git rev-parse HEAD); \
	POST_DIFF=$$(git diff --stat); \
	POST_UNTRACKED=$$(git ls-files --others --exclude-standard | sort); \
	if [ "$$PRE_HEAD" = "$$POST_HEAD" ] \
		&& [ "$$PRE_DIFF" = "$$POST_DIFF" ] \
		&& [ "$$PRE_UNTRACKED" = "$$POST_UNTRACKED" ]; then \
		echo "WARNING: polecat $$TASK produced no delta"; \
	fi
endef

POLECAT_TIMEOUT := 300

# Ensure directories exist
$(shell mkdir -p $(DONE) $(LOGS))

# ── Include Modules ───────────────────────────────────────────

include mk/darkcat.mk
include mk/gauntlet.mk

# ── Core Targets ──────────────────────────────────────────────

gate:
	@echo "Running gate..."
	$(GATE)
	@echo "✓ Gate green"

status:
	@echo "Completed tasks:"
	@ls -1 $(DONE)/ 2>/dev/null | sort || echo "  (none)"

install-hooks:
	@ln -sf ../../scripts/pre-commit .git/hooks/pre-commit
	@echo "✓ Hooks installed: pre-commit"

clean:
	rm -rf $(DONE)
	@echo "All task completion markers cleared."

.PHONY: gate status clean install-hooks
.PHONY: darkcat darkcat-alt1 darkcat-alt2 darkcat-all darkcat-synth darkcat-ref
.PHONY: gauntlet gauntlet-gate gauntlet-pitkeel
