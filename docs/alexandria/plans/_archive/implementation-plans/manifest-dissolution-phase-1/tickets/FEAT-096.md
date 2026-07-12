---
id: FEAT-096
title: "Implement first usable ax cards list inventory slice"
outcome: O-1
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-098, FEAT-100, FEAT-101, FEAT-102]
cards: [Standard - Card Frontmatter Schema, Primitive - Card, System - Knowledge Graph]
---

## Motivation

Phase 1 needs a shippable inventory query before it needs a broader
frontmatter schema. A parser-only change is a disconnected vertical slice:
it adds typed fields before anything writes or consumes them. The first useful
slice is a working `ax cards list` command over facts that are already real
today: card name, card path, card type, and layer derived from type.

After this ticket lands, a human or agent can run `ax cards list --type
Standard` or `ax cards list --json` and get accurate output sourced directly
from the library filesystem. That is the first replacement surface for
manifest.md inventory queries.

## Description

Implement the first horizontal inventory slice:

- Keep `CardFrontmatter` typed for `type` only, while preserving unknown fields
  through the existing index signature.
- Add `ax cards list [path]`.
- Derive card name and default type from filename (`Type - Name.md`).
- Respect explicit `type:` frontmatter when present.
- Derive `layer` deterministically from type.
- Add `--type <T>` and `--layer <L>` filters.
- Add `--json` output with stable keys: `layer`, `name`, `path`, `type`.
- Keep the default output as a human-readable table.

Do not add stored fields that are not written and consumed in this slice.
`area`, `source`, and `classification_rationale` are real needs, but each
requires a horizontal slice that includes writer behavior and reader behavior
together. They are deferred from FEAT-096.

`layer` is deliberately not part of stored canonical frontmatter because it
is deterministically derived from `type`. `status` is deliberately not part
of stored canonical frontmatter in Phase 1 because active cards are derived
from files present under the active library; missing cards come from the
future expected-card/data layer; retired cards need an archive or ledger
mechanism rather than a card-local flag.

`flags` is deliberately not part of stored canonical frontmatter in Phase 1
because the allowed values and consumers are not yet specified. If a concrete
editorial workflow needs flags later, add the specific field or enum in that
workflow's schema change instead of introducing a junk drawer now.

Relationship fields (`depends_on`, `constrains`, `parent`, `informs`, etc.)
are deliberately not part of FEAT-096. Existing `WHERE` sections use a rich
set of relationship verbs (`Implements`, `Conforming`, `Governs`, `Affects`,
`Contained by`, `Parent`, `Related`, and more). Flattening that surface into
three fields would create an under-specified graph model. Proper graph-edge
schema design is split into its own library card and later implementation
work.

Unknown, legacy, or future frontmatter fields (including `layer:`, `area:`,
`status:`, `source:`, `classification_rationale:`, `flags:`, `depends_on:`,
`constrains:`, or `parent:` values) must parse leniently and remain accessible
to callers. The parser does not validate or warn; validation findings belong in
a separate lint pass.

## Context

Current state:

- `parseCardFrontmatter` lives at `packages/ax/src/lib/frontmatter.ts`
- `CardFrontmatter` should not grow fields until the same slice writes and reads
  them
- Existing library cards already encode name/type in filenames, so the first
  inventory command can ship without a library-wide frontmatter migration

The schema documented in `[[Standard - Card Frontmatter Schema]]` (created by
Sam in this Phase) should describe the active stored schema and explicitly
defer future fields until their writer and reader behavior exists.

Anti-pattern: do not couple parser to validation. The parser reads what's
there. A separate lint pass (FEAT-105) validates consistency. Keep
responsibilities separate.

## Acceptance Criteria

- [ ] `CardFrontmatter` type includes `type` and preserves unknown fields
- [ ] Unknown, legacy, and future fields parse leniently, remain accessible, and do not produce parser errors
- [ ] Existing tests in `packages/ax/tests/` continue to pass with no runtime behavior change for legacy fields
- [ ] `ax cards list` exits 0 and prints one row per card on disk
- [ ] Output columns include name, type, layer, and path
- [ ] `ax cards list --type Standard` returns only Standard cards and treats type input case-insensitively
- [ ] `ax cards list --layer rationale` returns rationale-layer cards and treats layer input case-insensitively
- [ ] `ax cards list --json` emits stable JSON with `layer`, `name`, `path`, `type`
- [ ] Black-box integration test exercises the routed CLI against a fixture library
- [ ] Test coverage exercises the live `docs/alexandria/library/` and asserts non-zero card count
- [ ] `bun run check` passes

## Implementation Notes

Use `resolveAlexandriaPathContext` for library root resolution so callers can
pass a repo root, `docs/alexandria`, or the library directory.

Layer derivation: `Standard | Principle | Product Thesis` -> rationale;
`Domain | Section | Governance | Primitive | Template | Component | Artifact
| System | Agent | Prompt | Capability` -> product; `Experience Goal | Force
| Loop | Journey` -> experience; `Decision | Initiative | Future` -> temporal.

Do not implement `--area` here. The area slice should add `area` to the schema,
make Sam/Conan populate it, and then add the reader/filter behavior.

Test strategy: use unit tests for the inventory builder and black-box CLI tests
through `ax cards list`.
