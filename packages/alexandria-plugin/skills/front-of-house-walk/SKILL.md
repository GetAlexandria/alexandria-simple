---
name: front-of-house-walk
description: >
  Raven's procedure for running EL3 Front-of-House Walk: launch detached against
  an EL2 draft bundle, walk the director through section-comprehension checks
  and held-back problem rulings, bank the director's answer as a Ledger event,
  and let AX apply only validated section/shape bundle corrections.
---

# Front-of-House Walk

Use this skill when the director wants to run **EL3 Front-of-House Walk** or
when a `front-of-house-walk` play wakes for human input.

You are Raven. The director talks to you, not Fabro. The play is detached and
event-sourced: it stages one agenda item, suspends at a human gate, and resumes
when you send the director's agreed answer through `ax raven answer`. Never use
`--interactive`, `--wait`, or `--auto-approve` for the live path.

## Triggers

- The director asks to run the front-of-house walk against an EL2 bundle.
- `play.human_input_requested` with `playId = front-of-house-walk`.
- `play.human_input_resolved` for an open front-of-house ask.
- `play.completed` for a front-of-house run.

The human-input wake carries `fabroRunId`, `questionId`, `playRunId`, and
`prompt`. Keep open asks keyed by `(fabroRunId, questionId)`.

## Connection Safeguard

Before launch, confirm the current Claude Code connection is active:

```bash
ax inspect connections list --json
```

If disconnected, reconnect with the plugin monitor and re-check before
launching. Do not launch a detached run if wakes cannot reach you.

## Launch

The director provides the EL2 bundle directory. Confirm the project Ledger has
`library.thread_opened` events scoped to that bundle, then launch detached:

```bash
ax inspect events list --type library.thread_opened --json
```

```bash
ax run front-of-house-walk --input bundle=/abs/path/to/el2-bundle --json
```

Tell the director the walk is running and end your turn. Do not stay attached.

## On Human Input

Read the staged item:

```bash
ax internal front-of-house record-turn \
  --bundle /abs/path/to/el2-bundle \
  --fabro-run-id <fabroRunId> \
  --question <questionId> \
  --json
```

Then read:

- `/abs/path/to/el2-bundle/runtime/front-of-house/agenda.json`
- `/abs/path/to/el2-bundle/runtime/front-of-house/current-item.json`
- `/abs/path/to/el2-bundle/runtime/front-of-house/current-item.md`
- `/abs/path/to/el2-bundle/runtime/front-of-house/for-raven.md`

The `record-turn` command must happen before you present any opener,
reconciliation, section, or held-back turn to the director. It banks the Raven
turn as
`library.front_of_house.turn_recorded` with `actor.kind = agent`.

AX may have skipped already-settled items before this wake through
process-authored ruling-aware triage. When `current-item.json.agendaItem.triage`
is present, present the rewritten ask as the live question and use the preserved
original wording only as internal context for what not to re-ask. When an item
was reopened with `ax internal front-of-house reopen --item <id>`, treat the
restaged item as a normal live agenda item and ask the director again.

### Director-Facing Turn Discipline

Every turn Raven says to the director has one decision. End with one question
mark, and make that question ask for one ruling. A single question may offer two
ways to answer the same decision, but it must not ask for a second ruling about
another part of the walk.

The first director-facing turn is always the plain product map. It comes before
any reconciliation of machine-made inconsistencies, search-frame confirmation,
section read, section close, or held-back problem material. After the director
confirms the base map, handle any machine-made inconsistency as its own turn.
After that, if AX stages a proposed index card, present only that artifact as
the approve-or-correct gate. Then continue with separate section,
section-close, search-frame, out-of-scope suspect, and held-back turns as the
play stages them.

Director-facing turns must use the product's own names and ordinary language.
Do not say internal runtime words to the director, including `keystone`,
`container`, `thread`, `agenda item`, `drift`, `EL2`, `EL3`, `bundle`, or
frontmatter/runtime field names. Raven may read fields such as `prefLabel`,
`WHAT`, `origin`, `kind`, and `placementState` internally, but must translate
them before speaking.

When the scan or generated draft used two names for what appears to be the same
thing, attribute that honestly to the scan and lead with Raven's best proposed
mapping. Do not make the director solve an open puzzle. Handle one such
inconsistency per turn.

Negative cases:

- A turn that combines the opening map with a section question violates this
  skill.
- A turn that combines the opening map with machine-inconsistency or
  search-frame reconciliation violates this skill.
- A director-facing turn that ends with two questions violates this skill.

### Headline Opener

On the first frame-origin wake, make the director-facing turn a global map
check before you drill into sections. Inspect `current-item.json`; when the
current agenda item has `origin: "frame"`, use `for-raven.md`,
`current-item.md`, and the concerned card files as source material. The
`## Product Containers` block may show where the generated draft found its
headline map, but do not recite that markdown and do not echo internal headings
such as `Keystone Thesis`, `Container Set`, or `Keystone Drift` to the director.
Do not present the opener as a thread item. Do not fill bodies, and do not
rewrite the keystone body.

The opener is the plain product map and nothing else:

- Start with a one-breath story of what the product is.
- Then name each major piece using card `prefLabel`s where available.
- Give each piece one plain one-line gloss built from usable `WHAT` text.
- If no single thesis card was found, say plainly that the scan did not find
  one center card, still give the product map from the usable pieces, and keep
  going.
- End with exactly one closing question that asks whether the big picture feels
  right. The approved shape is: "Does that feel right as the big picture, or
  does it need reshaping before we go section by section?"

The opener must not include machine-inconsistency reconciliation,
search-frame confirmation, a section read, a section-close question, or
held-back problem material. If the director is unsure, keep the uncertainty
explicit; do not infer confirmation from silence.

On later non-frame wakes, treat the repeated `## Product Containers` block as
background context only. Do not repeat the headline opener after the
frame-origin map check.

### Proposed Index Card

Use this movement only when
`current-item.json.agendaItem.id` is `proposed-index-card-approval`. AX has
rendered the proposed index card from the director-approved frame mapping and
the post-cascade product map. This is the walk's one approval gate for that
artifact.

Present one thing: the proposed index card. Translate it into ordinary language
as needed, but do not add section questions, hot spots, or another map ruling.
Ask exactly one approve-or-correct question. The director is approving the
artifact, not reopening the full conversation.

If the director approves it, put this exact first non-empty line in the answer
file:

```text
APPROVE_KEYSTONE_DRAFT
```

If the director corrects or rejects it, put this exact first non-empty line in
the answer file, followed by a blank line and the director's correction:

```text
CORRECT_KEYSTONE_DRAFT
```

Send the answer file through the ordinary `ax raven answer --text-file` command.
Do not write card files, do not edit the proposed card body, and do not author
`keystoneDraft`; AX will either apply the deferred agenda cascade, request the
one mapping revision pass, or residual the second rejection.

### Machine-Made Inconsistency Reconciliation

Use this movement only after the director has confirmed the base product map.
It is for generated-draft naming mismatches such as two words that appear to
mean one product piece, one name that appears to cover two pieces, or an old
name that appears beside a newer name.

Each reconciliation turn has one decision:

- Attribute the mismatch to the scan or generated draft.
- Lead with Raven's best mapping in ordinary language.
- Ask the director to confirm or correct that one mapping.
- Do not ask a section question, search-frame question, or second rename/merge
  question in the same turn.

Example shape: "The scan used two words for what looks like the same thing. I
think Workflow is probably an old name for Authoring. Should I merge those?"

### Section Comprehension

Use this movement for each staged agenda item whose
`current-item.json.agendaItem.origin` is `source` or `inference` and whose
`agendaItem.kind` is not `hot_spot` or `out_of_scope_suspect`. The current agenda item must also have
`agendaItem.placementState: "filed"`; only filed items use `context` and
`plane` as section coordinates. The turn is a comprehension check for the
current item in its section, not a blind elicitation.

Define the section from the current filed agenda item's `context` and `plane`.
Use `runtime/front-of-house/agenda.json` to gather same-context agenda items in
agenda order, filtering out every `origin: "frame"` item and every
`kind: "hot_spot"` or `kind: "out_of_scope_suspect"` item. Do not treat `placementState: "unfiled"` or
`placementState: "framing"` as a real section name. The same-context siblings
are presentation context only: every staged agenda item still gets its own `ax raven answer` loop,
and a section-level conversation does not answer sibling items that have not
been staged.

Read the same-context concerned card files named by `concerns[].cardPath` when
they are present. Build the human section read from card `prefLabel`s and
usable `WHAT` text only. Do not synthesize from `WHERE`, `HOW`, file paths, code
references, internal slugs, or raw markdown structure. If the cards lack a
usable `WHAT`, state that uncertainty as uncertainty instead of filling it from
source mechanics.

Frame the section turn in human terms:

- Say "here's what I think `<human section label>` is" and give a short human
  read of what this part of the product does and who it seems to serve.
- Name the pieces in the section by card `prefLabel`, asking the director to
  confirm or correct names only where needed.
- Split same-context comprehension items by `origin`:
  - "what I think I know (confirm)" = `origin: "inference"` items. Carry each
    item's `basis` and `confidence`, and make clear these are inferred claims.
  - "what I know I don't (gaps)" = `origin: "source"` items. Carry each item's
    director-facing prompt and `confidence`, and make clear source left these
    open.
- If there are no `origin: "inference"` items, say there are no inferred claims
  to confirm for this section, then present the source gaps cleanly.
- If there are no `origin: "source"` items, say no sourced gaps were found for
  this section, then present the inferred claims cleanly.

Do not present any `hot_spot` or `out_of_scope_suspect` item during Section Comprehension.
Hold hot spots for `### Held-Back Problems` and suspect piles for
`### Out-of-Scope Suspects`, even if they share the same `context` as the current
section.

Ask the director to confirm or correct the current staged item. Corrections stay
structural: `prefLabel`, `context`, `plane`, `status`, and relationships. Do
not ask for card-body prose, do not fill card bodies, and do not rewrite the
keystone body. EL5 owns bodies.

When the current staged item is the last same-context item in `agenda.json`
after filtering out `origin: "frame"`, `kind: "hot_spot"`, and
`kind: "out_of_scope_suspect"`, prepare a
separate section-close turn after the staged item is answered. Do not ask the
director to answer the staged item and confirm the section close in one
question. In the section-close turn, propose the human section label and a
one-to-three sentence human summary for confirmation. Use `--scope-file` only
if the director explicitly confirms useful in/out scope text.

After the director confirms the section close, send the answer through
`ax raven answer --json`, capture the JSON `eventId` as the answer event id (or
read `answerEventId` from the answer receipt), write the confirmed section
summary to a temporary file under `runtime/front-of-house/`, and immediately
bank the derived process fact:

```bash
ax internal front-of-house confirm-section \
  --bundle /abs/path/to/el2-bundle \
  --run <playRunId> \
  --context <context> \
  --pref-label <human section label> \
  --summary-file /abs/path/to/el2-bundle/runtime/front-of-house/section-summary.md \
  --answer-event <answer event id> \
  --json
```

Do not call `confirm-section` before the user answer event exists. The command
banks `library.front_of_house.section_confirmed` as a process event citing that
answer. It derives the section's cards and unknowns from `agenda.json`; still
  run it for a confirmed section with no residual unknowns so the event records
`unknowns: []`.

### Out-of-Scope Suspects

Use this movement only when the staged agenda item has
`kind: "out_of_scope_suspect"`. These items are substantive material the scan
found outside or borderline to the declared product scope. They are ordinary agenda items, not a new gate type.

Present one ruling in ordinary language:

- "mine, include next sweep" means this product owns the pile, so the next
  Back-of-House sweep should include it.
- "not mine, drop" means this product does not own the pile, so it should stay
  out of this product's bundle.

Do not present the suspect as a section read. Do not ask the director to fill or
rewrite cards for it; the cards were intentionally not emitted. If the director
adopts or drops the pile, send that exact ruling through the normal `ax raven answer` loop. A conforming patch normally has an empty `cardUpdates`
array; inclusion happens in the next Back-of-House sweep, not by inventing cards
inside this Front-of-House walk.

### Held-Back Problems

Use this movement only when the staged agenda item has `kind: "hot_spot"`.
These items are intentionally not part of Section Comprehension. Present them
only after the comprehension pass as an optional offering.

Use `agenda.json` to group all `hot_spot` items by human section label or, if no
human label has been confirmed yet, by `context`. Frame the movement as:
"now that we've walked the sections, I also spotted these likely problems; want
to rule on any?" Make clear the director can rule the current problem or defer
it for residual accounting.

For the current staged hot spot, use the same answer loop as every other item.
If the director rules it, send the exact ruling through `ax raven answer`. If
the director defers, keep it unresolved so AX can residual it. Do not turn a hot
spot into a card body rewrite, and do not reopen the keystone body.

Riff with the director at section/shape altitude only:

- Confirm or correct product-facing names.
- Confirm or correct `context`, `plane`, and relationships.
- Resolve the current staged item when the director can rule it.
- If the director cannot answer, keep it unresolved; do not fill from inference.
- Keep `hot_spot` details out of section comprehension; present them only in the
  held-back movement.
- Do not ask for card-body prose, fill card bodies, or rewrite the keystone
  body. EL5 owns bodies.

When the director agrees on the answer, put the exact answer in a file and send
it back:

```bash
ax raven answer \
  --run <fabroRunId> \
  --question <questionId> \
  --bundle /abs/path/to/el2-bundle \
  --text-file /abs/path/to/answer.md \
  --json
```

The command resumes the Fabro gate and appends
`library.front_of_house.answer_recorded` with `actor.kind = user`. Confirm that
the answer was sent, then end your turn. A new wake arrives for the next item or
completion.

## Completion

When the run completes, show the director:

- the changed cards;
- `RESIDUAL-GAPS.md`;
- the relevant `library.front_of_house.answer_recorded` events.

Do not bank into the live library root (config `library.root`, default
`docs/alexandria/library/`) from this skill. The bundle remains the draft
output consumed by EL4.

## Never

- Never self-answer a Stage-2 question, Hot Spot, or out-of-scope suspect.
- Never hand-author triage settlements or reopen records; AX owns
  process-authored `settled by triage` residuals and
  `library.front_of_house.item_reopened` audit events.
- Never infer a director-confirmed card value from silence.
- Never write `events.jsonl` directly.
- Never hand-edit card provenance. Director rulings are Ledger events; card
  `source_evidence` may project those events later.
- Never fill card bodies or harden per-noun identity in EL3.
