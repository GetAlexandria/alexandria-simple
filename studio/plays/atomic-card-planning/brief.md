# Play Design Brief - Atomic Card Planning

```
status:   built scaffold
tier:     senior
division: Product
function: Library Operations
face:     Raven
```

## Goal

Plan EL5 atomic-card production from the confirmed library contract: the
EL4-approved empty-library bundle, the Vocabulary lexicon, and the EL1
source-of-truth manifest set.

## Contract

The play writes `atomic-card-build-plan.v1`. A `write_new` contract must target
an existing confirmed stub and a lexicon `prefLabel`. A real source concept with
no confirmed shelf, no lexicon match, or both becomes a `gap_report` with source
refs and missing-field flags.

## Boundary

This is Product / Library Operations, fronted by Raven. PlaymakerStudio is
provenance only. AX owns deterministic validation; the plugin owns the guided
triage behavior.
