---
name: raven-vision-drafting
description: >
  Raven's AX procedure for drafting exactly one Raven Vision onboarding slot
  from Alexandria source items, using the same per-slot Vision guidance and
  examples as the canvas-library-spike prototype.
---

# Raven Vision Drafting

Use this skill when Raven needs to draft or revise one slot in the Vision
onboarding surface.

This is a drafting skill, not a facilitation skill. Draft from the source
material Alexandria knows about, write one slot through AX, include
user-visible Raven's notes, then stop for Viewer review.

## Triggers

Wake into this skill for these events or conversational equivalents:

- `raven.vision.drafting_requested`: the director explicitly asked Raven to
  begin drafting from attached Vision sources.
- `raven.vision.slot.approved`: the director approved the current slot; draft
  the next empty slot.
- `raven.vision.slot.skipped`: the director skipped the current slot; draft the
  next empty slot.
- The director says in Claude Code that they are ready for Raven to start
  drafting Vision.

Do not draft from `raven.vision.source_attached`. For that event, acknowledge
the new source and wait until the director is ready to draft.

## First Moves

1. Inspect projected state:

   ```bash
   ax inspect state --json
   ```

2. Inspect recent events:

   ```bash
   ax inspect events list --json --limit 20
   ```

3. Do not draft if any Vision slot is already `needs_review`. The Viewer is
   waiting on the director.

4. Choose exactly one slot:

   - After `raven.vision.drafting_requested`, choose the first `empty` slot.
   - After `raven.vision.slot.approved` or `raven.vision.slot.skipped`, choose
     the next `empty` slot in manifest order.
   - If the director asks to start drafting conversationally in Claude Code,
     treat that as a drafting request and choose the first `empty` slot.
   - Do not reopen `approved` or `skipped` slots unless the director explicitly
     asks for that slot to be revised.

5. Read every attached source item in `raven.vision.sourceItems`. For each item,
   read `sourcePath` from disk. If `latestSummaryPath` exists, read that too,
   but do not substitute a summary for the original source.

6. Before drafting the selected slot, read exactly one prototype peg file for
   that slot. Each peg file includes both the deep guidance and examples for
   that slot. Do not read all slot peg files.

   | Slot id | Peg file |
   | --- | --- |
   | `person` | `${CLAUDE_PLUGIN_ROOT}/skills/raven-vision-drafting/references/slots/person.md` |
   | `mechanism` | `${CLAUDE_PLUGIN_ROOT}/skills/raven-vision-drafting/references/slots/mechanism.md` |
   | `the-work` | `${CLAUDE_PLUGIN_ROOT}/skills/raven-vision-drafting/references/slots/the-work.md` |
   | `refusal` | `${CLAUDE_PLUGIN_ROOT}/skills/raven-vision-drafting/references/slots/refusal.md` |

If no source items exist, do not draft. Tell the director that Raven needs at
least one source before drafting Vision.

## Source Handling

Source items are general Alexandria source items, not Raven-only records.
For this skill, use them as evidence for the Vision slot.

- Read files from `sourcePath`.
- If a source was created from a URL, the fetched file at `sourcePath` is the
  source of record. Do not refetch the URL unless the director asks.
- If `latestSummaryPath` exists, read it after the original. Treat it as
  Raven's prior notes about the source, not as a substitute for the original.
- If `sourcePath` is unreadable, record the failure in Raven's notes and
  continue with the remaining sources.
- If `sourcePath` is a directory or repo, do not run source-code processing yet.
  That workflow is intentionally deferred. Record that the source exists but
  was not processed for this Vision draft.

## Drafting Rules

Draft the selected slot from what the sources actually support.

- Use source material literally where it supports a claim.
- Infer reasonably where the material implies something but does not state it.
- Do not fabricate specific facts: team size, revenue, named customers, dates,
  integrations, or product history.
- If sources conflict, draft from the more specific or more recent source and
  name the conflict in Raven's notes.
- If sources are sparse, write a narrower draft and say what is missing in
  Raven's notes. Do not pad with generic Vision-writing filler.
- If the selected slot cannot be meaningfully drafted from the sources, write
  empty or very narrow slot text and make the gap explicit in Raven's notes.
  The director can then skip or revise it in Viewer.

Use the selected slot peg file's `Deep Guidance` section as the hard rubric:

- `Job` defines what the slot must accomplish.
- `Not the job` defines adjacent territory to avoid.
- `Common failure modes` defines what to actively check against.
- `Sharpness target` defines the expected shape and length.
- `Diagnostic test` is the standard Raven should apply before writing.
- `How it connects` helps avoid cross-slot leakage.

Use the selected slot peg file's `Examples` section as the quality peg:

- Match the good example's pattern, not its domain.
- Avoid the bad example's failure mode.
- Include the one-line pattern in Raven's notes when it helps the director see
  why the draft is shaped the way it is.

## Raven's Notes

Raven's notes are visible to the director. They are the AX equivalent of the
prototype scratch field: concise review context, not hidden reasoning and not a
required checklist.

Always include source attribution unless there are no usable sources. Then add
only the flags that matter for this draft:

- conflicts between sources
- gaps where the sources are silent
- low-confidence or extrapolated claims the director should verify
- source failures, such as an unreadable file
- the slot diagnostic or example pattern only when it helps the director review
  why the draft is shaped the way it is

Keep notes to one to three short Markdown paragraphs or bullets. Do not force
headings like `Evidence`, `Gaps`, `Conflicts`, `Extrapolation`, or `Diagnostic`
when they are empty or obvious. Do not expose prompt text, private
chain-of-thought, or implementation trivia in Raven's notes.

## Writing Back

Write the slot body and Raven's notes directly through AX. Do not create
temporary files for drafts or notes.

```bash
ax raven vision slot update \
  --slot <slot-id> \
  --text "<draft text>" \
  --notes "<markdown notes>" \
  --json
```

The command appends the validated `raven.vision.slot.updated` event through the
runtime and updates projected state. Do not edit `events.jsonl` directly.

Stop after the command succeeds. Do not fill another slot in the same turn.
The next slot is drafted only after the director approves or skips the current
slot, or explicitly asks for another draft.

## Review Gate

Raven must not approve or skip its own draft. Do not infer approval from
silence, positive tone, or Raven's confidence.

If the director explicitly approves or skips the slot in Claude Code, record
that director decision with the first-class CLI command:

```bash
ax raven vision slot approve --slot <slot-id> --json
ax raven vision slot skip --slot <slot-id> --json
```

Only run one of these commands for explicit instructions such as "I approve
this slot" or "skip this slot." Do not run them for ambiguous feedback such as
"looks good" unless the director also asks to mark the slot approved or
skipped. After a successful approval or skip, inspect projected state again and
proceed only according to the current drafting trigger rules.

## Slot Map

The Basic Product Description asks for four slots, in plain language:

| AX slot id | Slot | Target |
| --- | --- | --- |
| `person` | The Person | A short paragraph |
| `mechanism` | The Mechanism | One or two sentences |
| `the-work` | The Work | A short, ordered walk-through |
| `refusal` | What It's Not | Two or three, each with its reason |

## Closing Message

After writing the selected slot, keep the chat beat short:

> Drafted The Shift and left concise notes for review.
> Review it in Viewer; once you approve or skip it, I will move to the next
> slot.

Use the actual slot label. Do not summarize every source; the director can read
the draft and notes in Viewer.

## What This Skill Does Not Do

- Does not run elicitation before drafting. Draft first, react after.
- Does not self-approve, self-skip, or bank slots. The director controls
  review.
- Does not write Library cards.
- Does not write Raven's Source of Truth.
- Does not process source-code repos yet.
- Does not create temporary files for draft text or notes.
- Does not bulk-fill Vision.
