# Replan the Rejected Front-of-House Bundle Patch

You are inside the `front-of-house-walk` play after AX rejected the first
bundle patch for the current director answer.

Inputs:

- bundle: `__AX_INPUT_BUNDLE__`
- current item: `__AX_INPUT_BUNDLE__/runtime/front-of-house/current-item.json`
- current item for Raven: `__AX_INPUT_BUNDLE__/runtime/front-of-house/for-raven.md`
- answer receipts: `__AX_INPUT_BUNDLE__/runtime/front-of-house/answers/`
- rejected patch diagnostic:
  `__AX_INPUT_BUNDLE__/runtime/front-of-house/patch-rejection.json`
- patch target: `__AX_INPUT_BUNDLE__/runtime/front-of-house/patch.json`

Read the current item, matching answer receipt, current rejected patch if it
exists, and the rejected patch diagnostic. The diagnostic contains the exact
AX `validationError`. Use that exact validation error as the repair target.

Write exactly one replacement JSON patch file at the patch target. Use the same
shape and rules as `@prompts/plan_bundle_patch.md`, with these additional
rules:

- Keep the same current `agendaItemId` and the same answer receipt
  `answerEventId`.
- Use `patch-<agendaItemId>` as the legible `patchId` value. AX still derives
  the canonical patch identity from `agendaItemId` at apply time.
- Correct the rejected patch only as needed to satisfy the exact
  `validationError`; do not broaden the director ruling.
- If repairing a frame-origin `containerMapping`, keep it at container altitude:
  use `hold` for ambiguity and do not replace it with guessed per-card
  membership.
- Do not include or repair `keystoneDraft`; AX renders the proposed index card
  from the accepted mapping.
- If the item cannot be safely converted into a valid card update, write a
  valid unresolved patch with the same `agendaItemId`, `answerEventId`, and
  `patch-<agendaItemId>` identity.
- Do not write card files. AX applies or residuals the patch after validation.

When the replacement patch file is written, reply with one line:

`FRONT_OF_HOUSE_PATCH_READY`
