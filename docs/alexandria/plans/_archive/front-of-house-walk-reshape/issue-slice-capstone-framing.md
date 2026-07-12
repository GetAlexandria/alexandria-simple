<!-- Filed as GitHub issue #492 (capstone — FoH walk methodology prompt).
     Tuned to mirror the `### Headline Opener` #489 landed in front-of-house-walk
     SKILL.md. fabro:ready withheld. -->

# Front-of-House walk: the section-comprehension stance + held-back hand-off (Raven prompt)

Plan: `front-of-house-walk-reshape` (`plan.md` §4 Turns 1..N+1, §8 capstone; `walk-spec.md` Turn 1..N, Turn N+1)
Tier: should | Blocked by: #489 (same `SKILL.md` — sequential) | Blocks: none
Data model: agenda item `origin` (`source`|`inference`|`frame`), `kind` (`stage2_question`|`hot_spot`), `context`; event `section_confirmed` (#485)

## Motivation

"As a director, I don't want to be interrogated — I want Raven to tell me what she
thinks each part of my product is and where she's unsure, so I can just confirm or
correct. And only once we've been through it, show me the problems." This is the
heart of the reshape: comprehension-check, not blind elicitation; problems as a gift
at the end.

## Description

The prompt/skill layer for the per-section walk (after the C2 headline opener). For
each section (`context`), in the order `prepare-agenda` produces:

- Raven presents a **comprehension turn**: "here's what I think [section] is [human
  summary, de-jargoned from the cards' `WHAT`s — not the `WHERE`/`HOW` code refs];
  the pieces here are [card prefLabels]; what I think I know (confirm) [origin =
  `inference` items]; what I know I don't (gaps) [origin = `source` items]."
- The director rules items via the existing answer loop; structural corrections
  patch as today.
- **Section close:** Raven proposes the human section summary; the director confirms;
  Raven calls `ax internal front-of-house confirm-section` (#485) to bank
  `section_confirmed`.

After the whole comprehension pass, the **held-back movement** (`hot_spot` items,
already ordered trailing by #484): Raven offers "now that we've walked the sections,
I also spotted these likely problems — want to rule on any?", grouped by section.

## Context

Builds on #484 (held-back ordering — merged), #485 (`confirm-section` — merged), and
#482/#483 (triage fields + render — merged). **Blocked by #489 only** because both
edit the same `front-of-house-walk` `SKILL.md` / prompts — build sequentially. **In:**
the section comprehension stance + the section-close `confirm-section` call + the
held-back hand-off framing. **Out:** the deterministic ordering (#484), the
`confirm-section` command (#485), the headline opener (#489).

## Acceptance criteria

- Each section turn presents Raven's human read + "what I think I know / what I
  don't," sourced from the agenda items' `origin`/`confidence` (no raw computer-ese
  `WHERE`/`HOW` at the director).
- No `hot_spot` item is presented during the comprehension pass; they appear only in
  the trailing held-back movement, framed as an optional offering.
- At each section close, when the director confirms the summary, `confirm-section`
  banks one `section_confirmed` citing the user answer (no body written).
- **Negative:** the comprehension turn writes no card body; corrections stay
  structural (`prefLabel`/`context`/`plane`/`status`/relationships) via the existing
  patch loop.
- **Degraded:** a section with no `inference` items (only source gaps) still presents
  cleanly; a section with no residual still banks `section_confirmed` with
  `unknowns: []`.

## Implementation notes

- Prompt/skill layer for `front-of-house-walk` (`SKILL.md` / workflow prompts).
  Sequenced after #489 (same files); tune the section framing to mirror the landed
  headline-opener pattern.
- Relevant current files (orientation): the `front-of-house-walk` skill + workflow
  prompts; the `confirm-section` command (`commands/front-of-house.ts`); the agenda
  item `origin`/`kind` fields (`library-front-of-house.ts`).
- Out of scope: #482/#483/#484/#485 (deterministic, merged); #490 (EL5 consumption).
