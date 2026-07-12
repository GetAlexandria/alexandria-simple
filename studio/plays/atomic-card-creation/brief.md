# Play Design Brief - Atomic Card Creation

```
status:   built scaffold
tier:     senior
division: Product
function: Library Operations
face:     Raven
```

## Goal

Execute an EL5 atomic-card build plan without inventing structure. The play
validates the plan, launches one `build-atomic-card` child run per `write_new`
contract, and renders coverage audit output after the child runs. The child
play owns draft, validation, grading, revision, append-to-stub publishing, and
`atomic_card.created` Ledger events.

## Contract

Publishing preserves frontmatter, wikilinks, and placement from the confirmed
stub. Provenance is recovered from the Ledger event, not hand-authored
frontmatter.

## Boundary

This is Product / Library Operations, fronted by Raven. PlaymakerStudio is
provenance only. AX owns deterministic child-run input generation, publishing
guards, and audit generation.
