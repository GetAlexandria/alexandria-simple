# Play Design Brief - Capture

```
slug:     capture
division: PlaymakerStudio
function: Operations
tier:     Coordinator
status:   live operations play
```

## 1. Goal

Record a learning surfaced by Studio work without turning unsupported material
into a rule. Capture appends a typed Ledger event, writes an autopsy projection,
and leaves active rulebook docs untouched.

## 2. Trigger

Director-invoked or quality-reaction. A ruling/session event may request this
play; the run still records the source and whether the source substantiates the
learning.

## 3. Inputs

- `source`: file that substantiates or fails to substantiate the learning.
- `learning`: learning text.
- `classification`: optional classification, defaulting to Studio rulebook.
- `substantiation`: optional `supported` or `unsubstantiated` override.

## 4. Output

`ax run capture` appends `studio.operations.capture`, writes
`studio/inheritance/autopsy/capture-*.md`, and refreshes
`studio/inheritance/dispositions.md`.
