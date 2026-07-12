# EL1 Source Manifest — Alexandria (the product)

Provenance: authored 2026-07-01 from an explicit director scope ruling given in
session (EL1 Source Sweep has not yet run for Alexandria; this manifest stands
in for its output and records the director's curation directly). Director:
Danvers Fleury.

## Product under scan

Alexandria — the shipped product line: the Alexandria plugin payload, the `ax`
CLI, and the local viewer, plus the product-facing docs.

## Source roots (in scope)

- `packages/alexandria-plugin/` — the shipped plugin payload (skills, agents,
  workflows, monitors; the playbook surface)
- `packages/ax/` — the public Alexandria CLI (deterministic play support,
  ledger, runtime server)
- `packages/viewer/` — the shipped product surface (the local viewer)
- `docs/alexandria/` — product docs, ops runbooks, and planning artifacts

## Excludes

- `docs/alexandria/library/**` — the pre-convention 208-card library. Director
  ruling: excluded as scan input; retained untouched as a post-hoc coverage
  oracle (never a source of cards, never deleted).
- `docs/alexandria/ledger/**`, `docs/alexandria/source-of-truth/**`,
  `docs/alexandria/.ax-runtime/**` — runtime state, not source.
- `studio/**` — the Playmaker's Studio. Director ruling: PMS is part of
  Alexandria **in a federated way**: it keeps its own library
  (`studio/sweeps/playmaker-studio/`), and this bundle should point to that
  library rather than re-scan the Studio. Record the federation as structure
  (a Reference card and/or thread), not as scanned contexts.
- `repos/**` — vendored external repositories (read-only reference).
- `packages/deploy/**`, `.fabro/**` — release tooling and the software
  factory that builds Alexandria; not the product. Note: Alexandria also
  *ships* Fabro as its embedded orchestrator — that shipped role is in scope
  where the plugin/ax source shows it; the factory that builds this repo is not.
- `packages/host-*/`, `packages/plugin-runtime/` — host-integration package
  areas; outside the ruled scope for this scan (thread it if the source
  suggests they are load-bearing product surface).

## Prior-art inputs

- Basic Product Description (banked 2026-07-01, four approved slots):
  `docs/alexandria/source-of-truth/raven/vision/source-of-truth.md` — the
  search prior. Translate first; confirm every lead against source.
- No answer key supplied (deliberate: the old library is held back as a
  post-run coverage oracle instead).
