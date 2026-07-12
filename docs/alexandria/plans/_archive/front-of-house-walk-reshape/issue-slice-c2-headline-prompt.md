<!-- Filed as GitHub issue #489 (slice C2 of the FoH walk methodology reshape).
     Tuned against #483's shipped `## Product Containers` render. fabro:ready withheld. -->

# Front-of-House walk: Raven's headline opener — present the container set + drift, confirm the canonical pieces

Plan: `front-of-house-walk-reshape` (`plan.md` §4 Turn 0, §8 slice C2; `walk-spec.md` Turn 0)
Tier: should | Blocked by: #483 (headline projection) | Blocks: none
Data model: **keystone**, **container** (= `context`), **plane**; the #483 `headline` object (`keystone` / `containers` / `drift`)

## Motivation

"As a director, before you walk me through my product section by section, I want
Raven to show me her read of the *whole* thing — the major pieces and where her
understanding is shaky — so I can correct the map before we drill in." The headline
is the highest-leverage confirmation (it propagates atop the Index). #483 produces
the data (container set + keystone thesis + drift); this makes Raven present it as a
human opener and drive the reconciliation.

## Description

At the start of the walk, before any section item, Raven reads #483's `headline` and
opens with a comprehension-check turn: *"Here's my read of your whole product:
[keystone thesis in human terms]. Your major pieces look like: [containers]. A few
I'm unsure of: [the drift — named-but-empty, present-but-unnamed]."* The director
confirms or corrects the canonical container set + human names; renames flow through
the existing answer → `apply_bundle_patch` loop (`context` is an allowed field). It
also folds in the search-frame confirmation (the `frame`-origin item).

## Context

Blocked by #483 (the deterministic `headline` projection + render). **In:** Raven's
opener framing + the reconciliation conversation. **Out:** the projection itself
(#483); the per-section comprehension framing and held-back framing (the capstone);
any new patch/event semantics (reuse the existing loop).

## Acceptance criteria

- The walk's first director-facing turn presents the container set + keystone thesis
  (human) + the two drift lists, sourced from #483's `headline` — not a raw agenda
  item.
- Raven's turn banks as `turn_recorded` (agent); the director's confirmation as
  `answer_recorded` (user); container renames apply via the existing patch loop (no
  new event/patch type).
- The `frame`-origin search-frame ("we assumed X, fenced out Y — right?") is
  presented as part of this opener, not as a mid-walk item.
- **Negative:** the opener does not rewrite the keystone body (structure only); no
  card body is written.
- **Degraded:** if `headline.keystone` is null (no keystone card), the opener still
  presents `containers` and proceeds (no crash).

## Implementation notes

- Prompt/skill layer for `front-of-house-walk` (its `SKILL.md` / workflow prompts).
  **Tune the framing against #483's actual rendered `for-raven.md` headline block** —
  that's why this is filed *after* #483 lands.
- Out of scope: the deterministic projection (#483); held-back framing (B is the
  ordering; its spoken framing is the capstone); `section_confirmed` (D1/D2).
