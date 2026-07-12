# Technical Plan: Issue 407 Raven Dispatch Split

- Issue reference: `#407` — `[FEAT-061] Split raven.md Job Dispatch into first-session and returning-session jobs`
- Goal: split Raven's `/library` job-dispatch surface into explicit first-session and returning-session jobs, add stub procedure files for each path, and remove live references to the old monolithic initialize job without drifting into the later procedure-building tickets
- Linked product plan: `docs/alexandria/implementation-plans/initialize-ritual-restoration/tickets/FEAT-061.md`, `docs/alexandria/implementation-plans/initialize-ritual-restoration/CONTEXT_BRIEFING.md`

## Scope

- Add a repo technical plan for issue `#407`
- Update `agents/raven.md` so Job Dispatch replaces the single initialize row with two rows:
  first-session when `alexandria-config.json` is absent, returning-session when it is present
- Add stub job files at `skills/raven/job-first-session.md` and
  `skills/raven/job-returning-session.md`
- Update `skills/library/SKILL.md` so the `/library` entry point points to the new split
  dispatch surface instead of the deleted monolithic job
- Delete `skills/raven/job-initialize.md` in this slice and make the stubs fail honestly
  with `BLOCKED` until FEAT-062 and FEAT-064 land

## Non-Goals

- Writing the real first-session ritual flow from FEAT-062
- Writing the real returning-session room-open flow from FEAT-064
- Reworking Raven product-conversation behavior
- Retrofitting historical plan documents that intentionally preserve older initialize-job
  references as part of the design record
- Restoring `/library` to a successful end-to-end initialize flow in this ticket; this
  slice is an internal dispatch split with explicit temporary blocking behavior

## Linked Product-Plan Summary

- FEAT-061 is the first structural move in `initialize-ritual-restoration`: separate the
  combined initialize job into first-session and returning-session paths so each follow-up
  ticket can build against a narrower scope.
- The user-facing command surface stays `/library`; the split is internal job dispatch,
  not a new command or router abstraction.
- The upstream ticket explicitly allows deleting `job-initialize.md` in this slice as long
  as the replacement stubs exist and exit with `BLOCKED` plus a clear message.

## Current Gap

- `agents/raven.md` still exposes one `Initialize — Library Configuration` job that points
  at `skills/raven/job-initialize.md`.
- `skills/library/SKILL.md` still names the old initialize job file as the runtime
  procedure boundary.
- The repo has no stub files for distinct first-session and returning-session Raven jobs.
- Live runtime references still point at `job-initialize.md`, so FEAT-062 and FEAT-064
  cannot land against isolated job files.

## Architectural Boundaries

- Keep `/library` as the sole user-facing entry point. This slice changes internal Raven
  dispatch only.
- Keep the real behavioral content out of the stubs. They should state trigger, scope,
  placeholder structure, and temporary blocked exit, not preview FEAT-062 or FEAT-064 in
  detail.
- Update live runtime-facing docs and prompts that point at the old job path. Do not churn
  historical technical plans just to satisfy a global text search.
- Preserve Raven's broader role boundaries. This ticket changes dispatch structure, not
  card authorship, grading, or other agent responsibilities.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/407-raven-dispatch-split/plan.md` | Captures the repo-specific scope, verification, and eval reasoning for the dispatch split |
| Raven agent dispatch | `agents/raven.md` | Raven advertises two initialize-adjacent jobs instead of one monolithic initialize job |
| `/library` entry point | `skills/library/SKILL.md` | `/library` points to the split first-session / returning-session dispatch surface instead of the deleted initialize job |
| Raven initialize job files | `skills/raven/job-first-session.md`, `skills/raven/job-returning-session.md`, delete `skills/raven/job-initialize.md` | The combined initialize procedure is replaced by two stub jobs that exit honestly with `BLOCKED` until their follow-up tickets land |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `agents/raven.md` | Job 2 becomes two explicit jobs with trigger conditions based on config presence | Keep Job references, shared-convention wording, and initialize exception text aligned with the new split |
| `skills/library/SKILL.md` | The thin `/library` room entry point now describes the split dispatch surface rather than one initialize job file | Keep `/library` documented as the only user-facing entry point and make the temporary blocked state explicit if the stub is reached |
| `skills/raven/job-first-session.md` | New stub for fresh initialize path | Include frontmatter, trigger, inputs, placeholder procedure sections, and a clear temporary `BLOCKED` exit |
| `skills/raven/job-returning-session.md` | New stub for room-open path when config exists | Include frontmatter, trigger, inputs, placeholder procedure sections, and a clear temporary `BLOCKED` exit |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown and prompt/doc formatting after agent and skill edits |
| Full deterministic suite | `bun test` | Confirms the prompt/doc slice does not regress checked-in deterministic coverage |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `agents/raven.md` and `skills/raven/*` | Yes, via Raven evals | Rerun Raven evals to verify the agent still routes and responds correctly on existing eval-backed Raven behavior after the dispatch-table change | `bin/alexandria-eval run raven/all` |
| `/library` initialize flow | Yes, but only for successful artifact-producing initialize sessions | Do not rerun `initialize/all` in this slice because FEAT-061 intentionally replaces the successful initialize path with blocked stubs; the current initialize suite would only report the known temporary non-goal rather than validate this dispatch split meaningfully | none in this ticket; FEAT-062/064 should restore meaningful initialize reruns |
| First-session / returning-session blocked stub behavior | No meaningful dedicated coverage today | Do not add a new eval case in this slice because the repo's current Raven and initialize shared structural checks are built for different behavior classes; note the gap and rely on manual review plus the Raven suite for this intermediate ticket | none; reassess once FEAT-062/064 land real procedures |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Deleting `job-initialize.md` could strand `/library` in an unclear broken state | Make both stubs exit with explicit `BLOCKED` language that names the follow-up tickets and the temporary nature of the placeholder |
| Live docs could partially reference old and new job paths at the same time | Update every live runtime-facing reference found in the active code paths, then verify with targeted `rg` searches |
| Contributors could interpret historical plan docs as required edits for this slice | State in the plan and final review that historical plans are preserved as design records and excluded from the active-surface cleanup |
| The split could accidentally imply a new user-facing command surface | Keep `/library` wording intact and describe the split strictly as internal Raven dispatch |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#407`.
2. Update `agents/raven.md` so the Job Dispatch table replaces the old initialize row
   with the two FEAT-061 rows and the surrounding initialize wording no longer points to
   `job-initialize.md`.
3. Update `skills/library/SKILL.md` so the thin `/library` entry point points to the new
   split dispatch surface.
4. Add `skills/raven/job-first-session.md` with minimal frontmatter, trigger, inputs,
   placeholder procedure sections, and a clear temporary `BLOCKED` exit.
5. Add `skills/raven/job-returning-session.md` with matching stub structure and blocked
   exit.
6. Delete `skills/raven/job-initialize.md`.
7. Verify the active code paths no longer reference `job-initialize.md`.
8. Run `bun run check`.
9. Run `bun test`.
10. Run `bin/alexandria-eval run raven/all`, inspect results, and compare against
    baselines if needed.
11. Perform a manual local review against the issue, plan, and final diff, then update or
    open the PR against `main`.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/407-raven-dispatch-split/plan.md` exists and matches the repo
   slice.
2. `agents/raven.md` has two rows replacing the old initialize row, each with the
   required trigger condition.
3. `skills/raven/job-first-session.md` exists as a stub with correct frontmatter and
   placeholder sections.
4. `skills/raven/job-returning-session.md` exists as a stub with correct frontmatter and
   placeholder sections.
5. `skills/library/SKILL.md` no longer points to `skills/raven/job-initialize.md`.
6. The active runtime surfaces in the repo no longer reference `job-initialize.md`.
7. The new stubs exit with a clear `BLOCKED` message instead of pretending the real
   procedure exists.
8. `bun run check` passes.
9. `bun test` passes.
10. `bin/alexandria-eval run raven/all` completes without a blocking regression.

## Deferred Follow-Ups

1. Implement the real first-session flow in FEAT-062.
2. Implement the real returning-session flow in FEAT-064.
3. Restore meaningful `/library` initialize eval reruns once those real procedures exist.
4. Decide later whether old technical plans that mention `job-initialize.md` should be
   mass-migrated or preserved as historical records.
