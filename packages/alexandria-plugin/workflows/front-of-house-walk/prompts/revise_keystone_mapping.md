# Revise the Proposed Index-Card Mapping

You are inside the `front-of-house-walk` play after the director corrected the
proposed index card rendered from a frame-level product-map ruling.

Inputs:

- bundle: `__AX_INPUT_BUNDLE__`
- pending gate: `__AX_INPUT_BUNDLE__/runtime/front-of-house/keystone-gate.json`
- correction artifact:
  `__AX_INPUT_BUNDLE__/runtime/front-of-house/keystone-gate-correction.json`
- current item: `__AX_INPUT_BUNDLE__/runtime/front-of-house/current-item.json`
- current item for Raven: `__AX_INPUT_BUNDLE__/runtime/front-of-house/for-raven.md`
- answer receipts: `__AX_INPUT_BUNDLE__/runtime/front-of-house/answers/`
- patch target: `__AX_INPUT_BUNDLE__/runtime/front-of-house/patch.json`

Read the pending gate, correction artifact, current proposed index card, and
matching correction answer receipt. The correction artifact names the
`correctionAnswerEventId`; the revised mapping patch must cite that event.

Write exactly one replacement JSON patch file at the patch target with this
shape:

```json
{
  "schemaVersion": 1,
  "patchId": "patch-proposed-index-card-approval",
  "agendaItemId": "proposed-index-card-approval",
  "answerEventId": "correction-answer-event-id",
  "resolution": "resolved",
  "cardUpdates": [],
  "containerMapping": [
    {
      "from": "product-shell",
      "disposition": "rename",
      "to": "viewer",
      "basis": "director corrected the proposed card to say Viewer"
    }
  ]
}
```

Rules:

- Use `agendaItemId` from `current-item.json`; it should be
  `proposed-index-card-approval`.
- Use `answerEventId` from `keystone-gate-correction.json`:
  `correctionAnswerEventId`.
- Stay at container altitude. Revise only `containerMapping`.
- Use the original source container names from the pending gate unless the
  pending gate explicitly says otherwise.
- `containerMapping[].disposition` is a closed set: `keep`, `rename`, `merge`,
  `demote`, `hold`. Unlisted containers are `keep`.
- `rename` uses `to` for the new container name. `merge` uses `to` for the
  surviving container. `keep`, `demote`, and `hold` use `to: null`.
- Use `hold` for ambiguity instead of guessing.
- Keep `cardUpdates` as an empty array. AX derives rename/merge card fan-out.
- Do not include `keystoneDraft`. AX renders and validates the proposed index
  card from this revised mapping.
- Do not enumerate card membership.
- Do not write card files.
- Do not open another director loop inside the prompt.
- This is the only mapping revision pass.

When the replacement patch file is written, reply with one line:

`FRONT_OF_HOUSE_PATCH_READY`
