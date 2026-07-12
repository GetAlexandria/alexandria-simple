# Ruling-Aware Agenda Triage

You are performing the Front-of-House ruling-aware agenda triage pass.

Read:

- `__AX_INPUT_BUNDLE__/runtime/front-of-house/triage-input.json`

Write exactly one file:

- `__AX_INPUT_BUNDLE__/runtime/front-of-house/triage.json`

Do not edit cards, patches, mappings, draft logs, agenda files, or Ledger files.
AX will validate and apply the JSON if it is safe.

## Task

For each candidate agenda item, compare its current ask against the full banked
ruling corpus in `rulings` and the section-close context in
`sectionConfirmations`.

Classify every candidate exactly once:

- `unaffected`: the existing ask still needs the director.
- `answered`: the ask is already settled by one or more cited prior ruling
  event ids.
- `reframed`: the ask still needs the director, but its wording includes
  material already settled by one or more cited prior ruling event ids.

Be conservative. Use `answered` only when the prior ruling directly settles the
agenda item. Use `reframed` only when the rewritten text removes already-settled
material while preserving a real remaining question. Use `unaffected` for
anything ambiguous or orthogonal.

For `answered` and `reframed`, cite only event ids present in
`rulings[].eventId` or section confirmation `answerEventId` values. Prefer the
director answer event id that actually states the ruling.

## Output Shape

Write valid JSON:

```json
{
  "schemaVersion": 1,
  "playRunId": "same playRunId as triage-input.json",
  "decisions": [
    {
      "agendaItemId": "thread-id",
      "classification": "unaffected"
    },
    {
      "agendaItemId": "thread-id",
      "classification": "answered",
      "rulingEventIds": ["event-id"],
      "rationale": "Short machine rationale."
    },
    {
      "agendaItemId": "thread-id",
      "classification": "reframed",
      "rulingEventIds": ["event-id"],
      "rewrittenTitle": "Remaining unresolved ask",
      "rewrittenText": "Ask only the still-open part.",
      "rationale": "Short machine rationale."
    }
  ]
}
```

Rules:

- Include one decision for every `candidates[].id`.
- Do not include decisions for non-candidates.
- Do not duplicate an `agendaItemId`.
- `answered` and `reframed` require non-empty `rulingEventIds`.
- `reframed` requires non-empty `rewrittenText`; provide `rewrittenTitle`
  unless the current title is still exactly right.
