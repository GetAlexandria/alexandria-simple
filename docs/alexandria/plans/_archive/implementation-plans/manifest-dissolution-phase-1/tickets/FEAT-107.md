---
id: FEAT-107
title: "Add card provenance and classification fields end-to-end"
outcome: O-2
tier: should
enabler: false
blocked-by: [FEAT-096]
blocks: []
cards: [Standard - Card Frontmatter Schema, Agent - Conan the Librarian, Agent - Sam the Scribe]
---

## Motivation

`source` and `classification_rationale` are useful card metadata, but adding
them as parser-only fields is not shippable. They become valuable only when the
same slice ensures Conan records the values, Sam writes them into card
frontmatter, and at least one CLI or workflow reads them.

This ticket bundles those concerns so the fields are introduced as a real
workflow, not disconnected schema surface.

## Description

Add provenance and classification frontmatter end-to-end:

- Update Conan inventory guidance so each expected card carries source references
  and a classification rationale in a form Sam can copy into frontmatter.
- Update Sam card-creation guidance/templates so new cards write:
  - `source: [path#section, ...]`
  - `classification_rationale: <why this card has this type and area>`
- Extend `CardFrontmatter` with typed `source?: string[]` and
  `classification_rationale?: string`.
- Extend `ax cards list --json` to include both fields.
- Add lint or review checks that surface missing values once the workflow is
  active.

## Context

Conan already has inventory columns named `Source` and `Classification
Rationale`, but Sam's card-writing procedure does not currently turn those
columns into YAML frontmatter. The existing repository also has only sparse live
examples of these fields, so consumers should not assume the data is populated
until this ticket lands.

Anti-pattern: do not add these fields only to the parser. A field is canonical
when there is a writer, reader, and reason to preserve it.

## Acceptance Criteria

- [ ] Conan inventory output has unambiguous `source` and
      `classification_rationale` values for Sam
- [ ] Sam card creation writes both fields into new cards
- [ ] `CardFrontmatter` includes typed `source?: string[]` and
      `classification_rationale?: string`
- [ ] `ax cards list --json` includes `source` and `classification_rationale`
      after the writer path exists
- [ ] Missing/invalid values are reported by lint or Conan review, not by the
      parser
- [ ] Black-box workflow test covers a fixture inventory -> card -> JSON query
- [ ] Relevant Sam/Conan evals are run if their prompts change

## Implementation Notes

Keep parse-don't-validate: parser extracts fields leniently; lint/review owns
schema conformance.

This ticket may require splitting into a Sam/Conan prompt PR plus a CLI PR if
eval coverage makes the prompt work large, but do not land the parser field
without a writer and reader in the same release slice.
