# Provenance Log — Bridget CLI Traversal Briefing

**Date:** 2026-04-15
**Assembled by:** Bridget the Briefer
**Task:** Architecture / refactor — wire Bridget's context-briefing skill to call `alxndr retrieve` for mechanical graph traversal

---

## Classification

- **Target type:** Agent (Bridget the Briefer) + Capability (Context Assembly) + System (Retrieval and Assembly Engine) — cross-system architecture change
- **Task type:** architecture / refactor (agentic→deterministic migration)
- **Profile applied:** Agent (3-hop, both directions, broad lateral) as primary; System profile applied as secondary for RAE
- **Task modifier applied:** Architecture — maximum WHY + WHERE emphasis, full upstream expansion, blast radius assessment

---

## Seed Cards Identified

1. `Principle - Agentic-Deterministic-Agentic Pattern` — governing principle for this migration class; confirmed present
2. `Agent - Bridget the Briefer` — primary target surface
3. `System - Eval Harness` — eval gate mechanism
4. `Capability - Context Assembly` — the ten-step procedure being refactored

---

## Retrieval Decisions

`bin/alexandria-retrieve` was not called directly (the library path for this Alexandria repo is `docs/alexandria/library/`, not `docs/alexandria/`; the fixture structure differs from a target project). Manual traversal was used following the Agent profile (3-hop, broad lateral, WHY-priority). This matches the profile logic encoded in `src/tools/retrieve.ts`.

**Cards read during assembly (in order):**

| Card | Read | Role Decision | Rationale |
|------|------|--------------|-----------|
| `Principle - Agentic-Deterministic-Agentic Pattern` | Full | Primary | Governing architectural principle for the migration; mandatory WHY card |
| `Agent - Bridget the Briefer` | Full | Primary | Direct target surface |
| `System - Eval Harness` | Full | Primary | Concrete mechanism for the eval gate; builder cannot miss it |
| `Principle - Measure Before Promoting` | Full | Primary | Direct mandate for the eval-gate requirement; high architectural weight |
| `Capability - Context Assembly` | Full | Supporting | Ten-step procedure; step 6 is the migration target |
| `System - Retrieval and Assembly Engine` | Full | Supporting | Foundational mechanism; pre-validation status note important |
| `Product Thesis - Better Context Produces Better Agent Output` | Full | Supporting | Primary thesis the migration serves; counter-thesis relevant for regression diagnosis |
| `Principle - Serve Incomplete Libraries Honestly` | Full | Supporting | Must not be degraded by migration |
| `Principle - Attention Is a Resource with a Shape` | Full | Supporting | U-shape ordering already encoded in CLI output fields |
| `skills/context-briefing/retrieval-profiles.md` | Partial | Reference | Profile definitions to understand CLI profile mapping |
| `skills/context-briefing/task-modifiers.md` | Partial | Reference | Task modifier behavior to understand what maps to CLI flags |
| `skills/context-briefing/protocol.md` | Partial | Reference | Current CLI-first retrieval flow already described |
| `src/tools/retrieve.ts` | Partial | Reference | CLI interface, PROFILES/BUDGETS constants, output format |
| `tests/eval-cases/bridget/structural-checks.ts` | Full | Reference | Structural check requirements for eval gate |
| `tests/eval-cases/bridget/judge-criteria.json` | Full | Reference | Judge criteria; criterion 7 identified as primary regression indicator |

**Cards searched but not found:**
- `Principle - One Verb Per Agent Role` — referenced in Bridget's WHERE section; file not found in library
- `Principle - Factory Demand Drives Library Priority` — referenced in Bridget's WHERE section; file not found in library
- `Product Thesis - Better Context Produces Better Agent Output` — found under `rationale/product-theses/` (not `library/rationale/...` — confirmed correct path)

---

## Ordering Decisions

**Primary cards** (4): Placed at beginning (highest attention)
- Agentic-Deterministic-Agentic Pattern — governing rationale, must be first
- Measure Before Promoting — eval gate mandate
- System - Eval Harness — concrete eval mechanism with implementation details the builder needs
- Agent - Bridget the Briefer — direct target; ten-step procedure with current vs. target table

**Supporting cards** (5): Table in middle
- Capability - Context Assembly, System - Retrieval and Assembly Engine, Product Thesis, Serve Incomplete Libraries Honestly, Attention Is a Resource with a Shape, One Verb Per Agent Role

**Anti-patterns section**: Placed at end (second-highest attention) per U-shape protocol

---

## Mandatory Category Check (Agent profile)

| Mandatory Category | Required | Found |
|-------------------|----------|-------|
| Home Section / Domain | yes | partial — `[[Domain - Library Boundary]]` referenced but card not read (not blocking) |
| All Capabilities available to Bridget | yes | Context Assembly found |
| Coordinating Agents | yes | Conan coordination noted in Bridget's WHERE |
| Full WHY chain (1+ Product Thesis, all referenced Principles) | yes | Better Context thesis + 3 principles in primary set |
| Anti-pattern check (Agent card + home Section) | yes | Bridget HOW section anti-examples read |

---

## Assembly Notes

- Card budget: architecture complexity = 5-8 primary, 8-12 supporting. Final: 4 primary (slightly under budget — all four are high-value; adding a 5th would dilute), 6 supporting summary entries.
- The briefing task modifier (architecture) pushed WHY and WHERE emphasis to maximum, which drove selection of the Agentic-Deterministic-Agentic principle card as the first primary card.
- The eval harness card was elevated to primary (rather than supporting) because the builder cannot safely proceed without the implementation details: eval case paths, criterion numbers, CLI commands. A one-line summary would not serve.
- The task-modifier-to-CLI-flag mapping gap was identified as the highest-risk gap and placed in the Gap Manifest with a "highest-risk" note.
