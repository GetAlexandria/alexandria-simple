# Feedback Queue — Field Hardening

**Source:** Bridget the Briefer — context assembly for field-hardening
**Date:** 2026-04-23

## Missing Cards (Demand Signal)

| Priority | Gap | Recommended Type | Work Stream | Note |
| --- | --- | --- | --- | --- |
| P0 | Three-tier interaction model (Tier 1: talk, Tier 2: named actions, Tier 3: slash commands) | Artifact (design decision) | WS3, WS4, WS5 | Load-bearing for three work streams. Scratchpad line 31 explicitly flags absence. |
| P0 | Top-1 rule (surface single most important next move) | Standard (testable behavioral constraint on Raven) | WS4 | No card or implementation. Scratchpad line 33. |
| P0 | Knowledge-area-to-card-type mapping (explicit table) | Artifact | WS1 | Scratchpad line 67: "Major confusion source." Five wizard areas have no card type; three card types have no wizard area. |
| P1 | Raven concierge greeting procedure (state read + top-1 nudge + open invitation) | Capability or HOW addition to Raven card | WS4, WS5 | May fold into top-1 rule card. Scratchpad line 32. |
| P1 | Agent-name curtain rule (explicit constraint prohibiting internal agent names in user output) | Standard or clause addition to Agent Customer Gate | WS3 | Customer gate implies it; nothing names it explicitly. |
| P1 | Blocked-card signal path design (gap manifest → Sam trigger) | Artifact (decision record of the wiring design) | WS2 | Pipeline confirmed disconnected per scratchpad. Design decision needs to be made and recorded. |
| P2 | Section-by-section elicitation procedure for Raven interviews | Capability | WS5 | Decision 37 covers scanner; Raven needs its own card or HOW section addition. |

## Weak Spots (Existing Cards with Gaps)

| Card | Weakness | Recommended Action |
| --- | --- | --- |
| [[Agent - Raven the Maven]] | HOW section has no section-by-section interview procedure; no mention of top-1 rule or concierge greeting | After P0/P1 cards above are built, add HOW sub-section for one-at-a-time questioning cadence |
| [[Standard - Agent Customer Gate (Human vs. Builder)]] | Does not explicitly state that internal agent names (Sam, Conan, Solomon, Bridget) must not appear in user-facing output — it implies routing separation but not vocabulary suppression | Add one sentence or link to the new agent-name curtain Standard |
| [[Loop - Release Planning]] | Says "Sam builds cards to fill gaps identified in Bridget's gap manifests" but this is aspiration; the pipeline is disconnected and no wiring exists | After blocked-card signal path is designed and implemented, update WHEN/HOW sections to reflect actual wiring |

## Discovered Relationships Not Yet in Graph

| Source | Relationship | Target | Note |
| --- | --- | --- | --- |
| Artifact - Type Taxonomy | should-be-canonical-for | Capability - Linting (KNOWN_TYPES list) | Scratchpad: type/link info duplicated in 7 places; reference.md is downstream sync canonical but the others should point to it |
| Artifact - Type Taxonomy | should-be-canonical-for | Agent - Sam the Scribe (all 5 skill files with type info) | Same duplication issue — Sam's files should reference type taxonomy, not restate it |
| Standard - Agent Customer Gate (Human vs. Builder) | structurally-enforces | Agent-name curtain (future Standard) | The gate's routing logic is the mechanism; the curtain is the vocabulary consequence |
| Artifact - Decision 37: Grouped Conversational Proposal Flow | precedents | One-at-a-time questioning in Raven interviews | Same UX pattern; new Raven Capability card should link back to Decision 37 as prior art |
