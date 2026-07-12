# Provenance Log

**Briefing:** architecture-review-hardening
**Date:** 2026-04-10
**Assembled by:** Bridget the Briefer

---

## Retrieval Summary

**Task classification:**
- Target type: Architecture (multi-surface — System, Agent, Capability, Loop, Artifact)
- Task type: architecture
- Complexity: Architecture change (maximum budget: 5-8 primary, 8-12 supporting)
- Retrieval profile applied: Agent (primary surface for Nit retirement); Architecture task modifier (maximum upstream + lateral expansion; WHY, WHERE, WHEN priority)

**Retrieval method:** Manual graph traversal (CLI retrieval tool not invoked for this task — scope is meta-level, traversing agent files and design docs)

**Seed terms used:** lint, nit, agent, sweep, health check, quality cycle, wizard, library, terminology, type taxonomy, CI gate

---

## Cards Evaluated

| Card | Decision | Rationale |
| --- | --- | --- |
| Agent - Nit the Picker (library card) | Primary | Subject of the retirement — full content needed |
| Artifact - Type Taxonomy | Primary | Authoritative source for terminology drift fix; contains current type names |
| Agent - Bridget the Briefer (library card) | Primary | Briefing compliance check relationship with Nit; affected by retirement |
| Architecture Review Scratchpad (2026-04-10) | Primary | Primary task specification — authoritative scope document |
| agents/nit.md | Primary (source file) | Implementation of Nit's sweeps, the CLI integration, what stays vs. what retires |
| agents/conan.md | Supporting | Division-of-labor section references Nit; must update |
| agents/sam.md | Supporting | Post-build coordination with Nit; must update |
| agents/raven.md | Supporting | Dispatches Nit; `/wizard` entry point affected by collapse |
| skills/nit/sweeps.md | Supporting | Canonical sweep definitions; the L6 families not yet in CLI are specified here |
| skills/conan/job-health-check.md | Supporting | The assessment half of the Health Check + Quality Cycle collapse |
| docs/design/playbook.md (Play 4.1, 2.2) | Supporting | Health Check play and Improvement Loop — the two plays being collapsed |
| docs/design/alexandria.md | Supporting | Contains the terminology drift being fixed |
| Artifact - Decision 5: Four Agents Not One | Supporting | Architectural precedent for agent team design |
| Artifact - Decision 7: Nit as Independent Linter | Supporting | Decision being evolved (not reversed) by the retirement |
| Artifact - Anti-Pattern: Grade Softening | Supporting | Primary guard that grade-evidence reconciliation protects against |
| Loop - Alignment Sweep | Supporting | Driven by Nit; needs updating after retirement |
| Principle - The Linter Is Adversarial by Design | Supporting | Transfers to CLI tool; principle card unchanged |
| src/tools/lint-core.ts | Supporting (source file) | Current lint targets and extension points |
| src/tools/lint-grades.ts | Supporting (source file) | Partial implementation of grade-evidence reconciliation already exists |

**Cards excluded:**
- `docs/alexandria/sources/` — frozen provenance, excluded per retrieval protocol
- Experience Goal and Force cards — not relevant to this architectural task
- Product Thesis cards — traversed for WHY chain; none elevated to primary (existing WHY chain is stable, this is an implementation task)

---

## Graph Traversal Notes

- `agents/nit.md` → [[Agent - Nit the Picker]] (library card) — confirmed retirement scope
- [[Agent - Nit the Picker]] → [[Capability - Linting]] — capability card needs update post-retirement
- [[Agent - Nit the Picker]] → coordinates-with all other agents — blast radius confirmed across all 5 remaining agent cards
- [[Artifact - Type Taxonomy]] → confirmed current type names; cross-checked against `docs/design/alexandria.md` terminology
- `docs/design/playbook.md` scanned for all Nit references — found in approximately 20 of 30+ plays
- `skills/nit/sweeps.md` → sweep-6 manual families identified as the new CLI targets

---

## Decisions Made During Assembly

1. Classified as **architecture** task type (not refactor): the scope includes retiring an agent, adding CLI targets, and changing how plays work — this changes fundamental structure, not just implementation.
2. Applied maximum card budget (architecture tier: 5-8 primary, 8-12 supporting).
3. Elevated the Architecture Review Scratchpad to Primary status (not a library card, but the authoritative scope document; absence would leave the briefing misleading).
4. Flagged 6 gaps — all legitimate gaps where the library or source material is silent on implementation details.
