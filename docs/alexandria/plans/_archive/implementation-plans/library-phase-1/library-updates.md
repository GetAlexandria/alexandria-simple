# Library Updates from Phase 1: Raven-Voiced Wizard

Ask Conan to review this list and produce a transient surgery plan for Sam in the conversation, not as a checked-in file.

## Card updates

Phase 1 is a skill rewrite, not new infrastructure. The library changes are minimal —
one new decision artifact documenting the form-to-conversation shift, and one update
if a wizard-related capability card exists.

| Action | Card | What Changed | Source |
|--------|------|-------------|--------|
| Create | Artifact - Decision: Raven-Voiced Wizard | Phase 1 decision to rewrite the wizard skill from a form-based procedure to a Raven-voiced conversational experience. Key decisions: SKILL.md only (no engine or agent changes); greenfield detection and fast-lane as architectural fix; config-calibrated WHY explanations per guidance posture spectrum; expert calibration encoded inline. Phase 2 will add orchestration and scoreboard. | release.md Decisions table |
| Update | Capability - Raven (if it exists) | Raven's wizard-mode behavior is now documented in skills/initialize/SKILL.md — specifically the first-five-minutes sequence, greenfield fast-lane, inference-before-asking, and expert calibration guidance. If the card describes Raven's capabilities, add: wizard-mode conversational configuration as a primary use case. | FEAT-001 through FEAT-005 |
