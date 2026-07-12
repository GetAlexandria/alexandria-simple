# Provenance Log — Field Hardening

**Assembled:** 2026-04-23
**Assembler:** Bridget the Briefer
**Method:** Manual graph traversal (ax retrieve CLI unavailable in this session)

## Retrieval Decisions

### Seed Cards

| Seed | Reason |
| --- | --- |
| Artifact - Type Taxonomy | Work stream 1 anchor — taxonomy SSoT |
| Artifact - Noun Vocabulary | Work stream 1 + 6 anchor — vocabulary and jargon |
| Agent - Raven the Maven | Work streams 3, 4, 5 anchor — sole user-facing voice |
| Agent - Sam the Scribe | Work stream 2 anchor — card-drafting behavior |
| Artifact - Decision: Skill Naming Convention | Work stream 7 anchor — slash-command prefix |

### Traversal Path

From seed cards, followed these links:
- Raven → [[Standard - Agent Customer Gate (Human vs. Builder)]] (customer routing gate; enforces agent-name curtain structurally)
- Raven → [[Standard - Conversational Warmth]] (constrains one-at-a-time questioning and top-1 rule)
- Raven → [[Standard - Professional, Not Daffy]] (constrains jargon sweep prose quality)
- Raven → [[Artifact - Decision: Single Entry Point]] (entry point context for work stream 7)
- Noun Vocabulary → [[Standard - User Assumptions (Never-Violate Set)]] (assumption #3 governs jargon definition)
- Sam → [[Loop - Release Planning]] (aspirational home for blocked-card signal path)
- All agents → [[Artifact - Agent Voice Guide]] (per-agent personality for jargon sweep)
- Agent Customer Gate → [[Artifact - Decision 5: Four Agents, Not One]] (foundational separation)
- Raven → [[Standard - Progressive Disclosure Levels]] (interview cadence context)
- Raven → [[Artifact - Decision 37: Grouped Conversational Proposal Flow]] (precedent for one-at-a-time pattern)

### Scratchpad Integration

Read `docs/alexandria/updates/2026-04-10-architecture-review-scratchpad.md` in full. Key lines used:
- Line 31: Three-tier interaction model — no card
- Line 32: Raven concierge greeting — no card or implementation
- Line 33: Top-1 rule — no card or implementation
- Lines 62/67: Three vocabularies disconnected; 5 wizard areas have no card type; no explicit knowledge-area → card-type mapping
- Lines 144–158: Type/link info duplicated across 7 files; reference.md is downstream sync canonical
- Sam findings: link-patterns.md over-engineered; duplications across 5 of 7 Sam skill files

### Cards Not Selected (and Why)

| Card | Reason Not Selected |
| --- | --- |
| Agent - Conan the Librarian | Work streams in scope do not require Conan's grading procedure detail; customer gate and capability matrix provide sufficient context |
| Agent - Solomon the Sorter | Not in scope for any of the seven work streams |
| Agent - Bridget the Briefer | Self-referential; not relevant to the user-facing work streams |
| Artifact - Boundary Agent Differentiation | Superseded by Agent Customer Gate for this task's needs |
| Loop - Alignment Sweep | Sam executes approved fixes from lint findings; not the blocked-card pattern |
| System - Quality Grading Engine | Not in scope |
| Capability - Card Building | Sam card provides sufficient HOW detail for work stream 2 |

## Assembly Reasoning

The briefing is structured around the seven work streams. Primary cards were selected for work streams with the most architectural consequence (WS1 taxonomy, WS3 agent curtain, WS2 blocked flow, WS7 naming). Supporting cards cover the voice/standard constraints that govern multiple work streams simultaneously. The Gap Manifest prioritizes the three missing cards (three-tier interaction model, top-1 rule, concierge greeting) because they are prerequisite to implementing work streams 3, 4, and 5.

The anti-patterns section draws from library cards that already exist — no fabrication. The concern about work stream 7 (potential conflict with settled naming decision) is flagged based on direct evidence from the Skill Naming Convention card.
