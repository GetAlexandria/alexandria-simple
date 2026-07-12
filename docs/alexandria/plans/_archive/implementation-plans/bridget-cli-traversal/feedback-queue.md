# Feedback Queue — Bridget CLI Traversal Briefing

**Date:** 2026-04-15
**Source:** Bridget the Briefer — context briefing assembly for `bridget-cli-traversal` plan
**Consumer:** Conan the Librarian (triage), Sam the Scribe (card creation)

---

## Missing Cards

### 1. Principle - One Verb Per Agent Role

**Signal type:** Missing card
**Priority:** Medium
**Discovered via:** Wikilink in `Agent - Bridget the Briefer` WHERE section
**Searched:** `Glob` for `docs/alexandria/library/rationale/principles/Principle - One Verb Per Agent Role.md` — not found
**Impact:** This principle is referenced as governing Bridget's role boundary ("Bridget ASSEMBLES; does not grade, build, or lint") and is central to the agentic-deterministic migration's role clarity argument. Without the card, the rationale is cited but not readable.
**Recommendation:** Sam should create this card. It can be bootstrapped from the description in Bridget's WHERE section and the Agentic-Deterministic-Agentic Pattern's HOW section.

---

### 2. Principle - Factory Demand Drives Library Priority

**Signal type:** Missing card
**Priority:** Medium
**Discovered via:** Wikilink in `Agent - Bridget the Briefer` WHERE section
**Searched:** `Glob` for the file — not found
**Impact:** Referenced as governing Bridget's gap-logging behavior ("Bridget's gaps tell Sam what to build next"). This is a frequently-cited principle across multiple cards but has no standalone card.
**Recommendation:** Sam should create this card. High connectivity — it will be referenced by Bridget, Sam, the Feedback Queue system, and the RAE system cards.

---

## Weak Cards

### 3. Capability - Context Assembly — BUILD TO LEARN hedge should be preserved through migration

**Signal type:** Weak card (risk of degradation)
**Priority:** High
**Context:** The Capability - Context Assembly card explicitly notes that assembly mechanics are "BUILD TO LEARN territory — the reasoning is clear but the evidence is thin." When the plan updates this card to reflect CLI-based traversal, there is a risk that confident language about the new approach will replace the existing epistemic hedge.
**Recommendation:** Conan should flag this card for review after the migration plan closes. The hedge should be updated, not removed — CLI traversal is also pre-validation.

---

## Relationship Discoveries

### 4. `alxndr retrieve` CLI ↔ Principle - Attention Is a Resource with a Shape

**Signal type:** Undocumented relationship
**Priority:** Low
**Context:** The `alxndr retrieve` CLI encodes U-shaped ordering directly in its output (position fields: `beginning`, `middle`, `end`). This is a concrete implementation of `Principle - Attention Is a Resource with a Shape`. Neither the Principle card nor the System - Retrieval and Assembly Engine card names the CLI as an implementer of this principle.
**Recommendation:** When Sam updates the RAE system card or the Principle card, add the CLI as a named implementer.

---

## Assembly Gaps (retrieval misses)

### 5. Task-modifier-to-CLI-flag mapping — no card or documented artifact

**Signal type:** Assembly gap (structural knowledge missing from library)
**Priority:** High
**Context:** The task-modifiers skill file describes traversal behaviors in prose (e.g., "architecture change → maximum upstream and lateral expansion"). The `alxndr retrieve` CLI takes flags (`--profile`, `--complexity`, `--direction`, `--hops`). The mapping between the two is implicit in the skill and was not found as any card or artifact.
**Impact:** This gap is the highest-risk factor for the migration. If Bridget maps task modifiers to CLI flags incorrectly, eval criterion 7 will regress.
**Recommendation:** The implementation plan should produce this mapping as a Decision artifact (e.g., `Artifact - Decision: Task Modifier to CLI Flag Mapping`). Sam should create the card after the plan confirms the mapping.

---

### 6. No eval baseline state confirmation

**Signal type:** Assembly gap (temporal / WHEN dimension)
**Priority:** High
**Context:** The Bridget eval case directory exists (`tests/eval-cases/bridget/assembly/`). Whether a passing baseline is currently checked into git was not verifiable during briefing assembly (would require running `bin/alexandria-eval compare bridget/assembly`).
**Impact:** If no passing baseline exists, the "baseline → wire → re-run" sequence cannot start from a confirmed baseline. The implementation plan must verify this as its first step.
**Recommendation:** Plan should open with: `bin/alexandria-eval run bridget/assembly && bin/alexandria-eval compare bridget/assembly`. If no baseline exists, establish one before any skill changes.
