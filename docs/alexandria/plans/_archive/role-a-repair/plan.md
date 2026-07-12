# Plan: Role A Structural Repair

## Goal

Bring Alexandria's type taxonomy and vocabulary to A-grade for Role A — the library's
job of documenting Alexandria product itself. An A-grade on Role A means:

- Every type name is grounded in an established convention or a deliberate, documented choice
- Every type definition is precise enough to classify cards unambiguously
- The vocabulary set holds together internally — no term collisions that cause repeated
  classification mistakes
- The taxonomy documentation accurately reflects the vocabulary and includes origin annotations
- The experience layer (Loops, Forces, the Experience Goal split) is internally coherent and
  correctly populated

This is structural repair, not construction. No new product knowledge is added; the skeleton
is corrected. Content work (Exemplar Workstream, Role B) follows after this pass is complete.

---

## Decisions Made

| Decision | Resolution |
|----------|------------|
| Alignment Sweep | **Option A** — rewrite from user POV, stays Loop |
| Aesthetic type final name | **Experience Goal** |
| Zone rename | Domain |
| Room rename | Section |
| Structure rename | Template |
| Overlay rename | Governance |
| Dynamic rename | Force |
| Component rename | Keep |
| Loop definition | Tightened: user participates, library improves, user returns to better starting position |
| Aesthetic split direction | Warmth + Daffy → Standard; experience-goal cards stay Experience Goal |
| Loop - Eval-Driven Skill Improvement | Create this card |
| Product Thesis name | Keep |

---

## Work Breakdown

### Priority 1 — Definition Fixes (do first; everything else depends on these)

| # | Item | Type | What changes |
|---|------|------|--------------|
| 1.1 | Loop definition | Definition fix | Update Type Taxonomy decision tree: replace "Repeating cycle" with the tightened definition: "A repeating engagement cycle in which the user participates, the library improves through the cycle, and the user returns to a better starting position." Update Noun Vocabulary term entry for Loop. |
| 1.2 | Force definition | Definition fix | Update Type Taxonomy decision tree: replace Dynamic/MDA framing with: "Emergent cross-system behavior — a reinforcing or limiting pattern that arises from agents following their principles, not from designed structure." Ground in systems-thinking language, not MDA. Update Noun Vocabulary. |
| 1.3 | Experience Goal split | Definition fix | Split the Aesthetic type into two concerns. The experience-goal subset (Well-Run Franchise, Transparent Machinery, Quiet Until Needed, Cumulative Not Sisyphean, Legible Graph) stays as the Experience Goal type. The craft-standard subset (Conversational Warmth, Professional Not Daffy) moves to Standard type. Update Type Taxonomy to reflect the narrowed definition of Experience Goal. |
| 1.4 | Governance (Overlay) definition | Definition fix | Update Type Taxonomy decision tree: add Governance as a type replacing Overlay. Definition: "A cross-cutting constraint or rule that applies across all Domains and Sections — something that persists everywhere in the system and is not contained by any single Domain." Update Noun Vocabulary. |

---

### Priority 2 — Reclassifications (depends on 1.3)

| # | Item | Type | What changes |
|---|------|------|--------------|
| 2.1 | Aesthetic - Conversational Warmth → Standard | Reclassification | Move card from `experience/aesthetics/` to `rationale/standards/`. Update the card: the WHAT section should frame it as a testable standard ("Raven's communication must..."), the HOW section should specify verifiable criteria that Nit or Conan can check. Rename file: `Standard - Conversational Warmth.md`. |
| 2.2 | Aesthetic - Professional, Not Daffy → Standard | Reclassification | Move card from `experience/aesthetics/` to `rationale/standards/`. Update similarly — the HOW already has a per-agent behavior table that reads like a standard. Rename file: `Standard - Professional, Not Daffy.md`. |
| 2.3 | Alignment Sweep — rewrite from user POV | Rewrite | Rewrite Loop - Alignment Sweep from user POV. WHAT centers user experience of receiving drift reports and watching library stabilize. HOW foregrounds user participation (judgment calls, ambiguous cases) and the compounding benefit (fewer fixes each cycle). WHEN notes that full automation would reduce user participation and may warrant reclassification. |

---

### Priority 3 — Type Renames (depends on 1.1–1.4; execute as a coordinated batch)

All five renames should be executed together in a single coordinated pass to minimize the
number of Downstream Sync cycles.

| # | Old Name | New Name | Folder change |
|---|----------|----------|---------------|
| 3.1 | Zone | Domain | `library/product/zones/` → `library/product/domains/` |
| 3.2 | Room | Section | `library/product/rooms/` → `library/product/sections/` |
| 3.3 | Structure | Template | `library/product/structures/` → `library/product/templates/` |
| 3.4 | Overlay | Governance | `library/product/overlays/` → `library/product/governance/` |
| 3.5 | Dynamic | Force | `library/experience/dynamics/` → `library/experience/forces/` |
| 3.6 | Aesthetic | Experience Goal | `library/experience/aesthetics/` → `library/experience/experience-goals/` |

**After all renames:** Conan runs Job 9 (Downstream Sync) to update all meta-files.
Nit runs Sweep 6 (path resolution) to catch any broken references. Both are mandatory.

**Wikilink updates required across all cards:**
- `[[Zone - ` → `[[Domain - `
- `[[Room - ` → `[[Section - `
- `[[Structure - ` → `[[Template - `
- `[[Overlay - ` → `[[Governance - `
- `[[Dynamic - ` → `[[Force - `
- `[[Aesthetic - ` → `[[Experience Goal - `

**File renames:**
- `Zone - Library Interior.md` → `Domain - Library Interior.md`
- `Zone - Library Boundary.md` → `Domain - Library Boundary.md`
- `Room - Card Repository.md` → `Section - Card Repository.md`
- `Room - Assembly Workspace.md` → `Section - Assembly Workspace.md`
- `Room - Source Material.md` → `Section - Source Material.md`
- `Room - Feedback Workspace.md` → `Section - Feedback Workspace.md`
- `Room - Rationale Layer.md` → `Section - Rationale Layer.md`
- `Structure - Card.md` → `Template - Card.md`
- `Structure - Context Briefing.md` → `Template - Context Briefing.md`
- `Structure - Implementation Plan.md` → `Template - Implementation Plan.md`
- `Overlay - Agent Capability Matrix.md` → `Governance - Agent Capability Matrix.md`
- `Dynamic - Coverage Momentum.md` → `Force - Coverage Momentum.md`
- `Dynamic - Quality Ratchet.md` → `Force - Quality Ratchet.md`
- `Aesthetic - Cumulative, Not Sisyphean.md` → `Experience Goal - Cumulative, Not Sisyphean.md`
- `Aesthetic - Legible Graph.md` → `Experience Goal - Legible Graph.md`
- `Aesthetic - Quiet Until Needed.md` → `Experience Goal - Quiet Until Needed.md`
- `Aesthetic - Transparent Machinery.md` → `Experience Goal - Transparent Machinery.md`
- `Aesthetic - Well-Run Franchise.md` → `Experience Goal - Well-Run Franchise.md`

---

### Priority 4 — New Cards (can proceed after Priority 1; does not depend on renames)

| # | Item | Type | What to build |
|---|------|------|---------------|
| 4.1 | Loop - Eval-Driven Skill Improvement | New card | The run → score → diagnose → fix → re-baseline cycle. The user participates (runs evals, reviews scores, diagnoses regressions, decides on fixes, checks in baselines). The library improves (skill baselines rise over time). The user returns to a better starting position (next eval run starts from a higher-quality baseline). Related to: System - Eval Harness, Capability - Implementation Planning. |
| 4.2 | Loop - Library Cold Start | New card (lower priority) | Assess after 4.1 whether this is genuinely distinct from Journey - Library Genesis to Steady-State. If the Journey already covers this adequately, skip 4.2. |

---

### Priority 5 — Taxonomy Documentation Updates (do last; reflects completed changes)

| # | Item | Type | What changes |
|---|------|------|--------------|
| 5.1 | Artifact - Type Taxonomy | Doc update | (a) Update decision tree throughout with all renamed types. (b) Update Loop definition. (c) Update Aesthetic entry to reflect Experience Goal with narrowed definition. (d) Add containment note: "Sections are always inside Domains — the containment rule must be explicit because the words no longer carry the hierarchy signal that Zone/Room provided." (e) Add origin annotations section: for each type, note its source tradition (established convention / product-standard / systems-thinking / homebrewed). |
| 5.2 | Artifact - Noun Vocabulary | Doc update | (a) Update Card Types row to reflect all renames. (b) Add origin column to types table. (c) Add "How to Read This Vocabulary" section at the top of the HOW section: explain the four-layer structure (Rationale / Domain / Experience / Temporal) so new readers have the framework before encountering the term list. |

---

## Priority Order and Dependencies

```
Priority 1: Definition fixes (1.1–1.4, can parallelize)
    ↓
Priority 2: Reclassifications (2.1 and 2.2 depend on 1.3; 2.3 depends on pre-work decision ✅)
    ↓
Priority 3: Type renames (depends on 1.1–1.4; execute as coordinated batch)
    + Downstream Sync (Conan Job 9) immediately after
    + Nit Sweep 6 immediately after Downstream Sync
    ↓ (can run in parallel with Priority 3)
Priority 4: New cards (depends on 1.1 for Loop definition)
    ↓
Priority 5: Documentation updates (depends on all prior items being complete)
```

Priorities 3 and 4 can run in parallel.

---

## Agent Assignments

| Work | Agent | Notes |
|------|-------|-------|
| Priority 1 — definition fixes | Sam (writes) + Conan (reviews) | Conan verifies definitions match session reasoning before Sam finalizes |
| Priority 2.1, 2.2 — reclassifications | Sam | Move files, update card content, update wikilinks |
| Priority 2.3 — Alignment Sweep | Sam | Rewrite from user POV per Option A |
| Priority 3 — type renames | Sam | Grep-and-replace wikilinks, rename files, rename folders |
| Priority 3 — Downstream Sync | Conan (Job 9) | Mandatory immediately after renames complete |
| Priority 3 — path resolution | Nit (Sweep 6) | Mandatory immediately after Downstream Sync |
| Priority 4 — new Loop cards | Sam | Build against tightened Loop definition |
| Priority 5 — taxonomy doc updates | Sam (writes) + Conan (reviews) | Conan verifies origin annotations are accurate |

---

## Success Criteria

Role A is complete when:

1. All six type renames are applied across all cards and folders (including Aesthetic → Experience Goal)
2. All renamed type cards have updated definitions matching session decisions
3. Conversational Warmth and Professional Not Daffy are Standard cards in `rationale/standards/`
4. Alignment Sweep card has been rewritten from user POV (Option A)
5. Loop - Eval-Driven Skill Improvement card exists
6. Type Taxonomy artifact reflects all changes with origin annotations
7. Noun Vocabulary artifact has updated term table and "how to read" orientation
8. Downstream Sync has been run (Conan Job 9)
9. Nit Sweep 6 passes with zero path-resolution failures
10. No card in the library references a renamed type by its old name
