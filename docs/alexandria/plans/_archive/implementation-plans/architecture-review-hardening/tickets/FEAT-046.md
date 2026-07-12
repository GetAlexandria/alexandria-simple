---
id: FEAT-046
title: "Retire Nit agent — delete agent file and skill directory"
outcome: O-4
tier: should
enabler: false
blocked-by: [FEAT-043]
blocks: [FEAT-047]
cards: [Governance - Agent Capability Matrix, Artifact - Decision 5: Four Agents, Not One]
---

## Motivation

Once FEAT-043 replaces all Nit dispatch references with CLI calls, the Nit agent file and skill directory are dead code. Keeping them adds confusion — someone might think Nit is still an active agent when all his work is now done by `alxndr lint`.

## Description

1. Delete `agents/nit.md`
2. Delete or archive `skills/nit/` directory (sweeps.md, output-format.md)
3. Update `Governance - Agent Capability Matrix` library card (remove Nit column)
4. Update `Artifact - Decision 5: Four Agents, Not One` (historical note: now 5 agents, Nit absorbed into CLI)
5. Update plugin description and any README mentions of "6 agents" → "5 agents"
6. Run `alxndr lint` to verify no broken references

## Context

Nit's sweep definitions in `skills/nit/sweeps.md` are already implemented in `src/tools/lint-core.ts`. The skill files served as the specification for what to implement. Once the code is authoritative, the spec files can be archived (kept in git history) rather than maintained.

## Acceptance Criteria

- [ ] `agents/nit.md` does not exist
- [ ] `skills/nit/` directory does not exist (or is archived)
- [ ] No agent or skill file references Nit as a living agent
- [ ] Library cards updated to reflect 5 agents
- [ ] `alxndr lint` passes clean after deletion
- [ ] Plugin description updated

## Implementation Notes

Do this AFTER FEAT-043 is merged and verified. Check git blame to confirm no other systems depend on Nit's agent file being present. The Claude Code plugin registration will auto-discover agent files, so deleting `agents/nit.md` is sufficient to de-register.
