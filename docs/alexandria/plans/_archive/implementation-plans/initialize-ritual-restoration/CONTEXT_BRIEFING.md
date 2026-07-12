# Context Briefing

## Task Frame

**Task:** Restore the power and depth of the original /wizard first-session experience
while keeping /library as the sole user entry point. Three structural moves: (1) split
`job-initialize.md` into a thin router, a dedicated first-session job with linear
wizard-like discipline, and a returning-session job; (2) use Claude Code Task primitives
(TaskCreate/TaskList/TaskUpdate) to orchestrate the first-session Initialize job; (3)
restore solicitation prompt depth that was thinned during FEAT-045. Additional in-scope
moves: build `alxndr scoreboard derive` CLI, kill `assessment.md` as a persisted artifact,
strike `session_notes` entirely, generalize greenfield-to-brownfield detection via git-log
drift, fix orphaned noun-proposal-dialogue, restore gap-analysis as an explicit procedural
beat, and add eval harness updates to assert Task lifecycle. Builds on top of PR #393
(FEAT-056, Raven writes config artifacts directly).

**Target type:** Agent (Raven the Maven — skill restructuring) + System (Wizard
Configuration Engine + Eval Harness) + Capability (new CLI: `alxndr scoreboard derive`)

**Task type:** architecture (multi-file restructuring + new CLI + procedure shape changes)

**Constraints:**
- `/library` remains the sole user entry point — [[Artifact - Decision: Single Entry Point]]
  is a hard constraint; no new slash commands, no `/wizard` resurrection
- Raven reads library, writes boundary outputs (config artifacts per FEAT-056 are
  in-scope writes for initialize) — but NEVER writes library cards;
  [[Principle - Read but Never Write (Conversational Agent)]] governs the boundary
- `assessment.md` is being killed as a persisted artifact — all three callers
  (`job-initialize.md`, `assessment-generation.md`, `output-formats.md`) must be
  updated in the same slice
- `session_notes` is a never-implemented schema field — strike from all references
  without creating a replacement artifact
- Task primitives are execution aids with graceful degradation — the prose procedure
  file remains canonical spec; Tasks are not required to run
- FEAT-056 lands separately — this plan builds on top; do not duplicate config-write
  logic

**Acceptance criteria:**
- `skills/raven/job-initialize.md` is split into three jobs: router, first-session,
  returning-session; the router dispatches based on `alexandria-config.json` presence
  and session state
- First-session job uses TaskCreate/TaskList/TaskUpdate per beat; graceful degradation
  when Task primitives unavailable
- Solicitation prompt depth is restored — configuration questions and gap analysis
  solicitation prompts are as rich as the pre-FEAT-045 wizard
- `alxndr scoreboard derive` CLI exists and is called from session-start
- `assessment.md` is not written; `assessment-generation.md` is pruned or deleted;
  `output-formats.md` has assessment template removed
- `session_notes` stripped from all references
- Greenfield-to-brownfield detection replaced with git-log drift query (8-step
  heuristic gone)
- `noun-dialogue.md` is loaded by the correct job step (not orphaned)
- Gap-analysis appears as an explicit procedural beat in the first-session job
- Eval cases updated to assert Task lifecycle; all eval suites pass against new baseline

---

## Primary Cards (full content)

### Agent - Raven the Maven

**Type:** Agent
**Relevance:** Raven is the direct target of this restructuring. Her `job-initialize.md`
is the procedure being split. Her customer contract, boundary rules, and coordination
patterns all constrain the shape of the new jobs. The anti-examples section names the
exact failure modes to guard against during implementation.

[Full content as read from library — key dimensions for this task:]

**WHAT:** Raven is the outward-facing library role — human-facing product thinking
partner. Customer is the product owner and team members, never builder agents. She reads
the knowledge graph, signal queue, feedback queue, provenance log, and health reports
to engage humans in product brainstorming. She does not write cards, grade, lint, triage
signal, or produce structured briefings.

**WHERE:**
- Home: [[Domain - Library Boundary]]
- Conforms to: [[Standard - Agent Customer Gate (Human vs. Builder)]], [[Standard - Play Exit Status Protocol]], [[Standard - User Assumptions (Never-Violate Set)]]
- Coordinates with: [[Agent - Sam the Scribe]], [[Agent - Solomon the Sorter]], [[Agent - Conan the Librarian]]
- Related: [[Principle - Read but Never Write (Conversational Agent)]], [[Artifact - Decision: Single Entry Point]]

**WHY:**
- [[Product Thesis - Better Context Produces Better Agent Output]] — Raven delivers library context to the humans who make product decisions
- [[Product Thesis - Context Libraries Also Align Human Teams]] — conversational access to the knowledge graph means humans internalize product context through dialogue, not document review
- [[Principle - Perspectives Not Directives]] — opinions grounded in the library presented as perspectives, not instructions

**WHEN:** FEAT-045 renamed /wizard to /library, making /library Raven's sole invocation
surface. The rolling handoff block (eval-hardened 2026-03) and evidence tier signaling
are real and consistently produced. Config-artifact write boundary being changed by
FEAT-056 (Raven writes config artifacts directly, Sam only for library cards).

**HOW — Job surface:** Two jobs currently: `job-product-conversation.md` and
`job-initialize.md`. This plan restructures job-initialize into three jobs: router,
first-session, returning-session.

**HOW — Boundary outputs Raven writes:**
- Handoff notes to `sources/incoming/` for Solomon
- Feedback queue entries
- Flag notes for Conan
- Config artifacts (post FEAT-056): `alexandria-config.json`, `initialize-output.md`

**HOW — Anti-examples (guard against):**
- Wrong: Raven writes a library card during a conversation. Card writing is Sam's exclusive capability.
- Wrong: Raven produces a CONTEXT_BRIEFING.md for a builder agent. Structured briefings are Bridget's job.
- Wrong: Raven says "You should do X" without presenting library evidence. Violates Perspectives Not Directives.

---

### System - Wizard Configuration Engine

**Type:** System
**Relevance:** This system is the invisible scoring machinery behind the initialize flow.
The three structural moves all operate on how the session delivers the engine's output to
the user. The pipeline it defines (input routing → pool membership → sensitivity profiles
→ combination → anomaly overrides → output) must remain intact while the UX shape
changes. The v0.4.1 interface layer changes and v0.5.0 scanner integration are the state
of the art being preserved and extended.

**WHAT:** Accepts AI Mode, Domain Novelty, and Product Complexity inputs; produces tiered
knowledge area assignments across 22 areas via: non-compensatory gate (Decision 16),
sensitivity profiles (Decision 19), max() combination rule (Decision 17), and three anomaly
overrides (Decision 18). 36 distinct configurations (4 modes x 3 novelty x 3 complexity).

**WHERE:**
- Conforms to: [[Standard - Wizard Non-Compensatory Gate]], [[Standard - Wizard max() Combination Rule]]
- Downstream of: [[System - Codebase Scanner]]
- Upstream of: [[System - Gap Analysis Engine]]
- Related: [[Principle - Front-Load Value, Not Completeness]], [[Principle - Build Upstream Before Downstream]]

**WHY:**
- [[Product Thesis - Better Context Produces Better Agent Output]] — the engine determines which context areas will produce the greatest improvement in agent output for a specific product

**WHEN (critical for this plan):** Engine algorithm is **stable and unchanged by this
plan**. The interface layer (how inputs are collected, how results are presented) is
what this plan restructures. The v0.4.1 interface improvements (complexity checklist,
novelty bumps, risk narrative timing, confirmation check) must survive the restructuring.
The v0.5.0 scanner integration (noun proposal dialogue, entity pre-loading) must survive
and the noun-dialogue orphan must be fixed.

**HOW — Pipeline:**
- Step 0: Input routing (docs? code?) → scanner path or docs path
- Step 1: Pool membership (AI Mode ceiling)
- Steps 2-4: Scoring (sensitivity, combination, anomaly overrides)
- Step 5: Output (tier per area)

**HOW — Anti-examples:**
- Wrong: Compensatory model (novelty promotes areas past AI Mode ceiling)
- Wrong: Continuous scoring (1-100) instead of discrete tiers
- Wrong: Benchmarking to AI capability instead of product attributes

---

### Artifact - Decision: Single Entry Point

**Type:** Artifact (Decision)
**Relevance:** This is the non-negotiable constraint for the entire plan. Any restructuring
of `job-initialize.md` must preserve `/library` as the sole user-facing entry point. The
decision records why `/wizard` was retired and what would be required to change it —
essentially ruling out any approach that would re-introduce a separate slash command for
first-time sessions.

**WHAT:** Collapsed `/wizard` into `/library` so `/library` is the sole user-facing entry
point. What was `/wizard` became `initialize` — an internal sub-procedure that fires
automatically when `alexandria-config.json` is absent. Users invoke one command; the system
detects whether setup is needed.

**WHERE:**
- Governs: [[Agent - Raven the Maven]] (sole invocation surface)
- Enabled by: [[Artifact - Decision: alxndr Unified CLI]] (one door principle)
- Related: [[Artifact - Decision 5: Four Agents, Not One]]

**WHY:** Two doors create two knowledge surfaces. Users must remember which command
starts what. Documentation must explain both. A shim adds maintenance overhead and
leaves the old name in user mental models.

**HOW — Entry point map:**

| Former command | Current state |
|----------------|---------------|
| `/library`     | Active sole entry point — human users |
| `/wizard`      | Retired — does not exist |
| `initialize`   | Internal sub-procedure inside `/library` |

**HOW — Automatic setup detection:**
1. Raven checks for `alexandria-config.json`
2. If absent: `initialize` fires automatically
3. If present: library room opens directly

**HOW — Anti-examples:**
- Wrong: Invoking `/wizard` after FEAT-045
- Wrong: Documenting `/wizard` and `/library` as two separate flows
- Wrong: Treating `initialize` as a user-invocable command

---

### System - Eval Harness

**Type:** System
**Relevance:** The plan explicitly includes eval harness updates to assert Task lifecycle.
The Eval-Driven Skill Improvement loop governs the gate: any change to `skills/initialize/`
must run evals before merge, and the baseline must be updated if scores improve. The plan
adds new structural checks to the harness for Task lifecycle verification.

**WHAT:** Reusable framework for testing conversational skills end-to-end. Runs scripted or
adaptive inputs through a skill, records full transcripts, evaluates with deterministic
structural checks AND LLM-as-Judge quality criteria, and compares against checked-in
baselines.

**WHERE:**
- Implements: [[Principle - Measure Before Promoting]]
- Related: [[Capability - Implementation Planning]], [[Artifact - Lesson: Multi-Turn Eval Dramatically Improves Quality]]
- Current eval coverage: `skills/initialize/` (3 cases, formerly `skills/wizard/`)
- Runner: `src/tools/eval-harness.ts`, invoked via `bin/alexandria-eval`

**WHY:**
- [[Principle - Measure Before Promoting]] — skills are conversational and non-deterministic; "it seemed to work" is not evidence of quality

**WHEN:** The initialize skill has 3 eval cases (renamed from wizard in FEAT-045). This
plan adds structural checks for Task lifecycle. Any change to `skills/initialize/` files
(opening.md, configuration-questions.md, gap-analysis-flow.md, assessment-generation.md,
output-formats.md, noun-dialogue.md) triggers the eval gate.

**HOW — Dual evaluation:**
- Structural checks: deterministic, exhaustive (file presence, JSON schema, link integrity)
- LLM-as-Judge: quality-focused, sampled (conversational quality, completeness, accuracy)
- Categorical scoring: excellent/good/adequate/weak/poor (not numeric)

**HOW — Anti-examples:**
- Wrong: Manual testing only ("it worked when I tried it")
- Wrong: Skipping eval run for a "small" prompt change — every change to eval-covered skills requires a run
- Wrong: Single-prompt eval for conversational skills

---

## Supporting Cards (summaries)

| Card | Type | Key Insight |
| --- | --- | --- |
| [[Principle - Read but Never Write (Conversational Agent)]] | Principle | Raven reads library + writes boundary outputs (config artifacts after FEAT-056); never writes library cards. The boundary is clear: handoff notes, feedback queue entries, flag notes, and config artifacts are pipeline inputs. Cards are not. |
| [[Standard - Play Exit Status Protocol]] | Standard | All Raven job exits must emit exactly one of four statuses: DONE, DONE_WITH_CONCERNS, BLOCKED, NEEDS_CONTEXT. DONE_WITH_CONCERNS must enumerate concerns; BLOCKED must name the blocker; NEEDS_CONTEXT must include the specific question. New router job and both sub-jobs must each have explicit exit status mappings. |
| [[Standard - Agent Customer Gate (Human vs. Builder)]] | Standard | Raven serves human customers only. This constrains the job surface: even if Task primitives look like a builder pattern, the human remains the customer throughout the initialize flow. No factory briefings from Raven. |
| [[Standard - User Assumptions (Never-Violate Set)]] | Standard | Seven inviolable constraints on all agent output: non-technical users, time-scarce, product expert (not system expert), invisible mechanics, complete at every level, opt-in depth, no surprise delegation. The Task orchestration approach must keep mechanics invisible — users should experience progress, not see TaskCreate/TaskList calls. |
| [[System - Gap Analysis Engine]] | System | Gap analysis is a scored, phased output of the Wizard Configuration Engine — Foundation gaps first, then Core, then Amplifier. The engine uses `priority_score = tier_weight x gap_severity x freshness_penalty`. This plan restores gap-analysis as an explicit procedural beat in the first-session job (it was collapsed into reference material in FEAT-045). |
| [[Loop - Eval-Driven Skill Improvement]] | Loop | The loop that governs this plan's quality gate: modify skill → run eval → review scores → diagnose → fix → re-baseline. Skills with eval coverage (including `skills/initialize/`) cannot be changed without running evals. Baseline must be updated when scores improve. The loop is currently manual; the user triggers runs. |
| [[Principle - Front-Load Value, Not Completeness]] | Principle | The initialize flow's sequencing principle: Foundation gaps first, partial progress is real progress, never let the user feel "30% done." The first-session job must preserve this sequencing in the way beats are ordered and Task progress is presented. |
| [[Component - Wizard Output Widget]] | Component | The rendered markdown format (`initialize-output.md`) presenting configuration summary, risk narrative, phased seeding sequence, and solicitation prompts. This component is the primary touchpoint — its four-part progressive disclosure structure (header → risk → seeding → solicitation) must survive the restructuring. |
| [[Standard - Conversational Warmth]] | Standard | Governs Raven interactions — warmth standard. The relationship-establishing opening (first-five-minutes sequence) must not be collapsed into a form or checklist, especially in the first-session job. This is the quality that FEAT-045 thinned. |

---

## Relationship Map

- `job-initialize.md` (current) depends-on `skills/initialize/opening.md` — first-five-minutes loaded on demand for first-time sessions
- `job-initialize.md` depends-on `skills/initialize/configuration-questions.md` — inference-before-asking posture and three questions
- `job-initialize.md` depends-on `skills/initialize/gap-analysis-flow.md` — gap analysis UX; currently underused (reference material, not explicit beat)
- `job-initialize.md` depends-on `skills/initialize/assessment-generation.md` — **being eliminated** with assessment.md as persisted artifact
- `job-initialize.md` depends-on `skills/initialize/noun-dialogue.md` — **orphaned**, never loaded in current procedure; this plan fixes the orphan
- `job-initialize.md` depends-on `skills/initialize/output-formats.md` — artifact templates; assessment template being removed
- `skills/raven/expert-calibration.md` operates-on all initialize jobs — judgment layer loaded at entry; must load in new first-session job
- `System - Wizard Configuration Engine` constrained-by `Standard - Wizard Non-Compensatory Gate` — AI Mode ceiling is a hard constraint on pool membership; unchanged by this plan
- `System - Wizard Configuration Engine` constrained-by `Standard - Wizard max() Combination Rule` — combination formula unchanged
- `System - Gap Analysis Engine` depends-on `System - Wizard Configuration Engine` — consumes tier assignments; gap analysis beat in first-session job depends on engine completing first
- `System - Eval Harness` validates `skills/initialize/` — every change to initialize skill files triggers eval gate
- `Loop - Eval-Driven Skill Improvement` constrains all changes to `skills/initialize/` — baselines must be updated
- `Artifact - Decision: Single Entry Point` constrains `Agent - Raven the Maven` — router must dispatch internally, never expose a separate user command
- `Principle - Read but Never Write (Conversational Agent)` governs `Agent - Raven the Maven` — Task primitives are execution aids; they do not change which artifacts Raven writes
- `Standard - User Assumptions (Never-Violate Set)` constrains all initialize job output — invisible mechanics, no surprise delegation, complete at every level
- `alxndr scoreboard derive` (new CLI) coordinates-with session-start — router and returning-session job depend on it; first-session job may use it after configuration round completes
- `Standard - Play Exit Status Protocol` constrains all three new jobs — router, first-session, returning-session each need exit status mappings

---

## Gap Manifest

| Dimension | Topic | Searched | Found | Recommendation |
| --- | --- | --- | --- | --- |
| WHAT | System card for `alxndr scoreboard derive` CLI | yes | no | This is a new CLI being built by this plan. No library card exists yet. Sam should create a Capability card for `alxndr scoreboard derive` (or update the Scoreboard Renderer system card if one exists) after the CLI is built. |
| WHAT | Library card for the three-tier job structure (router + first-session + returning-session) | yes | no | No card describes the job architecture being created. After the plan ships, Sam should update `Agent - Raven the Maven` to reflect the new three-job structure under HOW. |
| WHAT | Library card for Claude Code Task primitive integration pattern | yes | no | No card describes when/how to use TaskCreate/TaskList/TaskUpdate as an execution aid with graceful degradation. This is a new architectural pattern in Alexandria. Consider a Standard or Decision card after the pattern is validated. |
| WHY | Governing rationale for killing `assessment.md` as persisted artifact | yes | partial | The scratchpad (2026-04-10) has the reasoning inline: "It's Raven saying 'here's where we stand.' That's a conversational turn, not an artifact." No library card captures this as a decision. Sam should create `Artifact - Decision: Assessment as Conversational Turn` after the plan ships. |
| WHY | Governing rationale for git-log drift detection over directory heuristics | yes | partial | Scratchpad has reasoning inline but no Decision card exists. After the plan ships, Sam should create `Artifact - Decision: Git-Log Drift Detection`. |
| WHERE | Three-tier interaction model (Tier 1: just talk, Tier 2: named actions, Tier 3: slash commands) | yes | no | Scratchpad notes "no card exists yet" — explicitly called out as a UX design note. This plan does not build the three-tier model but may benefit from it. Flag for future card creation. |
| WHERE | Raven concierge greeting (state-driven orientation: state read + top-1 nudge + open invitation) | yes | no | Scratchpad notes "no card or implementation." Out of scope for this plan but related to the returning-session job. |
| HOW | Noun-dialogue loading path — which step triggers it | yes | partial | `noun-dialogue.md` exists but is never referenced in `job-initialize.md`. The orphan fix is in-scope for this plan; no library card needed, but the fix must be verified in the procedure. |
| HOW | `session_notes` schema field documentation | yes | partial | References exist in `library-phase-2/tickets/LIB2-006.md` and `plans/233-implement-session-start-procedure/plan.md`. The field is being struck. All references must be found and removed; a tombstone comment in `alexandria-config.json` schema (in `output-formats.md`) may be needed to explain the intentional omission. |
| WHEN | Eval cases for initialize skill — current coverage of first-session vs returning-session paths | yes | partial | Eval harness has 3 cases for `skills/initialize/` but it is unclear from the library whether they cover both session paths. Builder should audit eval cases before adding Task lifecycle assertions to understand current coverage gaps. |

---

## Implementation Notes for Builder

### Hidden Dependency: FEAT-056 Must Land First

This plan builds on FEAT-056 (PR #393 — Raven writes config artifacts directly). If FEAT-056
has not merged before work begins on this plan, the artifact-write patterns in the new
first-session job will be wrong. Verify PR #393 is merged before touching artifact
production in the procedure.

### Anti-Pattern: Restoring /wizard as a Separate Entry Point

The most tempting architectural error is re-introducing a separate first-session entry
point to restore the "wizard feel." [[Artifact - Decision: Single Entry Point]] explicitly
rules this out. The correct approach is splitting `job-initialize.md` into sub-jobs that
are dispatched internally by the router — the human still sees only `/library`.

### Anti-Pattern: Task Primitives as a Hard Requirement

Task primitives (TaskCreate/TaskList/TaskUpdate) are an execution aid, not a hard
dependency. The procedure must degrade gracefully when they are unavailable (non-Claude-Code
harnesses, older versions). The prose procedure file is canonical. Tasks make progress
visible; they do not define the procedure.

### Anti-Pattern: Assessment.md as a Transitional Artifact

Do not add `assessment.md` back as an optional artifact, a temporary placeholder, or a
summary document with a new name. The architecture review scratchpad is explicit: it is a
"conversational turn, not an artifact." The stopping-point call in the first-session job
replaces it — Raven speaks the assessment, the human hears it, and nothing is written to
disk except `alexandria-config.json` and `initialize-output.md`.

### Anti-Pattern: Solicitation Prompts Thinned for Conciseness

FEAT-045 thinned the solicitation prompts when collapsing the wizard procedure. This plan
explicitly restores depth. Do not sacrifice prompt richness for procedural brevity. The
prompt library in `docs/initialize/phase-6-intake-engine.md` is the canonical source — use
mode variants when available, include "what good looks like" and "common pitfall" for
each gap.

### Sequencing Recommendation

Based on the dependency structure:

1. **Before anything:** Verify PR #393 (FEAT-056) is merged.
2. **First:** Build `alxndr scoreboard derive` CLI (enables session-start reconstruct in all three jobs).
3. **Second:** Strike `session_notes` from all references (low blast radius, clears the field).
4. **Third:** Fix noun-dialogue orphan (single-file fix, verifiable immediately).
5. **Fourth:** Build the three-job structure for `job-initialize.md` (router + first-session + returning-session), restoring solicitation depth and gap-analysis beat, incorporating git-log drift detection.
6. **Fifth:** Add Task primitive orchestration to first-session job with graceful degradation.
7. **Sixth:** Kill `assessment.md` — prune `assessment-generation.md` and `output-formats.md` assessment template.
8. **Seventh:** Update eval harness with Task lifecycle assertions; run all three initialize eval cases; update baselines.
9. **Eighth:** Update library cards (`Agent - Raven the Maven` HOW section; any other affected cards).

### Pre-FEAT-045 Wizard SKILL.md — What Was Lost

The pre-FEAT-045 wizard SKILL.md (commit `02ba02f`) had inline collaboration heuristics
that were significantly richer than the current `job-initialize.md`:

- The Frankenstein Diagnostic was explained inline with interpretation guidance (not just mentioned)
- Mismatch Detection had specific example phrases ("You said Low complexity, but...")
- Guidance Gap Pattern named specific areas and stakes
- Stopping-Point Language had example phrasing for clearance statements
- The collaboration model (senior PM to VP) was explicit

These heuristics live in `skills/raven/expert-calibration.md` but the procedure file
(`job-initialize.md`) no longer references them with the same richness. Restoring depth
means ensuring the first-session job procedure is explicit about when expert-calibration
heuristics apply, not just "load expert-calibration.md."

---

## Completion Status

**Status:** DONE_WITH_CONCERNS

**Concerns:**

1. **FEAT-056 dependency is unverified.** This briefing assumes PR #393 has landed. If it
   has not, the artifact-write patterns in the first-session job will be wrong on day one.
   Verify before starting.

2. **No Scoreboard System card exists.** `alxndr scoreboard derive` is the first CLI the
   plan builds, and there is no library card for the Scoreboard system beyond the renderer
   (`src/tools/scoreboard.ts`). The builder will need to design the derive CLI from
   scratch — the scratchpad describes the need ("CLI command that reads config + globs
   library + computes fill + pipes to renderer") but no card specifies the schema or
   interface. This is a design decision the builder makes, not a retrieval gap.

3. **Eval case coverage for first-session vs returning-session paths is unknown from
   library evidence alone.** The three existing eval cases for `skills/initialize/` may
   not cover the new first-session/returning-session split or the Task lifecycle
   assertions. The builder must audit existing cases before adding new structural checks.

4. **Three-tier interaction model card does not exist.** The concierge greeting and
   top-1 rule for suggestions are mentioned in the scratchpad as design notes with no
   implementation. The returning-session job will need to make design decisions about
   these UX patterns that are not yet settled in the library.
