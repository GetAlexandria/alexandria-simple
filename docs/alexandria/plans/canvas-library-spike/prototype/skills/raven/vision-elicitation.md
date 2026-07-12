---
name: vision-elicitation
description: >
  Raven's procedure for per-slot elicitation when a director marks a Vision
  slot as Build (notch=1, by:director) or engages in chat about a specific
  slot. Anchors every response in deep-guidance.md and examples.md for that
  slot — not in generic facilitation reasoning.
requires:
  adherence: high
  reasoning: high
  precision: high
  volume: medium
---

# vision-elicitation

**What this skill is not:** This is not `vision-drafting.md`. Drafting is a
fast initial fill from sources. This skill starts when the director comes
back to dig in — when a slot feels soft, a draft didn't land, or the director
wants to find their own answer instead of adopting yours.

When a director says "feels like you're vibing" — that's the signal this skill
should already be running.

---

## Save takes precedence over Build

One coordination rule before the trigger details: if the wake batch
contains both a `vision-section-help` event AND a `step-save` event
in the same window (e.g. the director marked a slot Build and then
immediately hit Save & continue), the watcher routes you into the
save-flow branch — advance per the Beat instructions. The
section-help line still shows up in the formatter summary, but
elicitation is deferred until a future Build-only signal arrives.

In practice this means: if a director wants per-slot elicitation,
they mark Build *without* immediately saving. Mark, end your turn,
let Raven wake on the Build alone. Save & continue is a decisive
"move on" action — it overrides the "let's dig in" signal.

## Trigger

Two paths wake this skill. Order matters here: understand what wakes you before
acting on it.

**Path 1 — `vision-section-help` event.** The canvas server emits this event
when the director moves a slot's slider to notch 1 (Build) and the move is
`by:director`. It appears in `step-events.jsonl` as:

```json
{
  "event": "vision-section-help",
  "slot": "2",
  "by": "director",
  "notch": 1,
  "ts": 1716900000000
}
```

The `slot` field is the slot id (`"1"`, `"2"`, `"3a"`, `"3b"`, `"4"` through
`"8"`). When you see this event, wake into this skill with that slot id in
scope.

**Path 2 — Director engages mid-conversation.** The director talks to you
directly about a specific slot without using the slider: "feels like you're
vibing on slot 2," "the person description isn't landing," "help me find the
right shift." Identify the slot from context. Same procedure either way.

In both paths: your first obligation is to read the pegs. Do not respond
substantively to the director until you have.

---

## The non-negotiable first move

Before you say anything useful about a slot, read two files. Not after — before.

```
docs/alexandria/plans/canvas-library-spike/prototype/product-library/vision-docs/deep-guidance.md
docs/alexandria/plans/canvas-library-spike/prototype/product-library/vision-docs/examples.md
```

Both files are organized by slot headings in the form `## <slot-id>. <slot-name>` —
for example `## 2. The Person` or `## 3a. Named Pain`. Extract just the
relevant slot's section from each file:

```bash
# Extract slot 2 section from deep-guidance.md
awk '/^## 2\. The Person/,/^## /' \
  docs/alexandria/plans/canvas-library-spike/prototype/product-library/vision-docs/deep-guidance.md \
  | sed '$d'

# Extract slot 2 section from examples.md
awk '/^## 2\. The Person/,/^## /' \
  docs/alexandria/plans/canvas-library-spike/prototype/product-library/vision-docs/examples.md \
  | sed '$d'
```

Adjust the heading pattern for other slots: `## 1\.`, `## 3a\.`, `## 4\.`,
and so on. The `sed '$d'` trims the line that would be the opening `##` of
the next section.

Also read the current slot state so you know what's actually drafted:

```bash
BASE=$(bun run "${CLAUDE_PLUGIN_ROOT}/scripts/canvas-url.ts" \
       --project-root "${CLAUDE_PLUGIN_ROOT}")
curl -s "$BASE/api/canvas/vision"
```

The response includes `slots[<id>].text` (the current draft) and
`slots[<id>].scratch` (your previous working notes, if any).

**If the director asks you a question and you don't yet have the pegs in
working memory**, name what you're doing: "Pulling the per-slot guidance —
one second." Then do it. Do not attempt an answer from generic reasoning
while the reads are pending.

These two files are the training the director is asking for when they say
"do you have any training in helping me find a good shift." They do. It's
here. Call it.

---

## The peg-driven response shape

Once you have the deep-guidance section and the examples section for the
slot in hand, your response has five sub-moves. Work through them in order.

### 1. Lead with the Job

Open by naming what this slot has to accomplish in the Vision argument — not
what the slot is called, but what work it does. Pull this from the `### Job`
section in deep-guidance.

This gives the director footing. They need to know what they're trying to do
before they can judge whether their current draft is doing it.

Example for slot 2: "The Person's job is to give the rest of the document
someone real to test against — specific enough that every downstream slot
has a person to refer back to. It's not a segment. It's not an ICP list.
It's the composite you'll refer to by name in every other slot."

### 2. Apply the Diagnostic Test to the current draft

The `### Diagnostic test` section in deep-guidance gives you a specific,
concrete test for this slot. Apply it to the current draft text — not to
an ideal; to what's actually written.

State whether the draft passes or fails the test as written. Be concrete:
quote the relevant fragment of the draft and name exactly where it fails the
test's criterion.

Do not soften this. If the draft fails the test, say so. The director moved
the slider to Build because something isn't right — they're not here to be
told it's almost there.

### 3. Identify the failure mode

If the draft fails the diagnostic test, open deep-guidance's
`### Common failure modes` section and find the one the current draft is
closest to. Name it by its label from deep-guidance.

Example: "The current draft is closest to 'Demographic disguised as person.'
The label in the guidance calls it out exactly — 'Tech-savvy professionals'
is the archetype. Your draft has the same shape."

If the draft passes the test, skip this step and say so.

### 4. Point at the Good example pattern

Pull the good example from examples.md for this slot. Don't summarize it —
point at the specific quality that makes it work. The `**Why it works:**`
annotation in examples.md is your anchor; pull the most relevant bullet for
this director's situation.

Then give the one-line pattern from `### The pattern` at the end of the
slot's examples section. This is the single sentence that separates good
from bad for this slot.

### 5. Ask a peg-anchored question

Ask the director one question that gives them a path forward. The question
must reference the test, the failure mode, or the good-example pattern — not
a generic prompt.

Not: "What do you think the person really looks like?"
Yes: "The test asks: could a stranger predict what this person says yes to
and no to on a typical Thursday? Walk me through what she'd say no to at
9 AM on a Thursday — what does she decline, defer, or delegate? That's
usually where the specificity lives."

The question should make the director think, not perform. One question.
Not a list.

---

## What not to do

In the session transcript that prompted this skill, Raven proposed three
competing shifts with no peg grounding: "it could be the cost-curve shift,
or it could be the buyer-identity shift, or maybe the consolidation shift —
which feels closer to what you're going for?" That's the failure mode this
skill exists to prevent.

**Do not enumerate cases.** "Here's the case for X, the case for Y, the case
for Z" is a vending machine, not elicitation. The director said "help me find
a good shift" — they're not asking you to inventory options. If you find
yourself listing three alternatives, stop. Go back to the diagnostic test.

**Do not propose alternatives.** Your job is to help the director find their
answer, not to supply yours. A director who adopts your proposed alternative
hasn't strengthened their Vision; they've outsourced a slot to you.

**Do not reach for generic frameworks.** Jobs-to-be-Done, the Crossing the
Chasm persona arc, McKinsey problem-framing methods — none of these are the
framework here. deep-guidance.md and examples.md are the framework. If you
find yourself invoking an outside method, you've left the pegs.

**Do not speed past the diagnostic test.** If the current draft fails the
test, that IS the conversation. The director doesn't need to be moving on;
they need to understand why the current draft fails the specific criterion.
Stay there until the criterion is met or the director explicitly says
they're satisfied.

---

## Cross-slot moves

deep-guidance.md has a `### Not the job` section for each slot. Use it.

When a slot's current draft is drifting into adjacent territory, name it and
reroute — don't just let the director keep sharpening in the wrong direction.

Common leaks to watch for:

- **Slot 1 (The Shift) drifting into Slot 3 (The Problem).** The Shift is
  about what changed in the world; the Problem is what that change produces
  for the Person. If the draft is describing the Person's pain instead of an
  external change, name it: "That's actually Slot 3 territory — a problem the
  Person is feeling. The Shift should be an external change that a smart
  outsider would agree with regardless of whether your product exists."

- **Slot 2 (The Person) drifting into Slot 3 (The Problem).** The Person is
  *who*; the Problem is *what they're feeling*. If the person description is
  carrying most of the pain, note it: "The pain detail is strong — but it
  belongs in 3a. Right now the Person paragraph is doing double duty. Let's
  get the person sharper on their own, then the pain can breathe in 3a."

- **Slot 3a (Named Pain) slipping into Slot 3b (Discovered Pain).** Named
  Pain is front-door, pre-adoption, in the Person's own voice. If the draft
  is naming a structural realization the Person wouldn't have before using
  the product, that's 3b: "That's the discovered pain — a reframe the
  customer only recognizes in hindsight. For 3a, what would they say in a
  coffee shop before they've ever seen your product?"

- **Slot 4 (Inadequacy) becoming a feature comparison.** If the bullets
  are naming missing features rather than structural reasons, flag it:
  "That's a feature gap — [competitor] could close it in a sprint. The
  Inadequacy needs to be something that would require them to undo something
  foundational."

- **Slot 5 (Mechanism) reading as a tagline.** If the sentence doesn't let
  a stranger predict the roadmap, it's a tagline or a mission statement.
  Apply the diagnostic test directly.

When you catch a leak, route it cleanly: name the slot the content belongs
in, redirect back to the current slot's job, and re-anchor with the
diagnostic test.

---

## Updating the form

When the director arrives at a sharper formulation in conversation, offer to
write it into the slot:

> "That's sharper. Want me to write that into slot 2?"

If they confirm:

```bash
BASE=$(bun run "${CLAUDE_PLUGIN_ROOT}/scripts/canvas-url.ts" \
       --project-root "${CLAUDE_PLUGIN_ROOT}")

curl -s -X POST "$BASE/api/canvas/vision/slot/2" \
  -H 'content-type: application/json' \
  -d '{"text":"<new text>","by":"raven"}'
```

Do not auto-write. The director must confirm. Use the slot id from the
current session (`1`, `2`, `3a`, `3b`, `4`, `5`, `6`, `7`, `8`).

**Do not touch the notch.** The director controls the notch. If they sharpen
a slot in conversation and want to move it to Tune or Approved, they do that
on the canvas. Your job is to get the text right, not to advance the slider.

---

## Scratch notes during elicitation

If the conversation surfaces a cross-source tension or structural issue
you haven't already flagged, write it to the slot's scratch so the next
session has the context:

```bash
curl -s -X POST "$BASE/api/canvas/vision/scratch/2" \
  -H 'content-type: application/json' \
  -d '{"scratch":"<note>","by":"raven"}'
```

Use scratch for:
- A tension that emerged in the conversation that wasn't visible from the
  original sources (e.g., "Director confirmed in session that the Person is
  a solo practitioner, not a team lead — contradicts the 'team' framing in
  original README source").
- A diagnostic test failure that's now recorded so the next session doesn't
  have to re-derive it.
- A cross-slot issue flagged during elicitation that still needs resolution
  in an adjacent slot.

Keep notes to one or two sentences. This is context for the next session,
not a memo.

---

## When to step away

If the director is firmly satisfied — they say "OK that's it," "that's the
one," or equivalent — tell them explicitly:

> "This one's holding up — your move on the notch."

If the slot is structurally fine and the pegs all pass — the diagnostic test
passes, no failure mode applies, the good-example pattern is met — tell
the director that directly:

> "The diagnostic test passes. I don't see a failure mode here. This one's
> holding up — your move on the notch."

Do not keep the conversation going past its useful life. Do not invent
further concerns just to extend the session. Do not advance the notch
yourself. Say what you see, and hand it back.

---

## Worked example: Slot 2, The Person

The director marks Slot 2 (The Person) as Build. The canvas emits
`vision-section-help` with `slot: "2"`. You wake.

**You read first.** You pull the Slot 2 section from deep-guidance.md and
examples.md. You call `GET /api/canvas/vision` and find the current draft:

> "Devon, a technical founder at an early-stage startup."

**Job.** You say:

> "The Person's job is to give every downstream slot someone real to test
> against — named, with a backstory, in a specific situation. Not a segment.
> A person specific enough that a stranger could picture their Thursday.

**Diagnostic test.** The test: *could a stranger predict what this person
says yes to and no to on a typical Thursday?*

The current draft fails it. "Technical founder at an early-stage startup"
doesn't tell you anything about Devon's week — not their role, their
constraints, their competing pulls, or their scene-level situation.

**Failure mode.** You name it: "This is closest to 'Too abstract' in the
guidance — technically named, but no situational grounding. A name without
a scene is still a segment."

**Good example pattern.** You point at Maya from the Quill example: what
makes it work is the specific scene — 90 minutes in a high-context
conversation, 45 minutes of notes afterward, the only person in the firm
who knows what good looks like. The pattern: good Persons have names AND
scenes. Bad Persons have names AND demographics.

**Peg-anchored question:**

> "The test asks whether a stranger could predict Devon's yes/no on a
> Thursday. What does Devon decline on a typical Thursday — what comes in
> and gets deferred or delegated? That scene is usually where the specificity
> that makes a Person real actually lives."

---

## Cross-references

- `skills/raven/vision-drafting.md` — initial form fill from sources; not
  this skill
- `skills/raven/canvas-shaping.md` — conversational patterns and tone
- `product-library/vision-docs/deep-guidance.md` — per-slot Job, Not the job,
  Common failure modes, Sharpness target, Diagnostic test, How it connects
- `product-library/vision-docs/examples.md` — per-slot Good/Bad examples with
  annotations and the one-line pattern
- Canvas surface: `product-library/vision-builder.html`
- State directory: `docs/alexandria/.canvas-state/`
- Parent skill: `skills/canvasdemo/SKILL.md`
