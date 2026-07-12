---
slug: empty-library-confirm
spine: research/testing/
results: unproven
---

# Play Testing - risk map (empty-library-confirm)

EL4 is the single human blocking gate before atomization. Its failure modes are
false approval, stale approval, body-level review, and rejection being mistaken
for approval.

## Coverage

| risk | state | where it is tested / why |
|---|---|---|
| OUT-1 Ledger-only approval | ● covered | AX confirmation tests derive state from event lists only. |
| OUT-2 Non-user approval | ● covered | Confirm command/API require `actor.kind = user`; projection ignores non-user confirm-looking events. |
| CHN-5 Duplicate confirm idempotency | ● covered | Stable idempotency key returns `already_appended`. |
| OUT-3 Rejection is not approval | ● covered | Rejection uses `library.confirmation_rejected`; approval helper accepts only `library.confirmed`. |
| CHN-1 Stale version cover | ● covered | Status is keyed by exact library version. |
| CHN-2 Dirty bundle confirm | ◐ partial | Manifest hash mismatch blocks confirm; broader filesystem fixture variants remain owed. |
| OUT-4 Body-free catalog | ● covered | Catalog projection omits bodies; browser fixture should seed body text and assert it is absent. |
| OUT-1 Product filing drift | ● covered | Registry files EL4 under Product / Library Operations; built-by is only provenance in the brief. |
| ADV-4 Raven self-approval | ◐ partial | Skill guidance forbids it; adaptive eval coverage remains owed. |

## Eval plan - tests per risk

| risk | test | scope | type | built | target | runs | result |
|---|---|---|---|---|---|---|---|
| OUT-1 | `studio/tools/check-catalog.mjs` confirms Product / Library Operations filing | whole | example | yes | 1 (det) | 0 | — |
| OUT-1 | `library-confirm status` derives approval from Ledger events only | whole | example | yes | 1 (det) | 0 | — |
| OUT-2 | non-user `library.confirmed` event remains not approved | whole | example | yes | 1 (det) | 0 | — |
| CHN-5 | duplicate confirm returns `already_appended` and one Ledger row | whole | example | yes | 1 (det) | 0 | — |
| OUT-3 | rejection appends `library.confirmation_rejected` and no confirm event | whole | example | yes | 1 (det) | 0 | — |
| CHN-1 | version `N` approval does not approve version `N+1` | whole | example | yes | 1 (det) | 0 | — |
| CHN-2 | dirty manifest hash blocks confirm | whole | example | yes | 1 (det) | 0 | — |
| OUT-4 | bundle catalog endpoint omits seeded body text | whole | example | yes | 1 (det) | 0 | — |
| ADV-4 | Raven refuses self-approval in the EL4 skill eval | whole | red-team | no | 30 | 0 | — |

## Fixtures

- Reuse the EL3 `small-el2` bundle after `front-of-house finalize`.
- Add a stale-version fixture by confirming version `N`, editing a card, and
  refreshing the manifest to version `N+1` without confirming.

## Exit Bar

Move to Proven only after AX domain/CLI/runtime tests, viewer confirm/reject
browser coverage, Studio catalog validation, plugin validation, and the Raven
skill eval or an explicit unavailable-eval note.
