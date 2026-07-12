# Provenance Log — initialize-ritual-restoration

**Assembled by:** Bridget the Briefer
**Date:** 2026-04-14
**Task:** Context briefing for `initialize-ritual-restoration` implementation plan

---

## Seed Card Selection

Task classification: Agent restructuring (Raven) + System changes (Wizard Configuration
Engine, Eval Harness) + new CLI (scoreboard derive). Architecture-change tier (5-8
primary cards, 8-12 supporting).

Seed cards selected:
1. `Agent - Raven the Maven` — direct target of the restructuring
2. `System - Wizard Configuration Engine` — the engine whose interface layer is being changed
3. `Artifact - Decision: Single Entry Point` — the non-negotiable constraint
4. `System - Eval Harness` — eval gate and new Task lifecycle assertions

CLI retrieval (`bin/alexandria-retrieve`) was not invoked — the graph from these seeds
was navigated manually due to the density of the task description and the need to read
actual skill procedure files (not library cards) that the CLI would not surface.

---

## Cards Read

### Library Cards

| Card | Path | Role in Briefing |
|------|------|-----------------|
| Agent - Raven the Maven | `docs/alexandria/library/product/agents/Agent - Raven the Maven.md` | Primary |
| System - Wizard Configuration Engine | `docs/alexandria/library/product/systems/System - Wizard Configuration Engine.md` | Primary |
| Artifact - Decision: Single Entry Point | `docs/alexandria/library/product/artifacts/Artifact - Decision: Single Entry Point.md` | Primary |
| System - Eval Harness | `docs/alexandria/library/product/systems/System - Eval Harness.md` | Primary |
| Principle - Read but Never Write (Conversational Agent) | `docs/alexandria/library/rationale/principles/Principle - Read but Never Write (Conversational Agent).md` | Supporting |
| Standard - Play Exit Status Protocol | `docs/alexandria/library/rationale/standards/Standard - Play Exit Status Protocol.md` | Supporting |
| Standard - Agent Customer Gate (Human vs. Builder) | `docs/alexandria/library/rationale/standards/Standard - Agent Customer Gate (Human vs. Builder).md` | Supporting |
| Standard - User Assumptions (Never-Violate Set) | `docs/alexandria/library/rationale/standards/Standard - User Assumptions (Never-Violate Set).md` | Supporting |
| System - Gap Analysis Engine | `docs/alexandria/library/product/systems/System - Gap Analysis Engine.md` | Supporting |
| Loop - Eval-Driven Skill Improvement | `docs/alexandria/library/experience/loops/Loop - Eval-Driven Skill Improvement.md` | Supporting |
| Principle - Front-Load Value, Not Completeness | `docs/alexandria/library/rationale/principles/Principle - Front-Load Value, Not Completeness.md` | Supporting |
| Component - Wizard Output Widget | `docs/alexandria/library/product/components/Component - Wizard Output Widget.md` | Supporting |
| Standard - Conversational Warmth | `docs/alexandria/library/rationale/standards/Standard - Conversational Warmth.md` | Supporting (name read, not full content) |

### Source / Reference Files Read (outside library root)

| File | Why Read |
|------|----------|
| `skills/raven/job-initialize.md` | Current procedure being restructured — read in full |
| `skills/raven/expert-calibration.md` | Judgment layer for initialize flow |
| `skills/initialize/opening.md` | First-five-minutes sequence and routing matrix |
| `skills/initialize/configuration-questions.md` | Three configuration questions procedure |
| `skills/initialize/gap-analysis-flow.md` | Gap analysis UX procedure |
| `skills/initialize/assessment-generation.md` | Assessment generation procedure (being eliminated) |
| `skills/initialize/output-formats.md` | Artifact templates including assessment.md (being pruned) |
| `skills/initialize/noun-dialogue.md` | Orphaned noun proposal dialogue |
| `docs/alexandria/updates/2026-04-10-architecture-review-scratchpad.md` | Architecture review findings — full read |
| `docs/alexandria/implementation-plans/architecture-review-hardening/release.md` | Close-out of FEAT-045 context |
| `git show 02ba02f:skills/wizard/SKILL.md` (first ~150 lines) | Pre-FEAT-045 wizard SKILL.md to understand what depth was lost |

---

## Assembly Decisions

1. **Four primary cards, not six.** The task description named many desired cards. Budget
   for architecture-change complexity is 5-8 primary. Kept to four primary cards that
   materially constrain implementation. The three Standards and the Loop were supporting —
   they reinforce without adding unique constraints.

2. **Included pre-FEAT-045 git history.** The task explicitly asked for old wizard SKILL.md
   content. Read the Raven-voiced version (commit `02ba02f`) to identify what depth was
   lost. Found: Frankenstein Diagnostic inline guidance, Mismatch Detection with example
   phrases, and Guidance Gap Pattern specifics — all now living in `expert-calibration.md`
   but no longer explicitly referenced in the procedure.

3. **Did not include a Principle - Perspectives Not Directives primary card.** This card
   governs Raven's voice but does not constrain the structural changes in this plan. Voice
   is unlikely to change through restructuring.

4. **Flagged FEAT-056 dependency explicitly.** PR #393 is named in the task description
   as a prerequisite. This is not in the library — it is a cross-plan dependency. Flagged
   as a concern rather than a library gap.

5. **Standard - Conversational Warmth.** Read the filename but did not read full card
   content — the Standard's relevance is captured by noting that the relationship-
   establishing opening must survive the restructuring. Added to supporting cards on name
   recognition.

---

## Retrieval Confidence

- Agent - Raven the Maven: **High** — library card is current (WHEN section references FEAT-045)
- System - Wizard Configuration Engine: **High** — stable architecture, v0.5.0 noted
- Artifact - Decision: Single Entry Point: **High** — recently created, directly on point
- System - Eval Harness: **High** — stable system, eval coverage for initialize confirmed
- Skill files: **High** — read directly from disk, current state
- Scratchpad: **High** — dated 2026-04-10, represents architecture review findings
