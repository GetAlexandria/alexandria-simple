# Play Design Brief - Quarantine

```
slug:     quarantine
division: PlaymakerStudio
function: Operations
tier:     Coordinator
status:   live operations play
```

## 1. Goal

Sequester inherited material as untrusted data. Quarantine copies material with
a provenance header, appends a Ledger event, and does not touch active rulebook
docs.

## 2. Trigger

Intake of foreign material from another branch, era, or product.

## 3. Inputs

- `foreign`: file to sequester.
- `origin`: human-readable provenance for where the material came from.

## 4. Output

`ax run quarantine` writes a copy under `studio/inheritance/quarantine/`, appends
`studio.operations.quarantine`, and refreshes the disposition projection. A
later promotion is a separate gated disposition.
