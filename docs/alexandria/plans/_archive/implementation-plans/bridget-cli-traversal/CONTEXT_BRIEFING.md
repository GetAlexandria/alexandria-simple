# Context Briefing

## Task Frame

**Task:** Wire Bridget's context-briefing skill to call `alxndr retrieve` for the mechanical graph-traversal step (seeds → neighbors per profile / budget / direction / U-shape). Keep task framing, profile selection, and narrative assembly agentic. Eval-gated: baseline → wire → re-run; must hold or improve. If regression, diagnose which profile knob needs surfacing as CLI config.

**Target type:** Agent (Bridget the Briefer) + Capability (Context Assembly) + System (Retrieval and Assembly Engine)

**Task type:** architecture / refactor (agentic → deterministic migration)

**Constraints:**
- The agentic boundary does NOT move: task classification, profile selection, seed identification, gap detection, and narrative assembly remain Bridget's judgment. Only the mechanical traversal step (hop expansion + budget application + U-shape ordering) migrates to the CLI.
- Eval gate is non-negotiable. Baseline scores must be captured before wiring; post-wire scores must hold or improve. Regression is a failing build — diagnose before merging.
- The existing `alxndr retrieve` CLI contract (`--seeds`, `--profile`, `--complexity`, `--library`, `--format json`) is the fixed interface. The plan must not redesign the CLI surface to fit skill behavior; it must identify whether existing knobs are sufficient or declare what is missing.
- `CONTEXT_BRIEFING.md` filename, mandatory sections, and completion-status keywords are a never-violate output contract. The migration must not touch these requirements.
- Bridget never modifies the library. This refactor is entirely in the skill / agent layer.

**Acceptance criteria:**
1. Bridget's skill files describe calling `alxndr retrieve` for the traversal step (not manual hop-following).
2. Bridget's agent definition (`agents/bridget.md`) reflects the updated procedure.
3. Eval case `bridget/assembly` passes structural checks and holds or improves judge scores vs. checked-in baseline.
4. If any eval criterion regresses, a root-cause note is written identifying which profile parameter (hops, direction, lateral, budget tier) was inadequate.
5. `provenance-log.md` and `feedback-queue.md` are produced for each assembly run (unchanged requirement).

---

## Primary Cards (full content)

### Principle - Agentic-Deterministic-Agentic Pattern

**Type:** Principle
**Relevance:** This is the governing architectural rationale for the migration. Moving hop-traversal + budget + U-shape ordering into `alxndr retrieve` is the canonical application of this principle: a deterministic middle layer keeps mechanical traversal on rails while the agentic outer layer (task framing, profile selection) and inner layer (gap detection, narrative assembly) retain judgment. This card defines what "correct" looks like and what violating it looks like.

### WHAT: The Principle

Well-designed orchestration stacks three layers: an agentic outer layer, a deterministic middle layer, and agentic inner layers. The outer layer is an agent that operates across the whole workflow but is constrained by it. The middle layer is a deterministic workflow that keeps execution on rails and can wrap both deterministic and non-deterministic stations. The inner layers are individual agent tasks that operate within the workflow structure. The `alxndr lint` CLI exemplifies the deterministic middle layer: mechanical sweeps with fixed rules and no judgment. This is an observed architectural pattern, not a hard requirement: it describes how well-functioning agentic systems tend to organize themselves when built with care.

### WHERE: Ecosystem

- Governs: [[Artifact - Play Pattern]], [[Artifact - Play Definition]]
- Related: [[Artifact - Decision: Orchestration Ownership]], [[Agent - Raven the Maven]], `alxndr lint` CLI, [[Agent - Sam the Scribe]], [[Agent - Conan the Librarian]], [[Principle - Plays Must Handle Conflict, Not Just Sequencing]]

### WHY: Belief

- Product Thesis: [[Product Thesis - Better Context Produces Better Agent Output]] — deterministic workflow rails constrain agent behavior to the right scope at each step
- Principle: [[Principle - One Verb Per Agent Role]] — the agentic-deterministic-agentic stack is what makes role clarity possible

### WHEN: Temporal Applicability

Articulated during the April 2026 strategy session based on months of implementation experience. Apply when designing new plays, new agent interactions, or evaluating whether a workflow has the right mix of determinism and agency.

### HOW: Application

**Three-Layer Stack:**

| Layer | Role | Who | Constraint |
|-------|------|-----|------------|
| Agentic outer | Navigates across the whole workflow; triggers and monitors | Raven, human | Bounded by workflow entry points |
| Deterministic middle | Keeps execution on rails; sequences steps and gates | Play definition | Fixed steps, known agents per step, defined exits |
| Agentic inner | Executes individual tasks with judgment | Sam, Conan, Solomon | Bounded by play step assignment |

**Applied to this migration:** Bridget's outer layer = task classification + profile selection + seed identification. Deterministic middle = `alxndr retrieve` call (hops, direction, lateral, budget, U-shape). Bridget's inner layer = gap checking, card reading, narrative assembly.

**What violating this looks like:**
- Bridget continues to manually follow wikilinks hop-by-hop while also calling the CLI — double traversal, inconsistent results.
- The CLI is called but its output is ignored in favor of Bridget's own ordering — deterministic step exists but is bypassed.
- Task modifiers (architecture → max upstream + lateral) are baked into CLI flags by the skill without surfacing them as named parameters — hides the mapping.

**Test:** Can you identify the outer agentic layer (Bridget classifying and framing), the deterministic middle (`alxndr retrieve` traversal), and the inner agentic layer (Bridget reading cards, checking gaps, assembling narrative)? If you cannot separate these three, the wiring is incomplete.

---

### Principle - Measure Before Promoting

**Type:** Principle
**Relevance:** This principle is the direct mandate for the eval gate requirement. "Retrieval profile changes are tested with: briefings using the new profile should include the same mandatory categories and produce equal or better factory output." The baseline → wire → re-run sequence is not optional ceremony — it is what this principle requires when changing assembly mechanics.

### WHAT: The Principle

When a play, template, or retrieval profile is revised, stage the new version and measure whether it actually improves outcomes before promoting it to canonical. Intuition about what will improve the system is often wrong.

### WHERE: Ecosystem

- Product Thesis: [[Product Thesis - Better Context Produces Better Agent Output]]
- Governs: [[Artifact - Play Definition]], [[Capability - Grading]], [[Capability - Surgery]]
- Implemented by: [[System - Eval Harness]]
- Related: [[Principle - The System Must Learn from Its Deployments]], [[Principle - The Playbook Documents Itself Through Versioning]], [[Principle - Output Discipline]]

### WHY: Belief

Without measurement, the system suffers ratcheting degradation. Each "improvement" makes one thing better and two things slightly worse. Version history without benchmark data is a changelog without accountability. This principle applies to every configurable artifact: plays, templates, retrieval profiles, grading rubrics, and `alxndr lint` sweep rules.

### WHEN: Temporal Applicability

Release 1 (2026-03-26) built the Eval Harness that implements this principle. Release 2 demonstrated the eval-per-increment pattern: running evals after each skill development stage caught issues early and showed quality progression.

### HOW: Application

**What following this looks like:**
- A revised retrieval profile is benchmarked: "Briefings using the new profile should include the same mandatory categories and produce equal or better factory output."
- Baseline scores are captured BEFORE the wiring change. Post-wire scores are compared. Promotion happens only if scores hold or improve.

**What violating this looks like:**
- Wiring the CLI and immediately shipping without a comparative eval run.
- Declaring "it worked when I tried it" as sufficient evidence.
- Running evals only after the PR is up rather than as a build gate.

---

### System - Eval Harness

**Type:** System
**Relevance:** The Eval Harness is the concrete mechanism for the eval gate. The planner must know: (1) where Bridget's eval cases live (`tests/eval-cases/bridget/assembly/`), (2) that structural checks and judge criteria both apply, (3) that baselines are checked into git and the `--compare` flag diffs against them, and (4) that a regression in judge criterion 7 ("retrieval profile adherence") is the primary indicator that a CLI profile knob is insufficient.

### WHAT: Definition

The Eval Harness is a reusable framework for testing conversational skills end-to-end. It runs scripted or adaptive inputs through a skill, records full transcripts, evaluates results with both deterministic structural checks and LLM-as-Judge quality criteria, and compares against checked-in baselines for regression detection.

### WHERE: Ecosystem

- Implements: [[Principle - Measure Before Promoting]]
- Parallels: [[System - Quality Grading Engine]]
- Related: [[Capability - Implementation Planning]], [[Artifact - Lesson: Multi-Turn Eval Dramatically Improves Quality]], [[Principle - Output Discipline]]

### WHY: Rationale

Conversational skills produce different output on every run. Manual testing catches obvious failures but misses subtle regressions. The harness solves this by recording full transcripts, evaluating every dimension, and diffing against checked-in baselines. Categorical scoring (excellent/good/adequate) avoids false precision.

### WHEN: Timeline

Built in Release 1. Rewritten to TypeScript. Currently validates: wizard skill (3 eval cases) and implementation planning skill (3 eval cases). Bridget has 1 eval case: `bridget/assembly`. Structural checks live at `tests/eval-cases/bridget/structural-checks.ts`. Judge criteria at `tests/eval-cases/bridget/judge-criteria.json`.

### HOW: Mechanics

- **Structural checks (deterministic):** File presence (`CONTEXT_BRIEFING.md`, `provenance-log.md`, `feedback-queue.md`), section headers, wikilink count, no fabricated cards, completion status keyword.
- **Judge criteria (quality):** 8 criteria, all `high` or `medium` weight. Most relevant to this migration: criterion 7 ("retrieval profile adherence — card selection matches the retrieval profile for the task type") — this is the primary regression indicator if the CLI traversal differs from Bridget's manual traversal.
- **Run:** `bin/alexandria-eval run bridget/assembly`
- **Compare:** `bin/alexandria-eval compare bridget/assembly`
- **Baseline:** checked into git; update after confirming scores hold or improve.

**Anti-patterns:**
- Single-prompt eval for a conversational skill.
- Running eval only at the end rather than baseline → change → re-run.
- Ignoring criterion 7 regressions as "noise" — they are the signal.

---

### Agent - Bridget the Briefer

**Type:** Agent
**Relevance:** The agent card defines Bridget's current ten-step procedure, her exclusive capability boundary, and her dependency on `[[System - Retrieval and Assembly Engine]]`. The plan must update `agents/bridget.md` to reflect the wired procedure. The card also specifies which steps remain agentic (steps 1-5, 7-10) and which migrate to the deterministic CLI (step 6).

### WHAT: Definition

Bridget the Briefer is the assembly interface between Alexandria and its AI consumers. She faces two directions: toward the library (reading cards, traversing the graph, applying retrieval profiles) and toward the factory (delivering briefings that help builder agents make aligned decisions). Bridget never modifies the library.

### WHERE: Ecosystem

- Depends on: [[System - Retrieval and Assembly Engine]], [[System - Knowledge Graph]], [[System - Feedback Queue]], [[System - Provenance Log]], [[Template - Context Briefing]]
- Coordinates with: `alxndr lint` CLI
- Capabilities: [[Capability - Context Assembly]]
- Governed by: [[Principle - One Verb Per Agent Role]], [[Principle - Serve Incomplete Libraries Honestly]], [[Principle - Attention Is a Resource with a Shape]]

### WHY: Rationale

- Product Thesis: [[Product Thesis - Better Context Produces Better Agent Output]] — Bridget is the delivery mechanism
- Principle: [[Principle - Serve Incomplete Libraries Honestly]] — Bridget's core operating principle

### WHEN: Timeline

Eval-driven hardening (2026-03) moved Bridget from briefing-writer-with-variable-format to briefing-assembler-with-a-reliable-contract. Release 2 added implementation planner as a consumer. Current status: **Implemented** — Bridget operates with 7 skill files and a ten-step assembly procedure. The retrieval and assembly engine is partially built (file-based); the target is MCP-mediated assembly. **This plan is an intermediate step: migrate the mechanical traversal to the CLI without waiting for full MCP infrastructure.**

### HOW: The Ten Steps — Current vs. Target

| Step | Current (agentic) | Target (after migration) |
|------|-------------------|--------------------------|
| 1 | Task arrives | (unchanged) |
| 2 | Classify task | (unchanged — agentic) |
| 3 | Load retrieval profile | (unchanged — agentic) |
| 4 | Apply task modifier | (unchanged — agentic) |
| 5 | Find seed cards (Glob/Grep) | (unchanged — agentic) |
| 6 | **Manually follow wikilinks, hop-by-hop** | **Call `alxndr retrieve` — deterministic** |
| 7 | Check mandatory categories | (unchanged — agentic, using CLI output as candidate set) |
| 8 | Assemble briefing | (unchanged — agentic) |
| 9 | Log provenance | (unchanged) |
| 10 | Triage feedback | (unchanged) |

**Anti-examples:**
- Bridget discovers a hollow WHY section and fills it with inferred reasoning. Never modifies the library.
- Bridget calls `alxndr retrieve` but then re-traverses the graph manually "to verify." The CLI output is the scaffold; targeted manual follow-up is allowed only for missing mandatory categories.

---

## Supporting Cards (summaries)

| Card | Type | Key Insight |
| --- | --- | --- |
| [[Capability - Context Assembly]] | Capability | Defines the ten-step procedure Bridget follows; step 6 (expand via retrieval profile) is the step being migrated to the CLI. Contains the epistemic note: assembly mechanics are "BUILD TO LEARN" territory — preserve the hedge when updating skill docs. |
| [[System - Retrieval and Assembly Engine]] | System | The RAE is the system Bridget depends on. Its WHEN section notes the current implementation is "file-based" and the target is "MCP-mediated." This plan is an intermediate step on that path — file-based CLI traversal replaces file-based agentic traversal. Evidence status: pre-validation. |
| [[Product Thesis - Better Context Produces Better Agent Output]] | Product Thesis | Primary thesis the whole migration serves. The eval gate validates that the migration doesn't degrade the thesis's delivery mechanism. Includes counter-thesis: "the cost of building and maintaining exceeds the marginal improvement." Keep this in view when diagnosing regressions. |
| [[Principle - Serve Incomplete Libraries Honestly]] | Principle | Governs Bridget's gap manifest behavior. Must not be degraded by the CLI migration — the CLI returns a card set, but Bridget still owns honest gap detection and the Gap Manifest section. |
| [[Principle - Attention Is a Resource with a Shape]] | Principle | U-shaped ordering is already encoded in `alxndr retrieve` output (`beginning`, `middle`, `end` position fields). The migration should use these positions directly rather than re-implementing ordering. |
| [[Principle - One Verb Per Agent Role]] | Principle | Bridget ASSEMBLES. She does not traverse, grade, or lint. The migration sharpens this boundary by removing traversal from her verb set. |

---

## Relationship Map

- [[Agent - Bridget the Briefer]] depends-on [[System - Retrieval and Assembly Engine]] (foundational mechanism for retrieval profiles, graph traversal, and briefing assembly)
- [[Agent - Bridget the Briefer]] invokes [[Capability - Context Assembly]] (the ten-step procedure Bridget follows)
- [[Capability - Context Assembly]] invokes [[System - Retrieval and Assembly Engine]] (step 6: expand via retrieval profile)
- [[System - Retrieval and Assembly Engine]] traverses [[System - Knowledge Graph]] (the graph the engine navigates)
- [[Principle - Agentic-Deterministic-Agentic Pattern]] governs [[Capability - Context Assembly]] (the pattern this migration instantiates)
- [[Principle - Measure Before Promoting]] implemented-by [[System - Eval Harness]] (the eval gate mechanism)
- [[System - Eval Harness]] validates [[Agent - Bridget the Briefer]] (through `tests/eval-cases/bridget/assembly/`)
- [[Product Thesis - Better Context Produces Better Agent Output]] constrains [[System - Retrieval and Assembly Engine]] (the engine is the thesis's delivery mechanism — regressions invalidate the thesis)
- `alxndr retrieve` CLI implements deterministic-middle-layer of [[Principle - Agentic-Deterministic-Agentic Pattern]] for Bridget's assembly workflow
- [[Principle - Attention Is a Resource with a Shape]] governs `alxndr retrieve` output ordering (U-shape is already encoded in CLI position fields)

---

## Gap Manifest

| Dimension | Topic | Searched | Found | Recommendation |
| --- | --- | --- | --- | --- |
| HOW | Explicit mapping from task modifier (e.g., "architecture → max upstream + lateral") to specific `--complexity` and `--profile` CLI flags | yes | no | The skill files (`task-modifiers.md`, `retrieval-profiles.md`) describe traversal behaviors but do not map them to `alxndr retrieve` flag values. The plan should produce this mapping as a concrete artifact — either a table in the updated skill or inline in `protocol.md`. This is the most likely source of eval regressions. |
| HOW | Decision rule for when Bridget should do targeted manual follow-up after calling `alxndr retrieve` (e.g., "if mandatory category is absent from CLI result, search specifically for it") | yes | partial | `protocol.md` mentions "targeted follow-up only when seeds are missing, required categories are still absent, or the CLI is unavailable" — but the fallback behavior is not specified in detail. The plan should harden this rule. |
| WHERE | Whether `alxndr retrieve` CLI is invokable from within the Bridget skill (e.g., via `Bash` tool call) | yes | not confirmed | The retrieve CLI exists at `bin/alexandria-retrieve`. Whether Bridget's skill context can invoke it via Bash is an implementation assumption the plan needs to verify and document. |
| WHEN | Whether the Bridget eval case (`bridget/assembly/`) currently captures a baseline with the existing agentic traversal behavior | yes | not confirmed | The eval case directory exists (`tests/eval-cases/bridget/assembly/`) but whether a passing baseline is checked in was not verified during assembly. The plan must confirm baseline state before making any skill changes. |
| WHY | No card exists for "Principle - One Verb Per Agent Role" (referenced in Bridget's WHERE section) | yes | no | Wikilink appears in Bridget's card but the file was not found in the library. If this principle card is missing, it is a library gap — log to feedback queue for Sam. Does not block the plan. |
| WHY | No card exists for "Principle - Factory Demand Drives Library Priority" (referenced in Bridget's WHERE section) | yes | no | Same as above — referenced but not found. Does not block the plan. |

---

## Anti-Patterns to Avoid

The following are specific failure modes for this migration, drawn from the cards above:

1. **Double traversal.** Calling `alxndr retrieve` AND continuing to manually follow wikilinks in the same assembly pass. The CLI output is the scaffold. Manual follow-up is only for missing mandatory categories, not for "verification."

2. **Eval gate at the end.** Running evals only after the PR is created. The gate is: baseline first, then wire, then re-run. A regression discovered after PR opening requires a fix and a new eval run before merging.

3. **Treating criterion 7 regressions as noise.** Judge criterion 7 ("retrieval profile adherence") is the primary signal that the CLI's profile knobs are insufficient. If it regresses, the diagnosis is: which traversal behavior (hops, direction, lateral scope, budget tier) was lost in the migration? Surface that as a CLI config need, not a skill workaround.

4. **Baking task modifier mappings silently into flag values.** The skill currently applies task modifiers (e.g., "architecture → max upstream + lateral") through agentic judgment. When this is expressed as `--complexity architecture --profile agent`, that mapping must be explicit and documented — not implicit in Bridget's choices at runtime.

5. **Removing the epistemic hedge.** The `Capability - Context Assembly` card explicitly notes that assembly mechanics are "BUILD TO LEARN" territory. Updating the skill to describe CLI-based traversal should not remove this hedge — the CLI traversal is also pre-validation.

6. **Confusing the outer and inner agentic layers.** Task classification and profile selection (outer) must not become CLI-driven. Gap detection and narrative assembly (inner) must not be moved to the deterministic middle. The three-layer boundary is the test.

---

## Completion Status

**Status:** DONE_WITH_CONCERNS

**Concerns:**
1. Two principle cards referenced in Bridget's library card were not found during assembly (`Principle - One Verb Per Agent Role`, `Principle - Factory Demand Drives Library Priority`). These are library gaps, not blockers for the plan.
2. The task-modifier-to-CLI-flag mapping (e.g., "architecture change → which exact `--complexity` and `--profile` values?") has no card or documented artifact in the library. This is the highest-risk gap for the implementation: if the mapping is wrong, criterion 7 will regress. The plan should treat producing this mapping as a Day 1 artifact.
3. Whether the Bridget eval baseline is in a passing state was not confirmed during assembly. The plan must verify this before making any skill changes.
