# CLAUDE.md

This is `alexandria-internal`, the private engineering monorepo for Alexandria.
It contains the shipped Alexandria plugin, CLI/viewer/deploy tooling, internal
plans, and maintainer skills.

## Package Map

- `packages/alexandria-plugin` — shipped Alexandria plugin payload.
- `packages/ax` — public Alexandria CLI.
- `packages/pms` — PlayMaker Studio: the PMS CLI (make-a-play modules and
  Studio Operations; records under `studio/records/`), the pms server
  (`pms start`, `:4322`), and the PMS viewer (`packages/pms/viewer`).
- `packages/viewer` — the local Alexandria viewer; the shipped **product** surface. "Look at / run Alexandria" means this — `ax start viewer` (`:4321`).
- `packages/deploy` — release and deploy tooling.
- `packages/host-*` and `packages/plugin-runtime` — host/runtime integration
  package areas.
- `skills/` — maintainer-only local skills for this repository.
- `docs/alexandria/plans/` — implementation and planning artifacts.
- `docs/alexandria/ops/` — operator runbooks for hosted Alexandria product
  instances and other recurring operations.
- `docs/alexandria/library/` — Alexandria's working product library that the
  Library viewer section and Builder registry read by default.

## The Ledger Is Shared History

`docs/alexandria/ledger/events.jsonl` is the project's Ledger: append-only,
immutable, **git-tracked shared history**. It is NOT transient, NOT
local-only, and NOT user-specific — treat it exactly like source code:

- Events written on a branch belong on that branch and MERGE to main with the
  branch (union merge driver in `.gitattributes`; idempotency keys make the
  union safe). A draft library's events on a draft branch are real history —
  agents (especially Raven) should read them; a draft that never lands is
  itself meaningful information.
- Commit ledger changes with the work that produced them. Never add the
  ledger to .gitignore (that bug already happened once — director ruling
  2026-07-08 reversed it), never reset or rewrite it, never treat a dirty
  `events.jsonl` as noise to discard.
- Write events only through `ax` commands (the runtime owns validation and
  idempotency). Per-machine runtime state — cursors, connections — lives
  under `docs/alexandria/.ax-runtime/` and stays untracked; do not confuse
  it with the Ledger.

## Vendored Repositories

This project vendors external repositories under @repos/

  - Before relying on a vendored repository for current behavior, run `pnpm run subtrees:update` so the local copy reflects the latest upstream code
  - Vendored repository updates must be committed directly to `main` as standalone commits; do not include subtree update commits in feature PRs or bundle them with implementation work
  - Use vendored repositories as read-only reference material when working with related libraries
  - Prefer examples and patterns from the vendored source code over generated guesses or web search results
  - Do not edit files under @repos/ unless explicitly asked
  - Do not import from @repos/ - application code should continue importing from normal package dependencies

## Fabro Software Factory

We use a Fabro software factory to build Alexandria.

We also ship Fabro as the orchestrator inside Alexandria as a product, but
that's different from using Fabro to build Alexandria. We also keep a local copy
of the Fabro codebase vendored in `repos/fabro`.

We have a remote Railway-based Fabro server using Codex via API, and a local
Docker-based Fabro server using Codex via ACP. The runbook for using and
maintaining those two factories is at `.fabro/README.md`.

## Hosted Product Instances

Hosted Alexandria product instances are operated from
`docs/alexandria/ops/product-hosting-runbook.md`. Use that runbook, not the
Fabro software factory docs, when adding a new project/channel instance.

Important boundaries:

- one Railway service and persistent volume per project/channel pair
- one `freeq-raven` process as the only Freeq-facing loop
- no `freeqcc` daemon in this deployment path
- Claude Code stays on a trusted Tailnet machine and is reached by Raven/AX2 as
  a backend
- the project checkout on the hosted volume remains the canonical Git state

## Play Maker's Studio

`studio/` is the play-writing studio migrated from the raven-playbook
workstream (2026-06-12): a play library with a Director-gated production
process. The canonical Studio **surface is the PMS viewer**
(`packages/pms/viewer/src/components/studio/`; `pms start`, `:4322`) — split
out of the Alexandria viewer in the PMS/Alexandria boundary migration,
Slice 2. The viewer renders the Studio, it does not own the records.
`studio/` holds the **data the viewer reads**: the play library under
`studio/plays/`, the org-model catalog (`registry.js` — `DIVISIONS` +
division/function per play), the Board state (`board-state.json`), and the
`studio/tools/` data-validators (the CI guard). Session entry point:
`studio/plays/HANDOFF.md` (an archive of dated records, excluded from
markdown lint).

PMS reads Alexandria data only through the Alexandria runtime's public API
(identity-checked; see `packages/pms/CLAUDE.md`), and PMS state never
touches Alexandria's Ledger. The former standalone HTML/Python Studio
surface is **RETIRED and deleted** (director ruling 2026-06-23 — it was a
smuggled-in prototype, not the product; see
`docs/alexandria/plans/studio-fixes/board-surface-decision.md`). "Look at /
run Alexandria" means the Alexandria viewer (see Package Map); the Studio
means the PMS viewer. Inherited factory-era conventions live in
`studio/inheritance/` — the `quarantine/` subset is NOT load-bearing until
promoted (see its README).

## Guidance Hierarchy

Root guidance is intentionally lightweight. Before changing a package, read that
package's local `CLAUDE.md` when it exists. Package-local guidance owns package
implementation workflow, release/versioning rules, tests, evals, and validation.

If package-local guidance is missing, use the package README, nearby docs, and
existing code patterns, then keep the change narrowly scoped.

## Cross-Package Safety

- Alexandria now has one shipped product line. Keep work scoped to the canonical
  `packages/alexandria-plugin`, `packages/ax`, and `packages/viewer` surfaces
  unless explicitly asked to create a separate line.
- Keep work scoped to the package or surface requested.
- If a change spans packages, update the relevant package-local guidance or docs
  in the same slice.
- Do not freehand-edit `docs/alexandria/library/` during implementation work;
  it is the live product library. Record proposed library updates in the
  relevant plan artifact unless an approved migration plan explicitly owns the
  library path move.
- Avoid product-specific examples in reusable plugin behavior unless they are
  intentionally part of a fixture or test case.

## Development Setup

For local development:

```bash
bun install
./scripts/setup-dev
```

For fresh automation worktrees:

```bash
./scripts/setup-worktree
```

Notes:

- Prettier is limited to TypeScript, JSON, and YAML in this repo.
- Markdown is linted with `markdownlint-cli2` plus repo semantic checks.
- Shell scripts are checked with `shfmt` and `shellcheck`.

## Planning

Substantial cross-package work should have a plan under
`docs/alexandria/plans/<feature>/plan.md`.
