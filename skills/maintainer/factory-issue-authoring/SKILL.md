---
name: alexandria-dev-factory-issue-authoring
description: >
  Author a GitHub issue the Fabro software factory can build well — a product/JTBD
  story or an engineering-RFC, written around observable "what will be true," a frozen
  interface contract with a decisions list, and a verification/test matrix — never a
  file-edit recipe (the factory chooses the files itself). Captures the house style
  reverse-engineered from issues labeled `fabro:done` and the curated-best ones Jess
  labels `enhancement`. Use when writing or refining GitHub issues in this repo to
  dispatch to the factory.
---

# Authoring Factory Issues

Contributor workflow guidance for this repository — how to write a GitHub issue the
**Fabro software factory** builds correctly in one autonomous pass. It is not a product
skill for downstream Alexandria users.

## The core contract

A factory issue is a **user story / JTBD story with a bar for "done," not a technical
plan.** You own the **nouns, the behavior, the decisions, and how to verify it works**.
**The factory owns the files** — never hand it a file-edit checklist; that is the
"technical" register the curated-best issues avoid.

Two things separate a buildable issue from a vague one:

1. **Observable "what will be true" when it's done** — every criterion is something you
   can *see, run, or query*, not "works well."
2. **Decision density** — wherever the ask has a fork (a param name, a precedence rule, a
   data shape, a scope edge), the issue *closes it* so the factory never has to guess.

## Two blessed formats — pick by ticket type

Both build reliably; choose by what the ticket touches.

| Ticket is… | Use | Examples |
|---|---|---|
| A user-facing product capability / UI / agent behavior | **Format A — Product feature (JTBD)** | #187, #193, #194, #294 |
| Infra / CLI / runtime / route / a bug fix | **Format B — Engineering RFC** | #229, #221, #216, #174, #276 |

### Format A — Product feature (the `cl-ticket` / FEAT skeleton)

```
<!-- cl-ticket: <PREFIX-NNN> | plan: <plan-slug> -->
Plan: <plan-slug>
Outcome: <one line> | Tier: must|should|could | Enabler: yes|no
Blocked by: <ids|none> | Blocks: <ids|none>
Data model: <link to the authoritative doc> — <the 3-6 nouns this story uses>

## Motivation        first-person JTBD: "As a <role>, I want <X> so that <Y>." A real user quote is gold.
## Description       what the capability is, in product nouns
## Context           link the plan.md / data-model doc; what's in vs out of THIS slice
## Acceptance Criteria   observable checkboxes — exact strings, named events, the NEGATIVE case
## Verification      a runnable per-surface script:  ### Web UI / ### CLI / ### Data
## Implementation Notes   scope guidance + "prefer/reuse <asset>"; never a file recipe
## Visual Direction  (UI tickets only) "source it from <prototype>, not a generic admin UI"
```
The template **flexes down**: a prompt/skill ticket may drop Verification and Visual
Direction and just carry Motivation → Description → Context → Acceptance Criteria →
Implementation Notes (see #53).

### Format B — Engineering RFC (infra / CLI / runtime / bug)

```
## Summary            1-3 sentences: what + why now
## Motivation / Problem   why this matters; for a bug, the cost/impact
## Observed behavior  (bug only) concrete repro of the defect
## Current shape      (bug only) the working sibling path beside the broken one — fix = "make B match A"
## Proposed <contract>    a LITERAL table / URL / command / JSON / event list + a `Decisions:` list
## Acceptance criteria    observable; include negative + idempotency + degraded-state; END with the test matrix
## Implementation notes / Notes   scope fences; "Relevant current files:" as orientation only
```

## The quality bar (what earns `enhancement`)

These are the differentiators of Jess's curated-best set. Hit them.

- **One capability per issue.** Decompose the rest via `Blocked by` / `Blocks`. (FEAT-001…010
  is the model: ten slices, each one observable change.)
- **Freeze the interface as an artifact.** Anything touching a URL, route, CLI command, JSON
  shape, or event type gets a *literal example* plus a `Decisions:` list that resolves every
  ambiguity — param names, multiplicity, precedence, what's preserved. (#229 is the gold standard.)
- **Acceptance includes the negative and idempotent cases**, not only the happy path:
  "does not falsely show…", "duplicate/idempotent appends do not regress state",
  "if already running, make that state clear rather than pretending."
- **Name the test matrix in the Acceptance Criteria** — the cases/surfaces that must be
  covered, including explicit **regression** ("does not regress the default `--no-web` path").
- **State data-model ownership** — what is *stored* vs *derived*, and where it must **not** be
  stored ("future subjects are *derived* from the manifest"; "not stored in `agents.raven`").
- **Ground bug tickets by contrast** — a `## Current shape` showing the correct sibling next
  to the broken path; name the real architectural trap, not just the symptom.
- **Files appear only as orientation**, under "Relevant current files" / "Current shape" —
  **never in Acceptance Criteria, never as a recipe.** A path may appear in acceptance *only*
  when it is itself a user-observable contract ("no `agents.raven.connection` field is written").
- **Aim scope fences at the riskiest over-reach** — blast radius ("scope to `ax2 start server`;
  `start all` unchanged"), architecture ("keep Effect at the runtime API boundary"), or concept
  ("the screen should not imply Knowledge Bank subjects are Library cards").
- **Reuse canonical nouns**; put state values in `backticks` from a closed set; don't invent
  synonyms. Declare the nouns in the `Data model:` / `Cards:` line.
- **Efficiency/reliability tickets: quantify cost + pre-empt objections** ("≈3 extra invocations,
  ~4-5 min/run"; "this is *not* a known false positive because…").
- **Warn off stale work** when a prior run went sideways ("a prior run produced a PR against the
  stale `tmp` branch; that does not satisfy this issue for `main`").
- **Spec ≠ copy.** Data-model, acceptance, and validation language is for the *builder*, never the
  *screen*. A surface renders product copy, not the criteria it was built against — a rationale
  lede ("the face agent is *derived from* the division…") or a "contract valid ✓" banner restating
  the acceptance is the tell. If a surface needs visible text, write the exact copy in the issue;
  otherwise state "no rationale/validation text in the UI — the data model is builder context, not
  on-screen copy." Validation belongs in a build-time check, not a banner.

## The data-model / noun header — pairs with the `Cards:` reference, doesn't replace it

Binding nouns has a lifecycle. The curated-best issues mostly *reference* established nouns;
a noun header is what you use *before* a noun is established. Both are correct at their stage:

- **New nouns (not yet library Cards)** — lead the metadata with a compact **Data model** block
  that *defines and relates* the handful of nouns the story uses, and link the authoritative doc.
  This is the right move while vocabulary is still settling (e.g. a freshly-ruled org model).
- **Established nouns (have library Cards)** — switch to the mature form: a `Cards:` line plus
  inline `[[Card - Name]]` references. You *reference*, you don't redefine. The noun header
  graduates into this as its nouns become real Cards.
- **Always** — carry the data-model *ownership* assertions in Acceptance (what's stored vs
  derived, where state must **not** live). That is a behavior constraint neither form covers.

Keep the header to the nouns the story actually uses; let the linked doc carry the full model
(one source of truth, no drift).

## Labels & lifecycle

- **`cl-ticket`** — marks the FEAT/filesystem-ticket family (pairs with the `<!-- cl-ticket -->`
  header). Standalone RFC issues may omit it.
- **`tier:must` / `tier:should` / `tier:could`** — mirror the in-body `Tier:` field.
- **`fabro:ready`** — **the trigger.** Applying it hands the issue to the local Fabro watcher.
  Then the lifecycle is a label state machine: `fabro:submitted` → `fabro:running` →
  `fabro:done` (success) | `fabro:failed` | `fabro:needs-human`. **Do not apply `fabro:ready`
  until the issue is meant to dispatch.**
- **`enhancement`** — the maintainer's quality flag for a *well-written* issue. Treat it as the
  bar to clear, and browse `label:enhancement` for the current curated set.

## Anti-patterns

1. **Prose where a contract belongs** — a route/command/JSON change described only in sentences.
2. **Happy-path-only acceptance** — no negative, idempotency, or degraded-state assertion.
3. **Unbounded scope** — not saying which sibling surfaces/commands stay untouched.
4. **Files-as-recipe** — listing files to edit as the instruction.
5. **Ungrounded bug tickets** — "X is broken" with no repro and no working-sibling contrast.
6. **Invented vocabulary** — new synonyms for established nouns / state values.
7. **Bundling capabilities** — two changes in one issue instead of a `Blocks` chain.
8. **No plan link / no dependency graph.**
9. **Spec-as-copy** — data-model / acceptance / validation language rendered as on-screen UI text (rationale ledes, "contract valid" banners). The spec is the builder's context, not product copy.

## Before you submit — the checklist

- [ ] One capability; the rest chained via `Blocked by` / `Blocks`.
- [ ] Every acceptance criterion is observable (see / run / query) — incl. a negative + idempotent case.
- [ ] Any interface (URL / command / JSON / event) is frozen as a literal example + a `Decisions:` list.
- [ ] The test matrix is named in acceptance, with regression assertions.
- [ ] Stored-vs-derived data ownership stated where relevant.
- [ ] No file-edit recipe; files only as "Relevant current files" orientation.
- [ ] Scope fences aimed at the riskiest over-reach.
- [ ] Nouns are canonical + linked; a Data-model header where new nouns appear.
- [ ] Plan/doc linked; Tier + label set; `fabro:ready` withheld until ready to dispatch.

## Gold-standard examples (study these — in this repo)

- **#229** — *the exemplar.* Frozen route table + worked deep-link URL + a `Decisions:` list +
  AC mapping 1:1 to it + a named test matrix + architectural fences. "Decision density over prose."
- **#193 / #194** — the FEAT pair; data-model ownership ("derived from the manifest", "not stored
  in `agents.raven`") and one-line data-model scope fences ("No Library cards are generated").
- **#187** — the canonical small FEAT: exact CTA strings, negative scope fences, two-surface Verification.
- **#53** — the template flexing down for a prompt/skill change (no UI/CLI Verification), grounded by a real user quote.
- **#216** — grounding-by-contrast (`## Current shape`) and naming the real trap ("config as the projection cache").
- **#221** — blast-radius fence + degraded-state acceptance ("already running… make that state clear").
- **#276** — efficiency/root-cause ticket: quantified cost, line-level cause, pre-empted "known false positive?", stale-work warning.
- **#294** — director-facing Studio feature; the enumerated **"Done when…"** one-liner "on real Fabro data, matching the mock."

## Model phrasings (emulate these — verbatim)

- "When a card URL is opened directly, automatically open its containing folder even if it is not listed in `open=`." *(#229 — a disambiguating decision)*
- "Closing the card drawer removes only `card=` and preserves `open=` params." *(#229 — precise state-preservation rule)*
- "Keep Effect usage limited to the existing runtime API boundary; route parsing and browser history should remain ordinary UI code." *(#229 — architectural fence)*
- "Do not URL-back the search box in this first pass." *(#229 — crisp negative scope fence)*
- "Tests cover direct deep links, navigation clicks, browser back/forward, open-folder URL restoration, and direct card drawer restoration." *(#229 — test-matrix-as-acceptance)*
- "Scope this to `ax2 start server`; `ax2 start all` should keep its current behavior unless intentionally expanded." *(#221 — blast-radius fence)*
- "Duplicate/idempotent appends do not regress state." *(#216 — idempotency acceptance)*
- "Locked and available future subjects are derived from the subject manifest and product rules." *(#194 — derived-vs-stored framing)*
- "Verify play unlock projection, if present, is computed from Knowledge Bank state and not stored in `agents.raven`." *(#194 — negative state-ownership assertion)*
- "No Library cards are generated." *(#193 — one-line data-model scope fence that doubles as an AC)*
