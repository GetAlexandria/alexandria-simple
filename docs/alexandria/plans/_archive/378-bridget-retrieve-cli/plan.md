# Technical Plan

## Header

- Issue reference: `#378` — `[FEAT-053] Wire Bridget to call alxndr retrieve CLI`
- Goal: Make Bridget's context-briefing workflow prefer the shipped retrieve CLI for card selection so prompt work focuses on classification, narrative assembly, and gap reporting instead of manual graph traversal.
- Linked product plan: No checked-in product-level `plan.md` link was provided in the issue handoff. Implementation is based on the sanitized issue summary plus checked-in repo behavior.

## Scope

- Update Bridget's agent contract to include shell execution support and explicitly direct retrieval through the shipped retrieve CLI.
- Update the context-briefing protocol so the assembly path is CLI-first after seed selection, with manual traversal retained only as a fallback when the CLI is unavailable.
- Keep Bridget's provenance and feedback logging contract internally consistent across the agent, protocol, and schema references.
- Keep Bridget eval harness configuration aligned with the new tool requirement.
- Restore the eval-backed retrieval behavior that still surfaces governing discoverability / progressive-disclosure rationale when it materially constrains the task.
- Record the repo-specific implementation and verification boundary for this issue.

## Non-Goals

- Adding a new `retrieve` subcommand to `bin/alxndr`.
- Changing retrieval algorithms in `src/tools/retrieve.ts`.
- Rewriting the broader traversal guide or retrieval profiles beyond what is needed to keep Bridget's assembly contract accurate.
- Migrating unrelated queue/logging systems such as Solomon's `signal-queue.jsonl`.
- Redesigning Bridget's briefing output structure or lint rules beyond what is required to keep the prompt and eval contract aligned.

## Current Gap

- `agents/bridget.md` still advertises only `Glob`, `Grep`, `Read`, and `Write`, even though the preferred retrieval path now depends on a CLI call.
- `skills/context-briefing/protocol.md` still frames Bridget's assembly loop as manual `Grep`/`Glob`/`Read` traversal rather than CLI-driven selection.
- Bridget's prompt/protocol/schema docs disagree on whether provenance and feedback are written as `.md` artifacts or `.jsonl` logs, which leaves the PR in an internally inconsistent state.
- Bridget's eval case currently permits only `Glob,Grep,Read,Write`, which would block the intended CLI path even if the prompt is updated.
- The repo currently ships retrieval as `bin/alexandria-retrieve` rather than `alxndr retrieve`; this slice needs to be explicit about using the real executable instead of documenting a nonexistent command surface.
- The current Bridget eval baseline dropped `[[Principle - Progressive Complexity]]` from the retrieved card set for the keyboard-shortcuts scenario, even though the feature's discoverability/disclosure constraints still make that principle relevant.

## Architectural Boundaries

- Keep the behavior change in the Bridget agent/skill layer and the Bridget eval harness config.
- Treat the retrieve CLI as an existing deterministic primitive that Bridget invokes; do not duplicate retrieval logic inside prompt text.
- Preserve manual graph-search guidance as a fallback and as shared background knowledge for downstream builder follow-up searches.
- Do not broaden this issue into CLI-router migration; the prompt should reference the shipped command explicitly.
- Limit logging-contract changes to Bridget-owned files (`agents/bridget.md`, `skills/context-briefing/*`, Bridget eval artifacts) rather than trying to normalize every `.jsonl` reference across the whole repo in this PR.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Bridget agent contract | `agents/bridget.md` | Bridget gains Bash access and is instructed to use the retrieve CLI for card selection instead of recreating traversal manually |
| Context briefing protocol | `skills/context-briefing/protocol.md` | Assembly/handoff documentation becomes CLI-first for retrieval while preserving manual fallback behavior and keeping `.md` logging guidance consistent |
| Bridget logging schemas | `skills/context-briefing/provenance-schema.md`, `skills/context-briefing/feedback-queue-schema.md` | Bridget's schema references align with the checked-in `.md` artifact contract used by the agent and eval outputs |
| Bridget eval harness config | `tests/eval-cases/bridget/assembly/config.json` | Eval runs permit the Bash tool required for the CLI-backed retrieval path |
| Bridget eval baselines | `tests/evals/bridget/assembly/*` | Baselines reflect the final prompt behavior, including retained discoverability rationale where relevant |
| Repo planning docs | `docs/alexandria/plans/378-bridget-retrieve-cli/plan.md` | Captures repo-specific scope, risks, and verification |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Bridget agent behavior | Prompt instructs Bridget to invoke `bin/alexandria-retrieve` after seed discovery and before briefing assembly; manual traversal becomes fallback behavior | Rerun Bridget evals and keep the protocol wording aligned with the agent prompt |
| Context briefing protocol | Handoff flow and search guidance describe CLI-backed card selection/budgeting instead of manual card expansion as the default | Ensure docs still preserve manual search guidance for follow-up uncertainty handling and `.md` artifact naming |
| Bridget logging artifacts | Provenance and feedback guidance stays markdown-based for Bridget's per-assembly outputs instead of contradicting the agent contract with `.jsonl` references | Keep schema docs and eval artifacts consistent with the prompt contract |
| Bridget retrieval judgment | Bridget still pulls in governing WHY/discoverability cards when the task has UI exposure, disclosure, or power-user tradeoff implications | Verify with the existing keyboard-shortcuts eval and update baselines only if scores hold or improve |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo formatting/lint/typecheck gate | `bun run check` | Required repo baseline for markdown/json prompt updates |
| Deterministic integration suite | `bun test` | Required repo baseline; catches accidental regressions in existing executable/test surfaces |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Bridget agent + context-briefing protocol | `tests/eval-cases/bridget/*`, checked-in baselines under `tests/evals/bridget/*` | Rerun existing Bridget coverage because prompt behavior and allowed tools change | `bin/alexandria-eval run bridget/all` |
| Bridget eval harness config | Covered indirectly by the Bridget eval case itself | Update config in the same slice; no separate new eval case expected | Existing `bridget/all` run should exercise the new tool allowance |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Prompt text could reference `alxndr retrieve`, which the current repo does not ship | Use the concrete shipped command `bin/alexandria-retrieve` and note router migration as out of scope |
| Bridget could over-trust CLI output and stop checking mandatory categories or gaps | Keep prompt wording explicit that Bridget still verifies coverage, assembles narrative context, and logs missing categories/gaps |
| Narrow protocol edits could leave schema references contradicting Bridget's `.md` log contract | Update the Bridget-owned schema docs in the same slice and keep broader repo normalization out of scope |
| Bridget evals could fail immediately because Bash is not allowed in the case config | Update `tests/eval-cases/bridget/assembly/config.json` in the same slice before rerunning evals |
| Doc-only changes could drift from the actual retrieve CLI flags | Reuse the real flag names already implemented in `src/tools/retrieve.ts` when writing command examples |
| CLI-first wording could accidentally narrow Bridget's card selection and drop relevant rationale cards | Add explicit wording that Bridget must still follow governing WHY/disclosure constraints surfaced by the task and verify the result via the existing eval case |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/378-bridget-retrieve-cli/`.
2. Update `agents/bridget.md` to add `Bash` to the tool list and make CLI-backed retrieval the default assembly path.
3. Update `skills/context-briefing/protocol.md` so the assembly flow, search techniques, and handoff narrative reflect CLI-first retrieval with manual fallback and explicit markdown logging artifacts.
4. Update Bridget's provenance and feedback schema docs so they match the prompt contract instead of pointing back to `.jsonl`.
5. Update Bridget eval config so the case allows the Bash tool needed by the new prompt path.
6. Rerun Bridget evals, inspect the outputs/score deltas, and ensure the final baseline still captures relevant governing rationale such as progressive disclosure when the task demands it.
7. Run the repo deterministic checks and review the diff for prompt/docs drift.

## Acceptance / Exit Criteria

1. Bridget's agent file explicitly allows Bash and instructs use of the shipped retrieve CLI for card selection.
2. The context-briefing protocol no longer describes manual graph traversal as Bridget's default retrieval path.
3. Bridget-owned schema references no longer contradict the `.md` provenance and feedback artifact names enforced by the agent contract.
4. Bridget's eval configuration allows the tooling needed for the CLI-backed prompt behavior.
5. `bun run check`, `bun test`, and `bin/alexandria-eval run bridget/all` complete without unresolved regressions.
6. Any updated Bridget eval baselines are reviewed and checked in with the change, including preservation of materially relevant rationale cards.

## Deferred Follow-Ups

1. Decide whether retrieval should be migrated into the unified `alxndr` router as a future CLI-surface cleanup slice.
2. Consider updating `skills/context-briefing/traversal.md` if Bridget should stop presenting native-tool traversal as the primary path for assembly rather than as background/fallback guidance.
3. Normalize broader repo references to Bridget's provenance/feedback file formats only as part of a deliberate cross-agent data-modeling slice rather than piggybacking that cleanup onto this issue.
