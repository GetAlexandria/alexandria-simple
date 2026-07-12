# Plan the Front-of-House Bundle Patch

You are inside the `front-of-house-walk` play after the director answered one
agenda item through Raven.

Inputs:

- bundle: `__AX_INPUT_BUNDLE__`
- current item: `__AX_INPUT_BUNDLE__/runtime/front-of-house/current-item.json`
- current item for Raven: `__AX_INPUT_BUNDLE__/runtime/front-of-house/for-raven.md`
- answer receipts: `__AX_INPUT_BUNDLE__/runtime/front-of-house/answers/`
- patch target: `__AX_INPUT_BUNDLE__/runtime/front-of-house/patch.json`

Read the current item and the matching answer receipt. The answer receipt names
the `answerEventId`; every card update must cite that event. If no answer
receipt exists, stop and say `NO_DIRECTOR_ANSWER_RECEIPT`.

Use `patch-<agendaItemId>` as the legible `patchId` value. AX derives the
canonical patch identity from `agendaItemId` at apply time, so the derived
identity wins even if the written `patchId` disagrees.

Draft exactly one JSON patch file at the patch target with this shape:

```json
{
  "schemaVersion": 1,
  "patchId": "patch-stage2:q1",
  "agendaItemId": "stage2:q1",
  "answerEventId": "ledger-event-id",
  "resolution": "resolved",
  "cardUpdates": [
    {
      "cardPath": "product/agent/Agent - Raven.md",
      "set": {
        "prefLabel": "Raven",
        "context": "Library Operations",
        "plane": "Product"
      },
      "relationships": {
        "related_to": ["Role - Director"]
      }
    }
  ],
  "containerMapping": [
    {
      "from": "product-shell",
      "disposition": "rename",
      "to": "viewer",
      "basis": "director said Viewer, formerly Product Shell"
    }
  ]
}
```

Omit `containerMapping` unless the current item is a frame-origin product-map
ruling.

Do not include `keystoneDraft`. When a frame-origin `containerMapping` is
accepted, AX renders, validates, logs, and stages the proposed index card.

Rules:

- Update only `prefLabel`, `context`, `plane`, `status`, and structured
  relationship lists under `relationships`.
- The only legal `cardUpdates[].set.status` values are `stub`, `confirmed`,
  and `deprecated`. Use `"deprecated"` only for an explicit card-level status
  ruling, never for a frame-map container demotion.
- If the current item has `origin: "frame"` and the director's answer confirms,
  merges, renames, demotes, or holds containers from the product map, express
  the frame-level ruling in `containerMapping` and leave membership fan-out to
  AX. Do not enumerate affected cards for this frame-level mapping.
- `containerMapping[].disposition` is a closed set: `keep`, `rename`, `merge`,
  `demote`, `hold`. Unlisted containers are `keep`.
- `rename` uses `to` for the new container name. `merge` uses `to` for the
  surviving container. `keep`, `demote`, and `hold` use `to: null`.
- `demote` in `containerMapping` means off the product map; it derives no
  `cardUpdates` and never changes card `status`.
- If the director's prose is ambiguous about a container, emit `hold` for that
  container instead of guessing.
- AX enumerates cards from the bundle filesystem and derives
  `cardUpdates[].set.context` for `rename` and `merge`. The planner must not
  infer or list whole-container card membership at frame altitude.
- AX owns the proposed index-card `keystoneDraft`; the planner must not author,
  copy, or repair that field.
- For non-frame items, or for specific cards directly identified by the answer
  and staged evidence, continue to use ordinary `cardUpdates[].set.context`
  updates.
- Each relationship key you set **replaces** that key's whole list; it is not
  merged. List every value the key should keep, not only the one you are adding,
  or the others are dropped from the card.
- Do not fill or rewrite card bodies.
- Do not rewrite the keystone card body to make the headline thesis cleaner.
- Do not write card files. AX applies the patch after validating the Ledger
  answer event.
- If the director confirmed the existing bundle and no card needs changing,
  write a valid patch with an empty `cardUpdates` array.
- If the current item has `kind: "out_of_scope_suspect"`, treat the director's
  ruling as a banked disposition for the next Back-of-House sweep: "mine" means
  include the pile next sweep, and "not mine" means drop it from this product.
  The suspect pile intentionally has no emitted cards in this bundle. Write a valid resolved patch with an empty `cardUpdates` array unless the answer explicitly identifies a safe update to an existing emitted card. Do not create card updates for the absent pile.
- If the director confirms a non-frame container rename but the affected cards
  are not safely identifiable from the current item, answer receipt, and staged
  evidence, write a valid patch with an empty `cardUpdates` array or use the
  unresolved patch shape below. Do not guess card membership.
- If a question remains unresolved, write an explicit unresolved patch instead
  of `cardUpdates`:

  ```json
  {
    "schemaVersion": 1,
    "patchId": "patch-stage2:q1",
    "agendaItemId": "stage2:q1",
    "answerEventId": "ledger-event-id",
    "resolution": "unresolved",
    "reason": "Director could not rule this item yet."
  }
  ```

  AX records it as a residual gap and does not mutate cards.
- The director is ground truth; source evidence is context, not a veto.

When the patch file is written, reply with one line:

`FRONT_OF_HOUSE_PATCH_READY`
