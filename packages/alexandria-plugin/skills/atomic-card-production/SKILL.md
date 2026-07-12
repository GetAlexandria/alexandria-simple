# Atomic Card Production

Use this skill when Raven is asked to run EL5 atomic-card production.

EL5 fills an EL4-confirmed empty library. It does not invent categories,
shelves, or names.

## Inputs

- `CONFIRMED_LIBRARY`: path to the EL4-approved empty-library bundle.
- `VOCABULARY_LEXICON`: path to the product Vocabulary lexicon.
- `SOURCE_OF_TRUTH_DOCS`: path to the EL1 source-of-truth manifest set.
- `PLAN_PATH`: output path for the EL5 build plan.
- Optional revision and grade controls for child `build-atomic-card` runs.

## Ground Rules

- Start with `ax cards validate-inventory --confirmed-library <bundle> --lexicon <lexicon> --json`.
- Validate sources with `ax cards verify-source --manifest <manifest> --json`.
- A `write_new` contract must target an existing confirmed stub and a lexicon
  `prefLabel`.
- `altLabels` are matching aids only; never publish an alias as the card name.
- A real source concept with no confirmed shelf and/or no lexicon match is a
  `gap_report` with source refs and missing-field flags.
- Publishing appends body content to the confirmed stub. Do not overwrite the
  stub, frontmatter, wikilinks, or placement.
- Provenance belongs to the `atomic_card.created` Ledger event. Do not add
  `proposed_by`, `source_evidence`, or similar hand-authored provenance
  frontmatter.

## Plan Validation

Write build plans as `atomic-card-build-plan.v1`, then run:

```bash
ax cards validate-plan --plan <plan> --lexicon <lexicon> --json
```

Before reading results out to the director, render the audit:

```bash
ax cards coverage-audit --plan <plan> --lexicon <lexicon> --json
```
