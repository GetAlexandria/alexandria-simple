# Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#376`
- Goal: Remove `CONVERSATION_COMPLETE.sentinel` from Solomon's production behavior and let Solomon evals detect completion from the transcript status marker instead.
- Linked product plan: None linked in trusted issue context. Repository-generated issue summary and the checked-in architecture review note define the intended slice.

## Scope

- Remove Solomon agent and job instructions that tell the model to write `CONVERSATION_COMPLETE.sentinel`.
- Preserve Solomon's machine-readable completion contract by requiring the final response line to be a status marker from the shared play protocol.
- Add an opt-in eval-case completion marker setting so Solomon evals can stop on `**Status: DONE**` in the transcript instead of a filesystem sentinel.
- Update Solomon eval case configs and checked-in eval baselines to the new completion signal.
- Add `CONVERSATION_COMPLETE.sentinel` to `.gitignore` and delete checked-in sentinel artifacts that remain from prior eval runs.

## Non-Goals

- Reworking Solomon's wider triage workflow, classification model, or file outputs beyond the completion contract.
- Changing completion detection for unrelated eval-backed skills unless they opt into the new marker-based mechanism.
- Retiring the generic concept of output rules or machine-readable contracts elsewhere in the repo.

## Current Gap

- `agents/solomon.md` and `skills/solomon/job-signal-triage.md` instruct Solomon to write a sentinel file in the project root after triage completes.
- Solomon eval cases use `expected_files: ["CONVERSATION_COMPLETE.sentinel"]`, so the eval harness waits for that file before ending the conversation.
- Checked-in Solomon eval output still includes the sentinel artifact, which normalizes the production pollution the issue wants removed.
- `.gitignore` does not currently protect against accidental check-in of new sentinel files.

## Architectural Boundaries

- Agent and skill files should define Solomon's user-facing behavior and completion contract, but they should not include eval-only filesystem pollution.
- The eval harness may support transcript-based completion detection for cases that need it, but the change should stay opt-in at the case-config level to avoid silently changing other eval surfaces.
- Eval cases and baselines must move with the behavior change so the repo's checked-in quality gates reflect the real production contract.
- This slice does not change Solomon's queue/source-writing responsibilities or broader routing semantics.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Solomon agent | `agents/solomon.md` | Completion instructions stop telling Solomon to write a sentinel and instead end on the status marker contract |
| Solomon skill | `skills/solomon/job-signal-triage.md` | Job exit instructions stop using sentinel output as completion signaling |
| Eval harness | `src/tools/eval-harness.ts`, `tests/eval-runner.test.ts`, `EVALS.md` | Harness can optionally detect conversation completion from a transcript marker instead of waiting for a file |
| Solomon eval cases | `tests/eval-cases/solomon/*/config.json`, `tests/eval-cases/solomon/structural-checks.ts` | Solomon evals stop depending on sentinel creation and assert the formal status marker path |
| Checked-in eval results | `tests/evals/solomon/*`, sentinel artifacts under `tests/evals/**/output/` | Baselines reflect the new completion contract and remove stale sentinel files |
| Repo hygiene | `.gitignore` | Sentinel file is ignored as a safety net if one appears locally |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `agents/solomon.md` | Completion prose no longer mentions writing `CONVERSATION_COMPLETE.sentinel`; Solomon must finish with the shared status marker as the terminal line | Rerun Solomon evals and update any checked-in transcripts/baselines that still show the sentinel |
| `skills/solomon/job-signal-triage.md` | Exit section removes sentinel write instructions and aligns completion with transcript status markers | Update Solomon eval configs, structural expectations, and any docs that describe harness completion behavior |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Eval harness | `bun test tests/eval-runner.test.ts` | Covers new transcript-marker completion detection behavior |
| Full repo deterministic gate | `bun run check` | Required repo quality gate across prompt/docs/TS changes |
| Full repo deterministic gate | `bun test` | Required repo quality gate and catches cross-suite fallout |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Solomon agent + skill behavior | Yes, `solomon/*` | Rerun existing Solomon eval suite because the production completion contract changes | `bin/alexandria-eval run solomon/all` |
| Eval harness transcript completion | Deterministic coverage only | Extend deterministic runner tests; no new product eval case required if marker support remains Solomon-only via config | `bun test tests/eval-runner.test.ts` |
| Other skills | Existing evals exist, but behavior should not change | No rerun if the harness change is opt-in and no other case config uses it | None |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The harness could stop too early if transcript marker matching is too loose | Use an explicit configurable marker string and match against the latest skill response text rather than any incidental transcript prose |
| Solomon prompts could lose a machine-readable completion contract when the sentinel is removed | Keep the shared status-marker requirement explicit in Solomon agent and skill text |
| Checked-in baselines could retain stale sentinel artifacts and confuse future reviewers | Delete checked-in sentinel files in the same slice and rerun Solomon evals so the transcript/output set is internally consistent |
| A global harness change could cause unrelated eval flakiness | Keep transcript-marker completion opt-in in `config.json` instead of changing default completion semantics |

## Implementation Steps

1. Add the `#376` repo technical plan under `docs/alexandria/plans/`.
2. Update Solomon agent and skill instructions to remove sentinel-writing requirements and make the status marker the completion boundary.
3. Add opt-in transcript-marker completion support to the eval harness and cover it in `tests/eval-runner.test.ts`.
4. Switch Solomon eval case configs from `expected_files` to the new transcript marker setting and tighten structural expectations if needed.
5. Add `CONVERSATION_COMPLETE.sentinel` to `.gitignore` and delete checked-in sentinel artifacts.
6. Run deterministic verification, then rerun targeted Solomon evals and inspect results/baselines.
7. Perform a local diff review, then prepare the branch/PR state with plan path, checks, and eval summary.

## Acceptance / Exit Criteria

1. No Solomon production prompt file mentions `CONVERSATION_COMPLETE.sentinel`.
2. Solomon eval cases detect completion from `**Status: DONE**` in the transcript rather than a sentinel file.
3. The eval harness supports the Solomon completion path without changing unrelated cases by default.
4. `.gitignore` includes `CONVERSATION_COMPLETE.sentinel`.
5. Checked-in sentinel artifacts for this behavior are removed.
6. Relevant deterministic checks pass locally.
7. Targeted Solomon evals hold or improve versus baseline and the resulting baselines are checked in.

## Deferred Follow-Ups

1. Audit other checked-in eval transcripts that mention the sentinel indirectly if they become product-significant later.
2. Consider standardizing transcript-marker completion across more eval-backed conversational agents only if there is a separate issue to do so intentionally.
