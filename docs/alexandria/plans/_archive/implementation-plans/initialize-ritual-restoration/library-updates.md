## Library Updates from Initialize Ritual Restoration

Ask Conan to review this list and produce a transient surgery plan for Sam in the conversation, not as a checked-in file.

| Action | Card | What Changed | Source |
|--------|------|-------------|--------|
| Update | Agent - Raven the Maven (HOW, WHEN) | Job Dispatch split into first-session and returning-session; Task-orchestration execution aid documented; note depth-restoration work and cleanup | Step 4 |
| Create | Artifact - Decision: Host-Specific Primitives as Execution Aid | New ADR governing when Alexandria skills may depend on host primitives (Claude Code Tasks) with fallback contract | FEAT-066 |
| Update | Artifact - Decision: Single Entry Point (HOW) | Clarify that Single Entry Point governs command surface, not internal job file count; the router dispatches to multiple jobs internally | Step 4 |
| Update | Loop - Eval-Driven Skill Improvement (WHEN) | Reflect that initialize eval coverage now targets composed first-session and returning-session paths, not isolated components | FEAT-066 |
| Update | System - Wizard Configuration Engine (HOW) | Note the engine is now invoked from `job-first-session.md` (explicit beat) rather than `job-initialize.md` | FEAT-062 |
| Retire | Implicit references in Raven skills/docs to assessment.md as a persisted artifact | Assessment.md killed as persisted artifact; any card reference needs a sweep | FEAT-065 |
| Retire | Any card reference to `session_notes` field | Field struck from config schema entirely | FEAT-065 |

No new cards besides the ADR. All other updates are edits to existing cards.
