# Alexandria Next Reset Plan

- Issue reference: none yet
- Goal: create a parallel Alexandria v2 line that can improve one play at a
  time, update every product surface together, release consistently, and fold
  real user feedback into the next iteration.
- Linked product plan: May 8, 2026 planning discussion and the working draft of
  `.context/plays/01-create-library-index-nouns.md`.

## Scope

- Build Alexandria Next beside Alexandria 1. Existing packages, installs, and
  users must keep working while the new line is proven.
- Establish the manual iteration loop once before adding Fabro automation.
- Define the per-play contract that requires plays, library artifacts, CLI,
  ledger, triggers, docs, viewer, evals, plugin packaging, and release smoke
  validation to advance together.
- Scaffold the new plugin package first, because the plugin owns the playbook,
  Play 01, docs, and user-facing workflow.
- Implement the first play as a shim: Play 01, Create Library Index Nouns.
- Use the first play to exercise every surface end to end, not to solve the full
  quality problem of noun recommendation and gap-checking.

## Non-Goals

- Replacing Alexandria 1 in this slice.
- Deleting old packages, skills, agents, docs, or evals.
- Automating the full Fabro factory loop before the manual loop has run once.
- Shipping a tuned noun recommender or final lexicon methodology in the first
  slice.
- Reworking the current Alexandria 1 playbook, CLI, viewer, or plugin behavior.
- Bumping `VERSION`, `CHANGELOG.md`, root `package.json`, or the Alexandria 1
  plugin manifest unless a dedicated release-prep issue says to.

## Current Gap

Alexandria 1 has working package surfaces, but those surfaces are downstream of
the wrong playbook shape. The existing commands, ledger assumptions, agents,
skills, viewer pages, and evals encode old plays. Improving them in place would
make it hard to separate genuine v2 behavior from compatibility constraints.

The missing capability is not a single command. The missing capability is a
repeatable release loop:

1. pick one play
2. define its contract
3. implement only the needed deterministic and agent surfaces
4. verify with deterministic tests and evals
5. bundle it as a new plugin line
6. install it in a real test project
7. capture feedback
8. repeat

## Architectural Boundaries

Alexandria Next should use parallel packages and separate runtime roots until a
later migration plan explicitly swaps it into the Alexandria 1 surfaces.

Provisional package boundaries, in implementation order:

| Package | Purpose |
|---------|---------|
| `packages/alexandria-next-plugin` | Canonical bundled plugin payload: playbook, Play 01, guided skill, docs, templates, lexicon shelf, and plugin manifest |
| `packages/ax-next` | Effect-based deterministic support CLI, likely exposed as `ax2` during side-by-side testing |
| `packages/viewer-next` | Viewer for the plugin docs, noun manifest, ledger, and library state |
| `packages/alexandria-next-evals` or `packages/ax-next/tests/eval-cases` | v2 eval cases and baselines, final location to be chosen during scaffold |

There should be no `alexandria-next-core` package in the first slice. The
plugin is the source of truth for plays and playbook prose. `ax-next` may own
TypeScript models for deterministic CLI behavior, but those models implement the
plugin's contracts; they do not define the product shape independently. Extract
a shared model package only after another package needs to import the same model
code and duplication becomes real.

Runtime boundaries:

- Alexandria 1 keeps using its current data roots and package names.
- Alexandria Next uses a distinct project data root, provisionally
  `docs/alexandria-next/`.
- The first CLI binary should be distinct from `ax`, provisionally `ax2`.
- The first plugin should have a distinct manifest name, provisionally
  `alexandria-next`, so installing it does not break current Alexandria users.

Developer guidance:

- `packages/ax-next/CLAUDE.md` should define Effect-first CLI conventions.
- That guide must reference
  `packages/ax/docs/cli-design-principles.md` for CLI interaction, output,
  validation, mutation, and introspection standards.
- New CLI commands should be designed as Effect programs with explicit services
  for filesystem, clock, process, logger, and environment access rather than
  ad hoc global IO.
- `packages/alexandria-next-plugin/CLAUDE.md` or equivalent package guidance
  should state that the plugin playbook is canonical and all other packages
  serve it.

## Play Feature Contract

Every Alexandria Next play must land as a vertical slice across these surfaces:

| Surface | Required artifact |
|---------|-------------------|
| Play | Versioned play spec with identity, trigger, inputs, outputs, roles, steps, ledger contract, confidence, failure modes |
| Library artifacts | Any manifest, cards, folders, or templates the play creates or consumes |
| Ledger | Event names, payload schemas, idempotency keys, and append/read behavior |
| CLI | Commands needed by the play, with help, JSON output, deterministic exit codes, and tests |
| Triggers | Router or plugin trigger declaration; plays describe trigger conditions but do not self-dispatch |
| Plugin | Skill/command instructions that execute or guide the play |
| Docs | Human-facing docs delivered with the plugin and shown in the viewer |
| Viewer | Page or panel that lets a human inspect play state, outputs, and ledger history |
| Deterministic tests | Black-box tests for CLI and filesystem behavior |
| Eval | At least one eval case for any agent-mediated judgment in the play |
| Release | Build artifact and install smoke in a target project |
| Feedback | Place to record user findings that will inform the next play or iteration |

No play is considered complete if one of these surfaces is omitted without a
tracked deferral and explicit rationale.

## Manual Iteration Loop

The first pass stays manual. Fabro support comes after this loop has completed
once and the contract is based on evidence rather than speculation.

1. Draft or revise the play spec.
2. Identify the minimum deterministic primitives and agent-mediated judgments.
3. Define the playbook, Play 01 contract, docs, templates, and guided plugin
   workflow inside `alexandria-next-plugin`.
4. Define the ledger and manifest contracts from the plugin play, then implement
   deterministic support commands in `ax-next`.
5. Add viewer support that reads the plugin docs and play outputs.
6. Add deterministic tests.
7. Add eval coverage for the agent-mediated portion.
8. Build the plugin and CLI artifacts.
9. Install into a real test project such as WeDo or Hearthfire.
10. Run the play manually with a human.
11. Record feedback and defects.
12. Decide whether to patch the current play, promote confidence, or move to
    the next play.

Fabro can be introduced only after the first manual loop produces a concrete
checklist, failure log, and release/install transcript.

## First Play: Create Library Index Nouns

Play 01 is the bootstrap shim for Alexandria Next.

Purpose:

- Create the initial shared product vocabulary before any atomic cards exist.
- Prove the v2 play schema by example.
- Exercise scan, human wait states, lexicon selection, manifest writing,
  Section folder scaffolding, ledger events, docs, viewer, evals, and packaging.

The first implementation should not pretend the recommender is fully tuned.
It should make the flow real and observable with a narrow, reviewable behavior.

### Play Contract Summary

| Field | Initial decision |
|-------|------------------|
| Play number | `01` |
| Name | `Create Library Index Nouns` |
| Family | Construction, Back of House |
| Predecessors | none |
| Successors | Source to Atomic, Quality Pass |
| Window | pre-cards only |
| Re-runnability | idempotent before the first atomic card; route elsewhere after cards exist |
| Primary output | noun manifest |
| Physical index | Section folders derived from the manifest |
| Ledger role | durable choice log and play completion signal |

### Initial Manifest Decision

The first slice should choose a simple manifest path and schema so downstream
surfaces can build against it:

- Path: `docs/alexandria-next/library/noun-manifest.json`
- Format: JSON for deterministic CLI and viewer parsing
- Required groups: `sections`, `objects`, `roles`, `actions`, `patterns`,
  `concepts`
- Required metadata: schema version, lexicon name, source path or skip marker,
  created timestamp, play id, and human confirmation flag

Markdown docs can render the manifest later, but the source of truth should be
structured from the start.

### Initial Ledger Decision

Use append-only JSONL:

- Path: `docs/alexandria-next/ledger/events.jsonl`
- Event envelope: event id, event type, play id, timestamp, actor, payload
- Idempotency: command-level run id plus play id

Initial event names:

- `play.start`
- `scan.complete`
- `descriptor.received`
- `descriptor.skipped`
- `recommendation.proposed`
- `path.chosen`
- `gap.suggested`
- `gap.accepted`
- `gap.rejected`
- `manifest.confirmed`
- `manifest.committed`
- `play.exit`

The next play subscribes to `play.exit` where `play_id == "01"` and status is
`DONE` or `DONE_WITH_CONCERNS`.

### Initial CLI Surface

Provisional commands:

```bash
ax2 scan --json
ax2 play run create-library-index-nouns [--descriptor <path>] [--skip-descriptor] [--json]
ax2 scaffold index --manifest <path> [--dry-run] [--json]
ax2 ledger list [--play 01] [--json]
ax2 manifest show [--json]
```

The `play run` command may be a thin orchestrator in the first slice. If the
agent-mediated steps need to stay in the plugin for now, the CLI should still
own deterministic scan, manifest validation, scaffold writes, and ledger appends.

### Initial Plugin Surface

The plugin should expose one guided entry point for the first play. It should:

- present the one-sentence framing
- ask for a descriptor artifact or explicit skip
- show the top lexicon recommendation or a bring-your-own path
- guide the human through review
- call deterministic CLI commands for commit/scaffold/ledger writes
- stop with a clear exit status

Agent roles should be named as capability slots in the play spec, not as final
agent names. The initial plugin can implement Recommender and Gap-checker in one
guided skill if that keeps the first loop small.

### Initial Docs And Viewer

Docs must ship with the plugin and be visible in the viewer:

- what Play 01 does
- what the noun manifest is
- what folders are scaffolded
- what each exit status means
- how to resume after walking away
- how to inspect the ledger

Viewer Next should show:

- current play status
- noun manifest grouped by Sections, Objects, Roles, Actions, Patterns, Concepts
- scaffolded Section folders
- ledger timeline for Play 01
- warning state when a manifest exists but no atomic cards exist yet

### Initial Eval

Create one eval that exercises the agent-mediated shim:

- User has a small product descriptor.
- Plugin guides them through descriptor submission or skip.
- Recommender proposes a shelf lexicon with reasoning.
- Human confirms or edits the noun manifest.
- Deterministic command writes the manifest, scaffolds folders, and appends
  ledger events.

Structural checks should assert:

- manifest exists and parses
- required groups exist
- Section folders exist
- ledger contains `manifest.committed` and `play.exit`
- no atomic cards were created by Play 01

Judge criteria should evaluate:

- whether the recommendation reasoning is specific to the descriptor and scan
- whether the human choice is preserved rather than overwritten
- whether gaps are surfaced without forcing speculative nouns
- whether the exit status is honest

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Planning | `docs/alexandria/plans/alexandria-next-reset/plan.md` | Establishes the rewrite loop and first vertical slice |
| Core | `packages/alexandria-next-core` | New shared v2 schemas and validation |
| CLI | `packages/ax-next` | New Effect-based CLI and `ax2` command surface |
| Plugin | `packages/alexandria-next-plugin` | New side-by-side plugin payload and Play 01 guide |
| Viewer | `packages/viewer-next` | New viewer for v2 manifest, docs, and ledger |
| Evals | v2 eval case location to be finalized | First Play 01 baseline |
| Release | deploy scripts, installer paths, or local-only build scripts | Side-by-side artifact for manual test installs |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Alexandria 1 agents/skills | No behavior change in this plan | None |
| Alexandria Next plugin guide | Introduce Play 01 guided flow | New docs, eval, and manual smoke script |
| Recommender slot | First-pass lexicon recommendation from repo scan plus descriptor | Eval judge criteria and future tuning log |
| Gap-checker slot | First-pass likely-missing noun review | Eval judge criteria and future tuning log |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Existing lint, formatting, markdown, shell, and typecheck gate |
| Repo tests | `bun test` | Existing deterministic suite |
| Next CLI tests | command to be added under `packages/ax-next` | Black-box coverage for `ax2` behavior |
| Next viewer tests | command to be added under `packages/viewer-next` | Build/check viewer pages for v2 data |
| Release smoke | command or script to be added | Build and install side-by-side artifacts in a test project |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| Alexandria 1 plugin | Existing evals cover old plays | Do not rerun unless old files change | none |
| Alexandria Next Play 01 | None | Create first v2 eval case and baseline | provisional `pnpm eval -- run next/create-library-index-nouns` |
| Recommender slot | None | Add judge criteria for recommendation specificity | same case |
| Gap-checker slot | None | Add judge criteria for omission handling | same case |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The v2 rewrite quietly mutates Alexandria 1 behavior | Use parallel packages, binary, plugin name, data root, and release artifacts |
| The first play expands into a full noun-quality project | Treat Play 01 as a shim until the loop is proven; track recommender tuning as follow-up |
| Every surface gets partially scaffolded but no loop actually runs | Require install smoke in WeDo or Hearthfire before the first slice is accepted |
| Eval work repeats old play assumptions | Write new Play 01 criteria from the v2 play schema and noun-manifest contract |
| Effect CLI conventions become inconsistent | Add `packages/ax-next/CLAUDE.md` before command implementation |
| Human feedback has nowhere durable to land | Add a feedback artifact to the manual loop before moving to Play 02 |
| Manifest/folder decisions harden too early | Version schemas and keep migration support in core from the first slice |

## Implementation Steps

1. Confirm final side-by-side names for package, plugin, binary, and data root.
2. Scaffold `packages/alexandria-next-core` with play, manifest, and ledger
   schema definitions.
3. Scaffold `packages/ax-next` with Effect dependencies, CLI entry point, tests,
   and `CLAUDE.md`.
4. Scaffold `packages/alexandria-next-plugin` with a minimal plugin manifest and
   Play 01 guide.
5. Scaffold `packages/viewer-next` with a minimal docs/ledger/manifest page.
6. Define the Play 01 spec as a checked-in artifact.
7. Implement deterministic scan, manifest validation, ledger append/read, and
   Section folder scaffold commands.
8. Wire the Play 01 plugin guide to call the deterministic CLI commands.
9. Add docs for Play 01 and viewer pages that render the manifest and ledger.
10. Add deterministic black-box tests for CLI behavior and filesystem outputs.
11. Add the first Play 01 eval case, structural checks, and judge criteria.
12. Build side-by-side artifacts.
13. Install into WeDo or Hearthfire and manually run Play 01.
14. Record feedback, failures, and next-play recommendations.
15. Decide whether to patch Play 01, promote its confidence, or begin Play 02.

## Acceptance / Exit Criteria

1. Alexandria 1 remains unaffected.
2. Alexandria Next has parallel package boundaries and a distinct runtime root.
3. Play 01 has a checked-in play spec and schema-backed manifest/ledger contract.
4. `ax2` can run deterministic Play 01 support commands.
5. The new plugin can guide a human through the Play 01 shim.
6. Viewer Next can display the manifest, Section scaffold, docs, and ledger
   timeline.
7. Deterministic tests pass for the new CLI/core behavior.
8. A Play 01 eval exists with structural checks and judge criteria.
9. A side-by-side artifact can be installed in at least one test project.
10. The manual loop produces a feedback record before Fabro automation begins.

## Deferred Follow-Ups

1. Fabro factory workflow for repeated feature/play development.
2. Release-channel naming and public distribution strategy for Alexandria Next.
3. Full recommender tuning across multiple product types.
4. Noun Surgery and Lexicon Migration sibling plays.
5. Play 02, Source to Atomic.
6. Play 03, Quality Pass.
7. Migration path from Alexandria 1 libraries to Alexandria Next.
8. Public naming decision: Alexandria 2, Alexandria Next, Neo Alexandria, or
   another release identity.
