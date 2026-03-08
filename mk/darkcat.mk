# ── Darkcat: Adversarial Review ──────────────────────────────
#
# Multi-model adversarial review. Each darkcat is a fresh polecat
# with the adversarial prompt, staining the diff against the
# slopodar taxonomy and watchdog blindspots.
#
# Usage:
#   make darkcat          # DC-1 (primary model — Claude)
#   make darkcat-alt1     # DC-2 (alternative model 1)
#   make darkcat-alt2     # DC-3 (alternative model 2)
#   make darkcat-all      # all models in parallel
#   make darkcat-synth    # convergence synthesis
#   make darkcat-ref REF=<sha>  # review specific commit
#
# Logs go to .logs/dc-<tree>-<model>.log
# Tree hash used as identity (solves SHA paradox for staged changes)

# ── DC-1: Primary Model (Claude) ─────────────────────────────

darkcat:
	@echo "▶ DC-1 — adversarial review (Claude) [tree:$(TREE)]"
	@timeout $(DARKCAT_TIMEOUT) claude -p "$$(cat $(DARKCAT_PROMPT))" \
		--dangerously-skip-permissions \
		2>&1 | tee $(LOGS)/dc-$(TREE)-claude.log
	@echo "✓ DC-1 complete → $(LOGS)/dc-$(TREE)-claude.log"

# ── DC-2: Alternative Model 1 ────────────────────────────────
# Configure with your second model CLI. Example uses codex.

darkcat-alt1:
	@echo "▶ DC-2 — adversarial review (Alt Model 1) [tree:$(TREE)]"
	@echo "CONFIGURE: Replace this with your second model CLI"
	@echo "Example: codex exec 'cat $(DARKCAT_PROMPT) | ...' 2>&1 | tee $(LOGS)/dc-$(TREE)-alt1.log"
	@echo "⚠ DC-2 not configured — skipping"

# ── DC-3: Alternative Model 2 ────────────────────────────────
# Configure with your third model CLI.

darkcat-alt2:
	@echo "▶ DC-3 — adversarial review (Alt Model 2) [tree:$(TREE)]"
	@echo "CONFIGURE: Replace this with your third model CLI"
	@echo "⚠ DC-3 not configured — skipping"

# ── All DCs ───────────────────────────────────────────────────

darkcat-all: darkcat darkcat-alt1 darkcat-alt2

# ── Synthesis ─────────────────────────────────────────────────
# 4th polecat consumes all DC logs and produces convergence report.

darkcat-synth:
	@echo "▶ DC-SYNTH — convergence synthesis [tree:$(TREE)]"
	@timeout $(DARKCAT_TIMEOUT) claude -p "$$(cat $(DARKCAT_SYNTH_PROMPT))" \
		--dangerously-skip-permissions \
		2>&1 | tee $(LOGS)/dc-$(TREE)-synth.log
	@echo "✓ DC-SYNTH complete → $(LOGS)/dc-$(TREE)-synth.log"

# ── Ad-hoc review of specific commit ─────────────────────────

darkcat-ref:
ifndef REF
	$(error REF not set. Usage: make darkcat-ref REF=abc1234)
endif
	@echo "▶ DC-REF — reviewing $(REF)"
	@timeout $(DARKCAT_TIMEOUT) claude -p "$$(cat $(DARKCAT_PROMPT))" \
		--dangerously-skip-permissions \
		2>&1 | tee $(LOGS)/dc-$(REF)-claude.log
	@echo "✓ DC-REF complete → $(LOGS)/dc-$(REF)-claude.log"
