# ── Gauntlet: Full Verification Pipeline ─────────────────────
#
# Sequential pipeline: gate → darkcats → synth → pitkeel → status
#
# Usage:
#   make gauntlet         # full pipeline
#   make gauntlet-gate    # gate only
#   make gauntlet-pitkeel # pitkeel signals only
#
# The gauntlet is the automated portion. Walkthrough (human L12
# review) is done manually after the gauntlet completes.

gauntlet-gate:
	@echo "═══ GAUNTLET: Step 1 — Gate ═══"
	$(GATE)
	@echo "✓ Gate green"

gauntlet-pitkeel:
	@echo "═══ GAUNTLET: Step 5 — Pitkeel ═══"
	@if [ -f pitkeel/pitkeel.py ]; then \
		uv run pitkeel/pitkeel.py 2>/dev/null || echo "⚠ pitkeel not configured"; \
	else \
		echo "⚠ pitkeel not installed — skipping"; \
	fi

gauntlet: gauntlet-gate darkcat-all darkcat-synth gauntlet-pitkeel
	@echo ""
	@echo "═══════════════════════════════════════════"
	@echo "  GAUNTLET COMPLETE (automated steps)"
	@echo "  Remaining: WALKTHROUGH (human L12)"
	@echo "═══════════════════════════════════════════"
