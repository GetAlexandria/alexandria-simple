<!-- Filed as GitHub issue #490 (slice D2 of the FoH walk methodology reshape).
     Tuned against #485's shipped section_confirmed event. fabro:ready withheld. -->

# EL5 atomizer: consume section_confirmed as the human-language prior for card bodies

Plan: `front-of-house-walk-reshape` (`plan.md` §11 "EL5 read" + Buildability; `walk-spec.md` "section close")
Tier: should | Blocked by: #485 (`section_confirmed` event) | Blocks: none
Data model: event `library.front_of_house.section_confirmed` (from #485); the EL5 contract / prompt input

## Summary

Make the EL5 atomizer read the `section_confirmed` event for a card's `context` and
use its human summary/label as the prior when drafting the card body — so EL5 writes
human-facing `WHAT`/`WHERE`/`HOW` instead of regurgitating the source's computer-ese
(file paths, internal slugs).

## Motivation / Problem

EL5's body-drafting prompts read files only (`build-atomic-card/prompts/
draft_or_repair.md`: *"Read only: contract, source ranges, confirmed stub, prior
candidate"*) and write `WHAT`/`WHERE`/`WHY`/`WHEN`/`HOW` from the source ranges —
which are computer-ese (`StudioApp.tsx`, `` the `graduated[]` set ``). D1 (#485) now
banks a director-confirmed human summary per section. This wires that summary into
EL5 so the human framing actually shapes the prose.

## Current shape (the working sibling)

EL5 already consumes the Ledger on its publish path (`publishAtomicCard` /
`loadConfirmedLibraryInventory`, `atomic-cards.ts`, which filters events by
type + actor to gate on `library.confirmed`). Reading another FoH event is the
established pattern — but the *drafting prompt* is file-only, so the summary must be
resolved into a prompt-input file.

## Proposed contract

- EL5's plan/contract step resolves, for each card, the
  `library.front_of_house.section_confirmed` whose `context` matches the card's
  `context`, and writes its `summary`/`prefLabel`/`scope` to a prompt-input file
  `__AX_INPUT_SECTION_SUMMARY__` (a sibling of the contract).
- `draft_or_repair.md` gains the section summary to its "Read only" inputs and is
  instructed to frame `WHAT` from the summary, render `WHERE` in product terms (not
  source paths), and drop internal slugs from `HOW` — within the confirmed `scope`.

Decisions:

- **Matching key** = the card's frontmatter `context` == `section_confirmed.context`.
  No match → no summary input (EL5 falls back to today's source-only behavior; not an
  error).
- **Prior, not override:** source ranges still ground the facts; the summary governs
  register/framing. The body still must pass the existing grade (all five sections
  present).
- **Read-only of the event:** D2 changes EL5 inputs/prompts only, not the FoH event.

## Acceptance criteria

- For a card whose `context` has a `section_confirmed`, the EL5 build resolves a
  `__AX_INPUT_SECTION_SUMMARY__` carrying that summary/label/scope; the drafted
  body's `WHERE` is in product terms (no raw source path the summary didn't sanction)
  and it uses the confirmed human label.
- **Negative / degraded:** a card whose context has no `section_confirmed` builds
  exactly as today (source-only) — no regression.
- The published body still passes the existing grade (`WHAT`/`WHERE`/`WHY`/`WHEN`/
  `HOW` present).
- **Test matrix:** card with a matching `section_confirmed` (human `WHERE`, confirmed
  label); card with no match (source-only regression); grade still passes; the
  summary changes register but not the sourced facts.

## Implementation notes

- Touches the EL5 atomizer: the `atomic-card-planning` / `build-atomic-card`
  workflows + prompts, and `packages/ax/src/domain/atomic-cards.ts` /
  `commands/cards.ts` for the input resolution. The FoH `section_confirmed` event
  (#485) is read, not modified.
- Out of scope: emitting the event (#485); the FoH walk methodology.
