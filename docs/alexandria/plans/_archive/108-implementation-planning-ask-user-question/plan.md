# Technical Plan: Issue 108 Planning Skill AskUserQuestion Choices

- Issue reference: `#108` — `Planning skill: use AskUserQuestion for multi-choice interactions`
- Goal: update the implementation-planning skill so finite-choice planning turns use Claude Code's multi-choice question UI (`AskUserQuestion`, or the host-equivalent choice UI) instead of relying on free-form replies
- Linked product plan: none linked from the issue; product intent comes from the issue summary and the existing implementation-planning design docs

## Scope

- Update `skills/implementation-planning/SKILL.md` so the planning conversation explicitly uses multi-choice questions for fixed-option interactions
- Cover the four interaction points called out by the issue: initial goal confirmation, outcome/tier confirmation, decision disposition selection, and ticket format selection / confirmation
- Preserve a plain-text fallback for hosts that do not expose the Claude Code choice UI
- Validate the behavior change with the repo's deterministic gates and the required planning-surface eval reruns

## Non-Goals

- Changing the implementation-planning artifact formats, ticket templates, or DAG workflow
- Reworking context gathering, outcome generation, or ticket decomposition logic beyond how choices are presented
- Adding a new CLI wrapper or repository code to implement the UI; this issue is prompt-surface behavior in the skill
- Broad README or design-doc rewrites unless implementation reveals a checked-in doc mismatch
- Creating new eval cases unless the existing planning evals fail to exercise the changed interaction points well enough

## Current Gap

- `skills/implementation-planning/SKILL.md` currently describes several finite-choice turns in prose, but it does not explicitly require the host's multi-choice question UI
- The current checked-in `implementation-planning` eval transcript shows the skill asking for ticket format as open text instead of a structured choice
- The skill already has recurring fixed-option decisions:
  - goal confirmation before Step 2
  - outcome/tier confirmation before Step 4
  - decision disposition selection in Step 4
  - ticket format selection and saved-format confirmation
- Without an explicit instruction, Claude hosts fall back to free-form chat, which makes the interaction less consistent and easier to answer invalidly

## Architectural Boundaries

- Keep the change inside the implementation-planning skill prompt; do not add repo code or host-specific scripts for this issue
- Prefer Claude Code's native choice UI when available, but phrase the instruction so non-Claude or future hosts can degrade gracefully to numbered/plain-text choices
- Keep the reusable planning skill generic across products; the choices should describe planning mechanics, not repo-specific labels or workflows
- Do not blur planning with execution: this slice changes how the planner asks for decisions, not what artifacts it writes

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Product planning skill | `skills/implementation-planning/SKILL.md` | Finite-choice user interactions explicitly use `AskUserQuestion` / host-equivalent multi-choice UI with a plain-text fallback |
| Repo technical planning | `docs/alexandria/plans/108-implementation-planning-ask-user-question/plan.md` | Records repo-specific scope, verification, eval impact, and host-compatibility constraints for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `implementation-planning` | Step 1, Step 3, Step 4, and ticket-format configuration now instruct the model to present fixed options through the multi-choice question UI instead of only prose prompts | Rerun implementation-planning eval coverage and review transcript/judge drift to ensure the conversation still reaches file-writing completion |
| `ticket-writer` | No direct prompt change, but repo eval policy treats implementation-planning prompt edits as requiring the companion ticket-writer eval rerun | Rerun `ticket-writer/all` per `EVALS.md` and inspect for unexpected baseline drift |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo lint/type/doc gate | `bun run check` | Validates the modified skill markdown and repo-wide formatting/lint/type checks |
| Full deterministic suite | `bun test` | Confirms the prompt change does not regress deterministic tests or checked-in planning fixtures |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `skills/implementation-planning/SKILL.md` | `implementation-planning/taskflow-realtime` | Rerun existing coverage because the interactive planning behavior changes at several user-decision turns | `bin/alexandria-eval run implementation-planning/all` |
| Implementation-planning companion surface | `ticket-writer/standard-format` | Rerun per repo guidance for `skills/implementation-planning/*.md` changes | `bin/alexandria-eval run ticket-writer/all` |
| New eval coverage | Existing planning coverage already exercises ticket-format choice and multi-turn planning decisions | No new case expected initially; add one only if current coverage does not meaningfully expose the new choice-UI guidance | none initially |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Overly Claude-specific wording could make the skill brittle on non-Claude hosts | Phrase the instruction as `AskUserQuestion` or the host-equivalent multi-choice UI, with an explicit plain-text fallback |
| The skill could overuse multi-choice prompts for questions that actually need open-ended answers | Limit the instruction to finite-choice turns and keep exploratory clarification questions as normal conversation |
| The outcome confirmation step could become too rigid for re-tiering or editing outcomes | Use multi-choice for the high-level disposition (`accept`, `re-tier`, `revise`) and keep the follow-up free-form only when the user chooses a revision path |
| Eval coverage may not visibly reflect UI-tool usage if the host abstracts it away | Review transcripts/results for the changed wording and create additional coverage only if the current evals fail to exercise the updated instructions meaningfully |

## Implementation Steps

1. Add this repo-specific technical plan for issue `#108`.
2. Update `skills/implementation-planning/SKILL.md` to add a general rule for finite-choice interactions: use `AskUserQuestion` or the host-equivalent multi-choice UI, with a fallback to numbered/plain-text choices when unavailable.
3. Rewrite the specific interaction guidance in Step 1, Step 3, Step 4, and the ticket-format configuration section so the expected choices are explicit and compatible with the multi-choice UI.
4. Review the prompt text for host compatibility, product-generic wording, and sensible fallback behavior when the user chooses a revision path.
5. Run `bun run check`.
6. Run `bun test`.
7. Run `bin/alexandria-eval run implementation-planning/all`.
8. Run `bin/alexandria-eval run ticket-writer/all`.
9. Review eval `results` and `compare` output, then check in any required baseline updates.
10. Update or open the PR against `main` with the plan path, implementation summary, and verification notes.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/108-implementation-planning-ask-user-question/plan.md` exists with repo-specific scope, verification, and eval guidance.
2. `skills/implementation-planning/SKILL.md` explicitly instructs the planner to use multi-choice UI for fixed-option questions, with a host-compatible fallback.
3. The changed interaction guidance covers the issue's named surfaces: goal confirmation, outcome/tier confirmation, decision disposition selection, and ticket format selection/confirmation.
4. The prompt still leaves open-ended discovery questions as normal conversation where needed.
5. `bun run check` passes.
6. `bun test` passes.
7. `implementation-planning/all` and `ticket-writer/all` evals are rerun and reviewed.
8. A PR against `main` is opened or updated with the implementation and verification details.

## Deferred Follow-Ups

1. If more Alexandria skills adopt fixed-choice turns, factor the multi-choice guidance into shared planning/interaction conventions rather than duplicating it per skill.
2. If eval transcripts prove too opaque to catch choice-UI regressions, add a planning-surface eval case or rubric criteria that specifically checks for structured finite-choice prompting.
