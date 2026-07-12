# Play Design Brief - Deprecate

```
slug:     deprecate
division: PlaymakerStudio
function: Operations
tier:     Coordinator
status:   live operations play
```

## 1. Goal

Retire a verified stale Studio rule only after a Director gate. Deprecate is the
only F9 operation that edits load-bearing docs, and it removes only the exact
approved rule text.

## 2. Trigger

Director-invoked, quality-reaction, or timer. The Director gate must approve the
edit before a `studio.operations.deprecate` event is appended.

## 3. Inputs

- `target`: load-bearing doc path.
- `rule`: exact rule text to remove.
- `reason`: human-readable deprecation reason.
- `disposition`: `rejected` or `superseded`, defaulting to `superseded`.

## 4. Output

Approval appends `studio.operations.deprecate`, refreshes
`studio/inheritance/dispositions.md`, and removes only the approved rule text.
Decline or missing gate leaves the rulebook unchanged and appends no deprecate
event.
