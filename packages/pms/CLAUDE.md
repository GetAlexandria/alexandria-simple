# pms Guidance

This package is the PlayMaker Studio CLI — PMS's own command surface after
the PMS/Alexandria boundary migration (Slice 1). It is Bun, TypeScript, and
Effect-based, mirroring the conventions of `packages/ax`.

## Boundaries

- PMS state never touches Alexandria's Ledger. Durable operation records are
  per-operation JSON files under `studio/records/` (see
  `src/effects/operation-records.ts`); Board state is
  `studio/plays/board-state.json`.
- Nothing here imports from `packages/ax` source. Small helpers the two
  products both need (filesystem effect, reactions parsing, fixtures) are
  copied, not shared — the copy-don't-share ruling of the boundary migration.
- The plan of record is
  `docs/alexandria/plans/pms-alexandria-boundary-migration/plan.md`.

## Commands

- `pms run make-a-play:design|build|prove` — the deterministic make-a-play
  production modules, operating on `studio/plays/make-a-play/`.
- `pms capture|deprecate|quarantine` — Studio Operations dispositions.
- `pms start` — PMS's own server (default `127.0.0.1:4322`): the
  `/api/studio/*` surface (`src/server/studio-api.ts`), a read-only proxy of
  the Alexandria public API (`src/server/alexandria-proxy.ts`; `/api/state`
  and `/api/library/catalog` only, identity-checked against the project
  root), and the studio viewer assets when `viewer/dist` is built.
- The composed interactive make-a-play play (review compositions in
  `src/domain/make-a-play-review.ts`) is not wired to a runner yet; its
  PMS-owned fabro launch path is future work noted in the migration plan.

## Viewer

`viewer/` is the PMS viewer (`@alexandria/pms-viewer`), an Astro + React app
transplanted from the Alexandria viewer's studio components (Slice 2). The
shell (`src/app/PmsApp.tsx`) serves three surfaces: Studio (Board, Catalog,
plays, live runs) plus the PMS-Back and PMS-Drafts library lenses. All
Alexandria data reaches the browser same-origin through the pms server's
proxy — the UI never calls the Alexandria runtime directly. Build with
`pnpm --filter @alexandria/pms-viewer run build`; `pms start` then serves
`viewer/dist`.

## Implementation Rules

- Command execution is modeled as `Effect` programs returning `CliResult`.
- Exit codes: 0 success, 1 operational failure, 2 invalid input.
- Data on stdout, diagnostics on stderr; `--json` for machine output.
- Add black-box tests (spawn the CLI) for command behavior and exit codes.
