# Library Updates from Field Hardening

Ask Conan to review this list and produce a transient surgery plan for Sam in the conversation, not as a checked-in file.

| Action | Card                                                            | What Changed                                                                                                  | Source                                       |
|--------|-----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|----------------------------------------------|
| Create | `Standard - Three-Tier Interaction Model`                       | New card: Tier 1 just-talk, Tier 2 named actions, Tier 3 slash commands. Anchors the agent-curtain work.      | FEAT-080; scratchpad line 31                 |
| Create | `Standard - Top-1 Surfacing Rule`                               | New card: surface the single strongest next move; hold the rest. Discriminator for top-1 vs bounded-choice.   | FEAT-080; scratchpad line 33                 |
| Create | `Standard - Raven Concierge Greeting`                           | New card: state read + top-1 nudge + open invitation; room-open discipline for returning and first sessions. | FEAT-080; scratchpad line 32                 |
| Create | `Standard - Agent Name Curtain`                                 | New card: agent names never appear in default user-facing output; live in logs and provenance only.           | FEAT-080; O-3                                |
| Create | `Artifact - Decision - Plugin Namespace Rename`                 | Decision D-1: plugin manifest `name` → `ax`; slash commands → `/ax:<skill>`. Breaking change with migration.  | FEAT-088/89/90/91; D-1                       |
| Create | `Artifact - Decision - KNOWN_TYPES as Canonical Taxonomy Source` | Decision D-3: typed `KNOWN_TYPES` in graph.ts is the canonical source; matchers, linter, engine derive from it. | FEAT-076; D-3                              |
| Create | `Artifact - Decision - Sam Draft-First Flow`                    | Decision D-4: Sam drafts every card with available info, then Raven surfaces unblock questions against the draft. | FEAT-081; D-4                           |
| Update | `Agent - Sam the Scribe` (WHEN)                                 | Reflect the draft-first behavior change; remove prior "gather source before drafting" framing where applicable. | FEAT-081                                    |
| Update | `Agent - Raven the Maven` (WHEN)                                | Remove handoff-block references; reference the four new Standard cards (three-tier, top-1, concierge, curtain). | FEAT-082, FEAT-083, FEAT-084, FEAT-085, FEAT-086 |
| Create | `Standard - Taxonomy Violation Response` | New card: how each tool (parser, linter, scoreboard, health, agents) must react to unknown card types or stray folders. One contract, five implementations. | FEAT-076, FEAT-095; D-7 |
| Update | `Artifact - Type Taxonomy` | Add enforcement-contract section referencing the new Standard; document that KNOWN_TYPES in typed code is canonical and drift is a health-check finding. | FEAT-076, FEAT-095 |
| Create | `Artifact - Decision - Unknown Type Severity` | Decision D-7: unknown type stays linter warning; `--strict-taxonomy` flag promotes to fail for CI. | FEAT-095; D-7 |
