# Issue 379 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#379`
- Goal: delete `skills/shared/play-protocol.md`, inline the still-useful completion and model-dispatch guidance into the affected agent definitions, and remove the broken shared-preamble runtime instructions that currently point at nonexistent or non-runtime docs
- Linked product plan: none linked from the sanitized issue context

## Scope

- Add a repo-specific plan for this issue.
- Update the five live agent definitions that currently reference `skills/shared/play-protocol.md`.
- Remove shared-preamble instructions from live Raven and Solomon job files that still tell agents to load the deleted file at runtime.
- Delete `skills/shared/play-protocol.md`.
- Update deterministic test coverage that still routes or dumps the deleted shared file.

## Non-Goals

- Reworking Alexandria’s broader orchestration architecture beyond this dead-file retirement.
- Updating historical design artifacts, release snapshots, or older planning docs just because they mention `play-protocol.md`.
- Changing job responsibilities, output contracts, or routing policy beyond moving the surviving guidance into the agent definitions.
- Adding release notes or version bumps.

## Current Gap

- All five active agent definitions still point to a shared `play-protocol.md` file for completion statuses and a shared preamble.
- That shared file tells agents to read `docs/alexandria/README.md`, `docs/alexandria/feedback-queue.jsonl`, and `docs/design/playbook.md` as if they were active runtime dependencies, but those pointers are missing or not actually used by the live jobs.
- Raven and Solomon job files still instruct runtime loads of the broken shared preamble.
- `src/tools/route.test.ts` still treats `skills/shared/play-protocol.md` as a real routed skill fixture, so the current deterministic suite would fail if the file were simply deleted.

## Architectural Boundaries

- Keep this slice limited to prompt-surface cleanup for live agent/job files plus the minimum deterministic test adjustment required by the deleted file.
- Preserve Claude Code plugin behavior by keeping each agent’s output contract and job dispatch intact while moving only the useful shared conventions inline.
- Remove the broken preamble entirely instead of replacing it with a new pseudo-runtime protocol that still depends on dead files.
- Do not broaden into historical-doc cleanup unless a checked-in deterministic test or active runtime path requires it.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo planning docs | `docs/alexandria/plans/379-delete-play-protocol/plan.md` | Records issue scope, verification, eval impact, and boundaries before implementation |
| Agent definitions | `agents/conan.md`, `agents/sam.md`, `agents/bridget.md`, `agents/raven.md`, `agents/solomon.md` | Completion-status discipline and explicit model-dispatch guidance move from the deleted shared file into each live agent definition |
| Live job procedures | `skills/raven/job-product-conversation.md`, `skills/raven/job-initialize.md`, `skills/solomon/job-signal-triage.md` | Broken “run the shared preamble” instructions are removed so runtime jobs no longer point at dead or nonexistent references |
| Shared skills | `skills/shared/play-protocol.md` | Dead shared protocol file is removed from the plugin |
| Deterministic routing tests | `src/tools/route.test.ts` | Routing assertions stop depending on the deleted shared file and continue covering low-requirement routing with live or synthetic fixtures |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Conan agent | Completion statuses and explicit model-dispatch note become local conventions instead of a shared-file dependency | Keep reference-skill table aligned and preserve downstream-sync instruction in Conan’s own workflow text |
| Sam agent | Completion footer/status guidance becomes local agent text instead of referencing the shared protocol | Keep output footer contract intact and remove dead reference-table entry |
| Bridget agent | Completion-status and model-dispatch guidance become local agent text; broken shared-preamble startup note is removed | Keep briefing output contract and provenance/feedback file guidance unchanged |
| Raven agent and jobs | Completion-status/model-dispatch guidance move into the agent file; job files stop telling Raven to load the broken shared preamble | Rerun Raven evals because product-conversation/init runtime wording changes |
| Solomon agent and job | Completion-status/model-dispatch guidance move into the agent file; the job file stops telling Solomon to load the broken shared preamble | Rerun Solomon evals because signal-triage runtime wording changes |
| Route tests | Route/dump coverage uses live routed files or synthetic fixtures rather than the deleted shared file | Keep low-capability routing coverage after deletion |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Route regression | `bun test src/tools/route.test.ts` | Fast check that the removed shared file no longer breaks routing coverage |
| Repo quality gate | `bun run check` | Required lint, markdown, shell, formatting, and typecheck gate for touched Markdown/tests |
| Regression suite | `bun test` | Required repo-wide deterministic suite after cross-agent prompt/test edits |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Conan agent guidance | `conan/all` | Rerun existing eval suite because live agent instructions changed | `bin/alexandria-eval run conan/all` |
| Sam agent guidance | `sam/all` | Rerun existing eval suite because live agent instructions changed | `bin/alexandria-eval run sam/all` |
| Bridget agent guidance | `bridget/all` | Rerun existing eval suite because live agent instructions changed | `bin/alexandria-eval run bridget/all` |
| Raven agent + job guidance | `raven/all` | Rerun existing eval suite because live agent and job wording changed | `bin/alexandria-eval run raven/all` |
| Solomon agent + job guidance | `solomon/all` | Rerun existing eval suite because live agent and job wording changed | `bin/alexandria-eval run solomon/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Inline duplication could drift across agent files | Keep the new local conventions short and structurally similar so review can compare them easily in one slice |
| Deleting the shared file could leave hidden runtime references | Grep the live agent/job/test surfaces before deletion and rerun deterministic tests after the patch |
| Removing the shared preamble could accidentally strip needed operational guidance | Preserve only the useful, still-true conventions locally and leave each job’s actual workflow steps intact |
| Routing coverage could lose its low-capability fixture when the shared file disappears | Replace deleted-file assertions with live low-capability fixtures or synthetic frontmatter tests in `route.test.ts` |

## Implementation Steps

1. Add the issue plan under `docs/alexandria/plans/379-delete-play-protocol/`.
2. Inline completion-status and model-dispatch guidance into the five affected agent definitions and remove their `Play Protocol` reference-table entries.
3. Remove broken shared-preamble instructions from the live Raven and Solomon job procedures.
4. Delete `skills/shared/play-protocol.md`.
5. Update `src/tools/route.test.ts` so it no longer depends on the removed file while preserving route/dump coverage.
6. Run deterministic checks, review the diff for behavior drift, then rerun the impacted agent eval suites.

## Acceptance / Exit Criteria

1. `skills/shared/play-protocol.md` is removed from the repository.
2. The five active agent files that previously referenced it now carry their own completion-status and model-dispatch guidance.
3. No live Raven or Solomon job file still instructs agents to run the deleted shared preamble.
4. `src/tools/route.test.ts`, `bun run check`, and `bun test` pass locally after the deletion.
5. `conan/all`, `sam/all`, `bridget/all`, `raven/all`, and `solomon/all` evals are rerun and do not regress.

## Deferred Follow-Ups

1. Design a replacement orchestration model in a dedicated issue instead of recreating a weaker shared preamble here.
2. Clean up historical references to the removed file in archival docs only if a later issue decides that grep-cleanliness matters for those artifacts too.
