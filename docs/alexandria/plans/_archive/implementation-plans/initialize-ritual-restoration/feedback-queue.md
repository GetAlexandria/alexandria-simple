# Feedback Queue — initialize-ritual-restoration

**Assembled by:** Bridget the Briefer
**Date:** 2026-04-14
**Source:** Context briefing assembly for `initialize-ritual-restoration`

---

## Library Gaps Discovered

### G-001: No System or Capability card for `alxndr scoreboard derive`

**Type:** Missing card
**Priority:** High — this CLI is the first deliverable of the plan; library has no card for it
**Searched:** `docs/alexandria/library/product/systems/System - Scoreboard*.md` (0 results),
  `docs/alexandria/library/product/capabilities/` (no scoreboard CLI entry)
**Action for Sam:** After the CLI ships, create a Capability card for `alxndr scoreboard derive`
  OR a System card for a Scoreboard Renderer system. The scratchpad describes the intended
  behavior: "CLI command that reads config + globs library + computes fill percentages + pipes
  to renderer." Use that as the WHAT. The renderer (`src/tools/scoreboard.ts`) and derivation
  contract (`docs/initialize/scoreboard-derivation.md`) are the existing infrastructure to reference.

---

### G-002: No Decision card for killing assessment.md as a persisted artifact

**Type:** Missing card
**Priority:** Medium — rationale exists in scratchpad but not in library
**Searched:** `docs/alexandria/library/product/artifacts/Artifact - Decision*assessment*.md` (0 results)
**Action for Sam:** After the plan ships and `assessment.md` is removed, create
  `Artifact - Decision: Assessment as Conversational Turn`. Key content: assessment is Raven
  saying "here's where we stand" — a conversational turn, not an artifact. Stale the moment
  written. Nobody else reads it. If library has proper state (config + scoreboard derivation),
  Raven reconstructs current state on session-start. Same argument as `session_notes`.

---

### G-003: No Decision card for git-log drift detection replacing directory heuristics

**Type:** Missing card
**Priority:** Medium — architectural decision with future implications
**Searched:** `docs/alexandria/library/product/artifacts/Artifact - Decision*drift*.md` (0 results)
**Action for Sam:** After the plan ships, create `Artifact - Decision: Git-Log Drift Detection`.
  Key content: session-start checks for `src/`, `app/` dirs as proxy for "has project changed."
  Git log since last config date is more accurate and tells you exactly what changed.
  Replaces the 8-step greenfield-to-brownfield detection with one git query.

---

### G-004: No card for the three-tier job structure (router + first-session + returning-session)

**Type:** Missing card update
**Priority:** High — `Agent - Raven the Maven` HOW section will be stale after this plan ships
**Searched:** `Agent - Raven the Maven` card read — WHEN section references FEAT-045 and sole
  entry point, but job surface still describes "two jobs" (job-product-conversation + job-initialize)
**Action for Sam:** After the plan ships, update `Agent - Raven the Maven` HOW section to
  describe the new three-job structure: router, first-session, returning-session. Also update
  WHEN to reference this plan's outcome.

---

### G-005: No card for Claude Code Task primitive integration pattern

**Type:** Missing card
**Priority:** Low — design pattern being validated by this plan; premature to document before validation
**Searched:** No card exists describing when/how to use TaskCreate/TaskList/TaskUpdate in
  Alexandria agent procedures
**Action for Sam (deferred):** After Task orchestration is validated in practice, create
  a Standard or Decision card for the pattern: Task primitives as execution aids with
  graceful degradation. Do not create this card before the pattern is validated — premature
  specification of an unvalidated pattern is a known anti-pattern.

---

### G-006: Three-tier interaction model (no card)

**Type:** Missing card
**Priority:** Low — out of scope for this plan
**Searched:** Scratchpad explicitly notes "no card exists yet" for the three-tier model
  (Tier 1: just talk, Tier 2: named actions, Tier 3: slash commands)
**Action for Sam (deferred):** This is a design exercise, not a card-creation task. The
  returning-session job will make design decisions in this space. Once the pattern stabilizes
  from the returning-session job implementation, Sam should create a card.

---

## Weak Cards Flagged

### W-001: System - Wizard Configuration Engine — WHEN section may be stale after this plan

**Type:** Weak/stale warning
**Card:** `docs/alexandria/library/product/systems/System - Wizard Configuration Engine.md`
**Issue:** WHEN section describes v0.4.1 and v0.5.0 as most recent changes. After this plan
  ships, the interface layer will be significantly restructured (new three-job shape, Task
  orchestration, gap-analysis beat restored). The WHEN section needs a new entry.
**Action for Conan:** Flag for update after `initialize-ritual-restoration` ships. Raven
  should also update this card's WHEN section as part of plan close-out.

---

## Retrieval Misses

### R-001: `bin/alexandria-retrieve` not used

**Type:** Process note
**Reason:** The task description specified reading both library cards and skill procedure
  files. The retrieve CLI handles library graph traversal but does not read skill files
  (outside `docs/alexandria/library/`). Given the density of out-of-library references
  required (9 skill files, 2 plan files, 1 git history read), manual retrieval was used
  throughout. The library-side cards (Agent, System, Artifact, Principle, Standard, Loop)
  were navigated by direct Glob/Read following the wikilink graph from seed cards.
**Recommendation:** Wire Bridget to call `alxndr retrieve` for the library-card portion of
  future briefings even when skill files must also be read manually. This is the broader
  scratchpad finding (Bridget doesn't use alxndr retrieve CLI).

---

## Discovered Relationships (not yet in library)

### DR-001: `assessment-generation.md` depends-on `assessment.md` persisting

The relationship between `skills/initialize/assessment-generation.md` and the assessment
artifact is not encoded in any library card. When `assessment.md` is killed, the
assessment-generation.md file either becomes dead or must be repurposed. This is a
hard dependency not visible from the library graph.

**Action:** Builder should audit `assessment-generation.md` during the plan — prune or
delete the file; do not leave it as a dead reference.

### DR-002: `noun-dialogue.md` is never loaded in the current procedure

The file `skills/initialize/noun-dialogue.md` exists but no step in `job-initialize.md`
loads it. This orphan was discovered during briefing assembly when reading the skill files.
The relationship between the noun proposal dialogue step and the file that defines it is
broken. The plan fix-list includes this explicitly.

**Action:** Already in scope for this plan. No additional library action needed.
