# ADR 002: Capability-Based Model Routing — Skills Declare Needs, Not Models

**Status:** Validated (Phases 1-2 complete, eval-tested)
**Date:** 2026-03-28
**Updated:** 2026-03-29 — capability levels revised based on A/B eval evidence
**Context:** Solomon triage evals fail ~50% on Sonnet due to instruction-adherence requirements; agent-level model selection is too coarse

---

## Decision

Skills declare **capability requirements** (`requires:` block in frontmatter) instead of
hardcoding model names. A routing config maps capability levels to models. When models
change, update one config file — not 55 skill files.

Four capability dimensions, each scored `low | medium | high`:

| Dimension | What it measures |
|-----------|-----------------|
| `adherence` | Following complex formatting/behavioral constraints against model priors |
| `reasoning` | Multi-step reasoning, synthesis, or judgment under ambiguity |
| `precision` | Output must be structurally exact (JSONL, specific templates, arithmetic) |
| `volume` | Amount of output or context window pressure |

Dimensions split into **primary** (`adherence`, `reasoning`) and **secondary**
(`precision`, `volume`). Only primary dimensions drive model tier. Default routing:
primary `high` → opus, `medium` → sonnet, `low` → haiku.

## Context

Model selection is hardcoded at the agent level (`model: sonnet` or `model: opus` in agent
frontmatter). This creates three problems:

1. **Mismatched requirements.** Solomon's triage skill needs Opus-grade instruction-adherence
   but 80% of Solomon's work is mechanical Sonnet-grade template-following. Agent-level
   selection forces all-or-nothing.

2. **Fragile to model changes.** When a new model launches, every agent and eval config needs
   manual updating.

3. **No cost optimization.** Skills with lower requirements could run on cheaper models as they improve.
   Implementation-planning needs high reasoning but has no model specified.

No production framework has shipped capability-based routing (see research doc). Semantic
Kernel's `service_id` + `IAIServiceSelector` is the closest prior art. We are building a
simpler, static version appropriate for our scale.

## Why capabilities, not model names

**Why not just add `model: opus` to skills that need it:**
- Coupling: every skill hardcodes a model identity. N skills × M model changes = O(N×M) edits.
- No user override: a cost-sensitive user can't express "downgrade non-critical to Haiku."
- No cross-provider portability: `opus` is Anthropic-specific.

**Why 4 dimensions, not more:**
- These four capture the real differentiators between model tiers for our skills.
- Rejected dimensions: context window (handled by Claude Code), tool use (not a differentiator),
  creativity (not relevant to our procedural agents), code generation (our agents write prose).

**Why 3 levels (`low | medium | high`), not continuous:**
- Maps cleanly to model tiers (haiku/sonnet/opus).
- Binary is too coarse (many skills need "high but not critical"). Continuous implies false
  precision without calibrated benchmarks.

**Why `speed` and `cost` are not capability dimensions:**
- They're user preferences, not skill requirements. They belong in routing config overrides.

## Implementation

### Phase 1 (this ADR): Schema + declarations, no behavior change
- `requires:` blocks added to all skill file frontmatters
- Routing config at `config/model-routing.yaml`
- Schema reference at `docs/design/capability-schema.md`
- No runtime behavior change — existing `model:` fields on agents remain authoritative

### Phase 2: Eval integration
- `bin/alexandria-route` CLI reads capabilities and returns model ID
- Eval harness uses router instead of hardcoded config.json values

### Phase 3: Runtime integration
- Plugin resolves model from capabilities at skill load time
- User override support via `preferences:` in routing config

### Phase 4: Dynamic routing (speculative, deferred)
- Runtime adaptation to load, cost, model availability

## A/B Eval Evidence (2026-03-29)

All cases run on both sonnet and opus with identical eval harness and structural checks.

| Skill | Sonnet Judge | Opus Judge | Routing Decision |
|-------|-------------|------------|------------------|
| Solomon/raven-handoff | 8/11 | 9/11 | **opus** — protocol adherence |
| Solomon/exec-directive | 5/11 | 8/11 | **opus** — +3 improvement |
| Solomon/meeting-notes | 3/11 | 5/11 | **opus** — +2 improvement |
| Raven/pressure-test | 11/12 | 12/12 | **sonnet** — marginal opus edge |
| Raven/gap-discovery | 10/12 | 12/12 | **sonnet** — passes comfortably |
| Raven/product-conversation | pass | pass | **sonnet** — both pass |
| Raven/pain-point | pass | 8/12 | **sonnet** — both pass |
| Wizard/factory-high-high | 12/12 | 10/12 | **sonnet** — actually better |
| Nit/sweep-3-graph | 5/8 | 5/8 | **sonnet** — tied, save cost |

**Key finding:** Solomon is the only skill where opus provides a meaningful improvement.
The classification discipline protocol (present evidence → defer to human) requires
opus-grade instruction adherence. All other skills perform at or above baseline on sonnet.

## Open Questions

1. **Frontmatter validation.** Claude Code's skill parser may reject unknown fields like
   `requires:`. If so, we'll move declarations to a separate metadata file or use comments.
   Only affects SKILL.md files (4 files); supporting reference files are not parsed by
   Claude Code.

2. **Per-skill model override at runtime.** Claude Code skills support `model:` in
   frontmatter, but it's unclear whether this works for skills loaded inline by plugin
   agents (vs. user-invoked skills). Phase 3 depends on this.

## Consequences

- All skill files gain frontmatter with capability declarations (~55 files)
- Skill authors must assess capability requirements when writing new skills
- A routing config becomes the single source of truth for model selection
- Phase 1 is purely additive — no existing behavior changes, easy to revert
