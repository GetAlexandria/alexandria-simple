# Operator Playbook

This file is the repo-owned operator policy for Alexandria.
Use it with `WORKFLOW.md`, `CLAUDE.md`, `README.md`, and the Symphony operator
runbook from the engine checkout.

Alexandria is an external self-hosted repository running on the Symphony
engine. Generic operator mechanics live in Symphony. This file defines the
Alexandria-specific rules for landing, refresh, release boundaries, eval gates,
and escalation.

## Normal Operator Duties

- Treat completed-run report review, `/land` on ready PRs, and stale/degraded
  runtime recovery through supported factory-control commands as normal
  operator work.
- Let the factory own ordinary dispatch, retries, PR follow-through, and queue
  movement while it is healthy.
- Judge work against Alexandria's checked-in repository contract, especially
  `CLAUDE.md`, `README.md`, `docs/design/`, `docs/alexandria/plans/`, and
  `contributor-skills/issue-execution/SKILL.md`.

## Plan Policy

- Plans are required for substantial work, following `CLAUDE.md` and the
  issue-execution contributor skill.
- Alexandria does not use the `symphony-ts` formal `plan-ready` / `Plan review:
  approved` handoff protocol by default.
- Do not block ordinary implementation solely because there is no explicit
  operator plan-review marker unless the issue or checked-in repo docs
  explicitly require that extra handoff.

## Landing Policy

- Post `/land` only when the PR is review-clean on the current head, required
  CI is green, and no dependency or release gate is blocking the work.
- Treat Devin as a required review gate for ordinary PRs in this repository:
  wait for Devin review to complete on the current head and ensure actionable
  Devin comments are addressed before landing.
- When a change affects product-facing agents or skills with eval coverage,
  treat the required targeted eval reruns as a landing gate in addition to the
  deterministic test suite.
- If a user explicitly reserves landing for themselves, leave the PR in a
  clean, mergeable state instead of posting `/land`.

## Dependency Policy

- Respect GitHub blocked relationships for dispatch and landing decisions.
- Do not manually push blocked work through the queue just because capacity is
  available.
- If dependency metadata on GitHub is wrong or incomplete, fix the metadata or
  record a tracked follow-up instead of ignoring the blocker.

## Release And Versioning Policy

- Treat release/version preparation as explicit separate work, not ordinary
  feature/fix follow-through.
- Do not treat a feature PR as ready to land if it quietly changes `VERSION`,
  `CHANGELOG.md`, `package.json`, or `.claude-plugin/plugin.json` without the
  issue explicitly being about release preparation.
- Release-prep PRs are allowed to change those files, but they still require
  green CI and completed Devin review before landing.

## Verification Policy

- Honor Alexandria's build standard from `CLAUDE.md`: `bun run check`, `bun
  test`, plus any narrower or broader directly relevant checks for the touched
  subsystem.
- Prefer the narrowest real verification that covers the changed surface, but
  do not skip targeted evals when product-facing agent or skill behavior
  changed.
- If CI is stuck in a non-terminal state or required review infrastructure is
  degraded, treat that as blocked infrastructure rather than silent success.

## Post-Merge Refresh Policy

- Because Alexandria is an external repository rather than the Symphony engine
  repo itself, do not restart the detached factory after every merge by
  default.
- After a merge, refresh the selected instance root checkout, refresh the
  detached runtime checkout under `.tmp/factory-main`, and restart the detached
  factory only when runtime freshness says the runtime checkout or repo-owned
  contract files are stale.
- Repo-owned contract drift includes changes to files such as `WORKFLOW.md`,
  `OPERATOR.md`, or other checked-in instructions that the operator/factory
  must reread to behave correctly.

## Intervention And Escalation Policy

- Normal intervention includes `/land`, completed-run report review, and
  restarting a stale or degraded runtime through supported commands.
- Do not take over healthy issue branches manually just because a fix seems
  obvious.
- Pause the line and escalate when continuing automation would be unsafe or
  misleading, including:
  - repeated CI non-progress,
  - Devin or GitHub review infrastructure that is degraded or missing,
  - eval infrastructure failures on work that requires eval gates,
  - ambiguous release/versioning scope,
  - or broken dependency metadata that changes dispatch or landing meaning.
