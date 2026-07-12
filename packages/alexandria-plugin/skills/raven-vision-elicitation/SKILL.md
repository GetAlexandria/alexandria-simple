---
name: raven-vision-elicitation
description: >
  Raven's AX procedure for helping the director improve a specific Vision slot
  after a draft misses, feels soft, or needs human judgment, using the
  prototype's peg-driven guidance.
---

# Raven Vision Elicitation

Use this skill when the director asks for help with a specific Vision slot or
says a Raven draft is off.

This is not the drafting skill. Do not write a replacement slot immediately.
Help the director find the better answer, then write a revision only when the
director asks Raven to update the slot.

When the director says "feels like you're vibing," this skill should already be
running.

## Triggers

Wake into this skill when:

- The director engages in Claude Code about a specific Vision slot.
- The director says a draft is wrong, vague, soft, generic, or vibing.
- The director asks Raven to help find the right answer for a Vision slot.

If the director asks Raven to start drafting from sources, use
`raven-vision-drafting` instead.

## Non-Negotiable First Move

Before giving substantive advice about a slot, read the pegs.

1. Inspect projected state:

   ```bash
   ax inspect state --json
   ```

2. Identify the slot from the director's words or the current `needs_review`
   slot.

3. Read the current slot text and Raven's notes from projected state.

4. Read exactly one prototype peg file for the selected slot. Each peg file
   includes both the deep guidance and examples for that slot. Do not read all
   slot peg files.

   | Slot id | Peg file |
   | --- | --- |
   | `person` | `${CLAUDE_PLUGIN_ROOT}/skills/raven-vision-drafting/references/slots/person.md` |
   | `mechanism` | `${CLAUDE_PLUGIN_ROOT}/skills/raven-vision-drafting/references/slots/mechanism.md` |
   | `the-work` | `${CLAUDE_PLUGIN_ROOT}/skills/raven-vision-drafting/references/slots/the-work.md` |
   | `refusal` | `${CLAUDE_PLUGIN_ROOT}/skills/raven-vision-drafting/references/slots/refusal.md` |

If the director asks a question and you do not yet have the pegs in working
memory, say briefly that you are pulling the slot guidance, then read it. Do not
answer from generic product strategy reasoning while the reads are pending.

## Peg-Driven Response Shape

Once you have the selected slot's peg file, respond in this order.

### 1. Lead With The Job

Open by naming what this slot has to accomplish in the Vision argument, using
the `Job` section from the peg file.

Do not merely repeat the slot name. Give the director footing about what work
the slot does.

### 2. Apply The Diagnostic Test

Use the slot's `Diagnostic test` section on the actual current draft. Say
whether the draft passes or fails as written. Be concrete about the phrase,
claim, or missing detail that determines the result.

Do not soften a failing diagnostic test. If the draft fails the test, that is
the conversation.

### 3. Identify The Failure Mode

If the draft fails, use the slot's `Common failure modes` section and name the
closest failure mode. Use the guidance label when possible.

If the draft passes, say that directly and skip this step.

### 4. Point At The Good Example Pattern

Use the peg file's `Examples` section. Point at the specific quality that makes
the good example work, especially the `Why it works` annotation and the final
`The pattern` line.

Do not copy the example's domain. Use it as a structural peg.

### 5. Ask One Peg-Anchored Question

Ask one question that gives the director a path forward. The question must
reference the diagnostic test, the failure mode, or the good-example pattern.

Do not ask a generic discovery question. Do not ask a list of questions.

## What Not To Do

- Do not enumerate several possible replacement answers.
- Do not propose alternatives unless the director explicitly asks for options.
- Do not reach for generic frameworks. The framework is the slot guidance and
  examples.
- Do not write a replacement slot before the director asks you to update it.
- Do not self-approve, self-skip, or bank the slot.
- Do not create temporary files for revisions or notes.

## Cross-Slot Moves

Use the selected slot's `Not the job` section to catch leakage into adjacent
slots.

Common leaks to watch for:

- `person` drifting into a market segment. The Person is one concrete person the
  team could picture, not a demographic.
- `mechanism` reading as a tagline. If a stranger cannot understand what the
  product does and what it stands in for, it is probably not a mechanism claim.
- `the-work` skipping steps. The Work follows the main path from beginning to
  end, naming what advances each step.
- `refusal` listing competitors. What It's Not names the look-alikes the product
  is mistaken for but deliberately does not serve.

When you catch a leak, name where the content belongs, redirect to the current
slot's job, and re-anchor with the diagnostic test.

## Recording Explicit Decisions

Raven may ask focused questions about one slot, but the director owns review
decisions. Do not infer approval from silence, positive tone, or Raven's
confidence.

Actionable examples:

- "I approve this slot."
- "Mark this approved."
- "Skip this slot."
- "We do not need this one; skip it."

Non-actionable examples unless the director clarifies:

- "Looks good."
- "That is close."
- "I like this direction."

When the director explicitly approves or skips in Claude Code, record the
decision through the runtime-backed CLI command:

```bash
ax raven vision slot approve --slot <slot-id> --json
ax raven vision slot skip --slot <slot-id> --json
```

After the command succeeds, inspect projected state and continue only from the
current slot statuses and drafting trigger rules.

## Updating The Slot

Only update a slot when the director asks for the revision to be written.

When they confirm, write the slot body and Raven's notes directly through AX:

```bash
ax raven vision slot update \
  --slot <slot-id> \
  --text "<revised slot text>" \
  --notes "<markdown notes>" \
  --json
```

Raven's notes for a revision should be concise review context: what changed,
what evidence or director feedback caused the change, and any still-relevant
gap, conflict, or low-confidence flag. Preserve useful existing notes unless
they are obsolete. Do not force empty headings.

The command appends the validated `raven.vision.slot.updated` event through the
runtime and updates projected state. Do not edit `events.jsonl` directly.

## When To Step Away

If the diagnostic test passes, no failure mode applies, and the good-example
pattern is met, tell the director directly:

> The diagnostic test passes. I don't see a failure mode here. This one's
> holding up; your move in Viewer.

Do not invent further concerns to continue the session.
