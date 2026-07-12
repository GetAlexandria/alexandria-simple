# quarantine/

Vendored third-party source held for the Map tab port (plan:
`docs/alexandria/plans/map-tab/plan.md`, Gate 1 in §3).

Nothing in this directory is load-bearing until it is promoted:

- **Never import from here.** No file under `quarantine/` may be imported,
  required, or referenced by product code in `packages/`.
- **Excluded from the build graph.** This directory is outside every
  tsconfig, lint, format, and test glob. The repo's build, lint, and test
  output is identical with or without it.
- **Verbatim only.** Vendored files are byte-identical to their source
  commits and are never edited in place — not even reformatted. Promotion
  (copying a piece into `packages/` with review, tests, and modernization)
  is the only way content leaves quarantine.

Each vendored tree carries a `MANIFEST.md` recording per-file provenance
(source repo, source path, commit SHA) and intended disposition. Quarantine
is deleted at the end of the plan (issue L3); the manifest SHAs keep the
pointer back to source.

Precedent: alexandria-internal's `studio/inheritance/quarantine/`.
