# Hygiene Log — Alexandria Product Library

A process change log for hygiene passes over this bundle: motions that change
how a card _reads_ without changing what it _means_. Each pass is one row.

Provenance for a hygiene motion lives here, not on the cards. A "we
de-machined this" note on a live product card would be the same kind of
machine clutter the pass removes, and it would wear ruling-level provenance it
has not earned. The per-card record of what changed is the pass's commit diff;
the objective check is the machine-language gate
(`studio/tools/check-machine-language.mjs`), which fails if any card body still
carries an implementation token.

**Rule of the house.** A hygiene pass edits card **body prose only**. It never
alters `source_evidence`, `links`, `status`, or any existing provenance field.
Ruling ids already cited inline are lifted losslessly into a `rulings:`
frontmatter list — kept and traceable, just out of the reading surface.
Scanner event indices (`event 11`) are dropped as noise. No product fact is
added or removed; only the wording changes.

To audit what a pass did to director-approved cards, read the row, then read
that commit.

## Passes

### 2026-07-07 — De-narrate card bodies

- **Rule:** a card body describes the product, never the process that
  produced the card. Origin stories ("this area exists because…"), ruling
  narration ("the director ruled…", "ruled retired", "parked, not
  deleted", "kept only as the record of…"), session references, and dates
  move out of body prose; the facts they carried stay, stated as product
  facts, with provenance already held by `rulings:`. A retired or parked
  card's WHAT opens by defining the thing and its job, then carries its
  disposition as one short factual clause.
- **Scope:** the whole bundle, flagged by a six-agent survey of all 127
  card bodies; 40 cards flagged (18 heavy, 22 light).
- **Cards:** 40 rewritten — the Knowledge Organization lead by hand as the
  style anchor, the rest fanned out one agent per context group.
- **Method:** survey first (classify every card against the failure
  modes), then fix only flagged cards; body prose only, no frontmatter
  field altered, no wikilink added, removed, or split across lines.
- **Gate:** the machine-language gate now also rejects the
  process-narrative formulas above plus ISO dates in bodies, so the pass
  cannot regress. Green on the full bundle; story lint (both rules) and
  markdownlint clean.
- **Detail:** see this pass's commit diff.

### 2026-07-03 — De-machine card bodies

- **Rule:** card body reads as product English; code references move to
  `source_evidence`, ruling ids to `rulings:`, scanner event indices are
  dropped.
- **Scope:** the whole bundle — all eight contexts.
- **Cards:** 71 rewritten (the `ledger/` cluster of 5 by hand as the style
  anchor, then the remaining 66 one context at a time); the bundle's other 3
  card bodies were already clean.
- **Method:** the ledger cluster set the target style; the rest was fanned out
  one agent per context, each gated before returning.
- **Gate:** green on the full bundle — 74 of 74 card bodies carry no
  implementation token. Markdownlint clean; no protected frontmatter field
  altered; every cited ruling id verified present in the original card (none
  invented).
- **Detail:** see this pass's commit diff.
