---
name: vision-drafting
description: >
  Raven's procedure for drafting the 9-slot Vision form when the director
  hands her sources at step 1.4 (Knowledge Bank → Vision). Wakes on the
  vision-sources-handed canvas event, reads each source, drafts every slot
  from what the material supports, flags confidence and conflicts in
  scratchpads, and writes results to the canvas-server vision API.
requires:
  adherence: high
  reasoning: high
  precision: high
  volume: medium
---

# vision-drafting

**Trigger:** `vision-sources-handed` event in `step-events.jsonl`

The director has clicked Raven's coin → Knowledge Bank → Vision, and the
9-slot Vision Builder form has unrolled on the canvas. They've pasted one
or more sources into the hand-off panel and hit "Hand to Raven."

Your job is to draft the form. Not elicit. Not facilitate. Draft — from
what the sources actually say — then surface exactly what you couldn't
infer.

> Every meaningful event on the canvas has a matching Raven beat in chat.
> The director acts; Raven reacts. **Save → react.**

---

## Wake procedure

When you receive the `vision-sources-handed` wake, before writing anything
to the canvas or to the director:

1. Read the current canvas state to get the handed sources:

   ```bash
   BASE=$(bun run "${CLAUDE_PLUGIN_ROOT}/scripts/canvas-url.ts" \
          --project-root "${CLAUDE_PLUGIN_ROOT}")
   curl -s "$BASE/api/canvas/vision"
   ```

   The response includes a `sources` array. Each entry is either a URL
   (starts with `http`) or a file path.

2. For each URL, fetch with the WebFetch tool.
   For each file path, read with the Read tool.

3. If a URL returns a non-200 response or the WebFetch tool errors, note
   it — don't abort. Log it in a `FETCH_FAILURES` list and continue with
   remaining sources.

4. Read the canonical slot definitions from the template so you have the
   9 slot prompts in mind. The slots are:

   | ID  | Name              | Target length                  |
   | --- | ----------------- | ------------------------------ |
   | 1   | The Shift         | 1 paragraph                    |
   | 2   | The Person        | 1 short paragraph              |
   | 3a  | Named pain        | 1 paragraph, person's voice    |
   | 3b  | Discovered pain   | 1 paragraph                    |
   | 4   | The Inadequacy    | 3–5 bullet points              |
   | 5   | The Mechanism     | 1 positioning sentence + 2–3   |
   | 6   | The Felt Experience | story, 250–400 words         |
   | 7   | The Proof         | 2–3 markers                    |
   | 8   | The Refusal       | 2–3 anti-positions             |

---

## When a source is a repo or directory

The wake procedure above tells you to WebFetch URLs and Read file paths. This
section covers what to do when a handed path is a directory or repo root — not
a single file.

### Detect the case

A source is a directory source if any of these are true:

- The path has no file extension and does not look like a named config file.
- The path ends with `/`.
- A quick LS reveals it is a directory, not a file.

If any of those apply, do not try to Read it as a single file. Switch to the
bounded reconnaissance procedure below.

### Start with structure, not bytes

First, understand the layout. Run Glob to surface entry points:

```bash
# Find the top-level shape — src/, app/, pages/, components/, lib/, cmd/, internal/
glob "{src,app,pages,components,lib,cmd,internal}/**/*" --cwd <source-path>
```

Then read the manifest file for the stack — whichever exists:

- `package.json` / `package-lock.json` — Node / JS / TS
- `pyproject.toml` / `requirements.txt` / `setup.py` — Python
- `Cargo.toml` — Rust
- `go.mod` — Go
- `build.gradle` / `pom.xml` — JVM

The manifest tells you the product name, dependencies, scripts, and entry
points in under a second. Read it before opening any source file.

### Sample the implementation — do not crawl

Pick 3–5 files, bounded:

1. **The entry point.** `src/index.ts`, `app/main.py`, `cmd/main.go`, the
   root page in a Next.js `app/` tree — whatever the manifest or glob pointed
   to. This tells you what the product initializes and what primitives it
   assembles.

2. **One or two user-facing surfaces.** A main page component, a key route
   handler, a primary screen. Look for files named `Home`, `Dashboard`,
   `Editor`, `Workspace`, or named after the product's core noun.

3. **A domain model file if one is visible.** Something in `models/`,
   `domain/`, `types/`, or `lib/` that defines the central data shape. This
   is often where the product's real vocabulary lives.

That's it. Do not follow every import. Do not read tests unless a specific
slot needs behavioral proof. The goal is a fast cross-section — structure
first, then two or three meaningful reads.

**Cap: ~10 files per repo source.** If you find yourself wanting to read more,
that's a signal. Either bank what you have (you probably have enough to draft)
or ask the director which area matters most.

### Watch for docs/code disconnects

The reason to read code at all is to catch contradictions that docs alone
would miss:

- README says "this is for [role X]" but every route, UI label, and default
  value is tuned for [role Y].
- The landing page claims a feature that doesn't appear anywhere in `src/`.
- Docs describe a simple tool; the component tree reveals a multi-tenant
  platform.
- Named concepts in the pitch ("the Workspace", "the Flow") don't map to any
  type, route, or component name — which means the naming is marketing, not
  product.

When you find a disconnect, surface it in scratch exactly as you would a
cross-source URL conflict (see "Two sources contradict each other" in the
Failure modes section): draft from the code framing (code is ground truth for
what the product actually does) and flag the docs framing.

### Which slots benefit most from code

Not all slots gain equally from reading source. Focus your code-reading
budget here:

**Slot 5 — The Mechanism** benefits the most. Code is ground truth for what
the product actually does. The primitives assembled in the entry point and
domain model are the mechanism. If the docs claim "AI-powered X" but the
source is a straightforward CRUD app with a single LLM call, the mechanism
statement should reflect what's actually there.

**Slot 2 — The Person** leaks from UI detail. Form field labels, route
names, placeholder text, default values, and permission-tier names all
reveal who the product was actually built for. A product for "teams" will
name a Team model; a product for individual practitioners usually won't.

**Slot 7 — The Proof** can be grounded in observable behaviors from code.
Analytics event names, exported metrics, webhook payloads, and audit-log
categories are behavioral markers that code exposes and docs rarely capture.

**Skip code-reading for Slots 1 and 8.** The Shift (1) is about the
external world, not the product internals. The Refusal (8) is a
positioning choice. Neither is answered by source files.

### A note on what comes next

The Vocabulary module — picking the product's real nouns — will ship in the
next canvas iteration. That module leans even harder on code reading: it
mines type names, route segments, component names, and model fields to build
the product's actual noun set. The patterns you build here in Vision —
bounded Glob, manifest read, 3–5 targeted file reads, docs/code conflict
surfacing — are the direct foundation for that work.

---

## Drafting rules

Work through each slot in order. For each:

### What to draft

Write the slot answer as if filling the template for the director to react
to. Use the source material literally where it supports a claim. Infer
reasonably where the material implies something but doesn't state it.
**Do not fabricate specific facts** (team size, revenue, named customers,
dates) that no source mentions.

When the sources give enough to write a real slot answer:

- Draft in the appropriate voice (slot 3a: person's voice; slots 5 and 6:
  author's voice).
- Aim at the length target. A short answer almost always means you were
  too abstract. A long answer usually means you mixed slots.
- Use the product name from `product-meta.json` (read via the state dir
  or `GET /api/canvas/vision`) throughout.

### What goes in the scratch field (not the slot text)

The scratch field is your working notes — visible to the director when
they click into a slot. Use it to flag:

- **Conflicts:** "Landing page says two audiences; README describes one.
  Drafted for the README framing — the landing page framing would shift
  The Person substantially."
- **Gaps:** "No source mentions existing-tool comparison. Drafted from
  category reasoning; director should validate."
- **Low confidence:** "This claim extrapolates from the 'about' page
  tagline. Verify against the real positioning."
- **Source attribution:** "Drawn from: README.md, https://example.com/about"

Keep scratch notes concise — one to three sentences per flag. This is
your reasoning trace for the director, not an essay.

### Notch (the slider)

The notch has four values:

| Value | Meaning |
| ----- | ------- |
| 0     | Unset (—) |
| 1     | Build |
| 2     | Tune |
| 3     | Approved |

**Set notch to 1 (Build) only if you could not draft any meaningful
content for that slot** — the sources are silent and you have nothing
useful to put there. For all other slots, leave the notch at 0 (unset).
The director will decide what level to assign after reviewing your draft.
Do not pre-grade your own work.

---

## Writing to the canvas

After drafting all slots, write them to the canvas-server in a single
pass — slot text, then scratch, then notch (only if Build applies).

```bash
BASE=$(bun run "${CLAUDE_PLUGIN_ROOT}/scripts/canvas-url.ts" \
       --project-root "${CLAUDE_PLUGIN_ROOT}")

# Write slot text
curl -s -X POST "$BASE/api/canvas/vision/slot/1" \
  -H 'content-type: application/json' \
  -d '{"text":"<drafted text>","by":"raven"}'

# Write scratch note (always — even if just source attribution)
curl -s -X POST "$BASE/api/canvas/vision/scratch/1" \
  -H 'content-type: application/json' \
  -d '{"scratch":"<notes>","by":"raven"}'

# Set notch to Build ONLY if slot is blank
curl -s -X POST "$BASE/api/canvas/vision/notch/1" \
  -H 'content-type: application/json' \
  -d '{"notch":1,"by":"raven"}'
```

Slot IDs: `'1'`, `'2'`, `'3a'`, `'3b'`, `'4'`, `'5'`, `'6'`, `'7'`, `'8'`.

Do **not** call notch for a slot if you drafted content for it.
Do **not** invent endpoints beyond the three above and `GET /api/canvas/vision`.

---

## Slot-by-slot guidance

This section flags what each slot is specifically looking for, and the
most common way a draft goes wrong when working from sparse source
material.

**Slot 1 — The Shift.** You're looking for an external change in the
world — capability, cost curve, behavior, regulation — that makes this
product necessary *now*. If the source material doesn't name a shift
explicitly, look for what era the product's framing assumes. Failure mode:
drafting "AI is changing everything" — that's not a shift, it's a
headline.

**Slot 2 — The Person.** A named composite, not a segment. If sources name
multiple audiences, pick the one the product's *mechanism* is most
calibrated to — usually the one whose workflow the product touches most
directly — and flag the others in scratch. If no person is named at all in
any source, set notch to Build and write in scratch what segment clues
exist.

**Slot 3a — Named Pain.** Write in the person's voice, not founder-voice.
"Their tooling is fragmented" is your diagnosis; "I'm pasting the same
context every morning before I can even start" is their voice. If no
direct customer-voice material exists in the sources, infer from the
product's homepage copy or sales positioning — that copy was written to
resonate with the named pain.

**Slot 3b — Discovered Pain.** This is the one customers can't name before
using the product. Look for product retention copy, "aha moment" framing,
or what the product's *back-end transformation* claims. If sources are
silent, write a plausible extrapolation from the Mechanism and flag it as
extrapolated in scratch.

**Slot 4 — The Inadequacy.** List the tools or categories customers reach
for today and explain why each fails *structurally* — not "doesn't have
feature X" but "was designed for a different shape of the world." Look for
comparison language in the sources (what the product is *not*, what it
replaces, what customers migrate from).

**Slot 5 — The Mechanism.** One positioning sentence in the form "[Company]
is the only [X] that [Y]" or "[Company] turns [X] into [Y]." If the
product has a tagline or hero sentence in its public copy, do not use it
as-is — taglines are not mechanism claims. Use the mechanism primitives
from the product docs to build the claim, then write 2–3 sentences on how
the mechanism works.

**Slot 6 — The Felt Experience.** A story. Specific time markers. At least
one thing the user does that isn't possible today (the GASP). At least one
thing conspicuously absent from the future scene. Horizon: 12–18 months
in, when the user is a power user. If sources are too sparse to write a
300-word scene, write what you can and mark the scene as low-confidence in
scratch — do not truncate to bullets.

**Slot 7 — The Proof.** Behavioral, observable, falsifiable markers — not
metrics. Each marker should test a specific claim from Slots 5 or 6. If
no success-state language exists in sources, extrapolate from the
mechanism and flag.

**Slot 8 — The Refusal.** Things that look aligned but would undermine the
Vision. Look for explicit out-of-scope statements, ICP language, or
anti-patterns the product positions against. Each refusal needs a
structural reason connected to an earlier slot.

---

## Failure modes

### A source 404s or fails to fetch

Note it in `FETCH_FAILURES`. Log in that slot's scratch: "Source
[URL] failed to load — could not draw from it." Continue drafting from
remaining sources. If the failed source was the only one, more slots will
be blank — set those to Build and tell the director which URL failed.

### The director handed no useful sources

If the `sources` array is empty or every source is inaccessible:

1. Do not write any slot text.
2. Write a scratch note on slot 1: "No sources loaded — nothing to draft
   from. Please hand me at least one: a URL, README, pitch deck, or spec."
3. Set all slots to notch 1 (Build).
4. Tell the director:

   > Nothing to draft from — all sources came up empty or none were
   > provided. Drop at least one into the hand-off panel (a URL, a README
   > path, a pitch doc) and hand them to me again.

### Sources are sparse — not enough to fill most slots

Draft what you can. Do not pad thin slots with generic Vision-writing
boilerplate ("our product empowers teams to work better"). A short, honest
draft with a scratch note is more useful than a padded draft that looks
complete. Set Build on slots with no real material.

### Two sources contradict each other

Draft from the more specific or more recent source. Flag the conflict in
scratch: "Website says X; README says Y. Drafted from README framing —
confirm which is current."

Do not try to synthesize conflicting claims into one answer. Pick one
framing and surface the other.

### Sources are heavy on features, light on positioning

Features alone can support Slots 4, 5 (partially), and 6. They're weak
for Slots 1, 2, 3a, 3b, 7, 8. Flag which slots needed positioning
language that wasn't in the sources.

---

## Closing message to the director

After all writes complete, tell the director what you found. Be direct —
no preamble.

Count:
- **Drafted slots:** slots where you wrote real content.
- **Blank slots:** slots you set to Build.
- **Conflict flags:** slots with a contradiction in scratch.

Deliver:

> Drafted [N] slots. [Blank slot names, if any] couldn't be filled from
> the sources — marked Build. [Conflict slot names, if any] have
> conflicting signals in the scratchpads. Walk through and assess — I'll
> be here when you want to sharpen any of them.

If fetch failures happened, add:

> Couldn't load [URL] — that source is missing from the draft.

Keep it short. The director can read the form; you don't need to
summarize each slot. The invitation is to engage with what's there.

---

## What this skill does not do

- **Does not run elicitation.** The form unrolls on the canvas already;
  the director doesn't need to be asked the 9 questions before seeing a
  draft. Draft first, react after.
- **Does not assign Tune or Approved.** Raven never pre-approves her own
  work. Only the director advances a slot past Build.
- **Does not write to the library.** This draft lives in the canvas Vision
  Builder. It is not banked until the director explicitly moves it.
- **Does not invent endpoints.** Only `POST /api/canvas/vision/slot/:id`,
  `POST /api/canvas/vision/scratch/:id`, `POST /api/canvas/vision/notch/:id`,
  and `GET /api/canvas/vision` exist in this spike.
- **Does not pad thin answers.** A blank slot with a Build notch is more
  honest than three sentences of generic Vision-writing boilerplate.

---

## Cross-references

- Canvas surface: `product-library/vision-builder.html`
- Vision template: `docs/alexandria/plans/library-population-playbook/vision/1-page-template.md`
- Per-slot guidance: `docs/alexandria/plans/library-population-playbook/vision/deep-guidance.md`
  (a serving copy lives at `product-library/vision-docs/deep-guidance.md` for the
  More-guidance modal — edit the canonical path above, then re-sync)
- Worked examples: `docs/alexandria/plans/library-population-playbook/vision/examples.md`
- Draft example: `docs/alexandria/plans/library-population-playbook/vision/draft-vision.md`
- Parent plan: `docs/alexandria/plans/library-population-playbook/plan.md`
- Parent skill: `skills/canvasdemo/SKILL.md` (Beat 5 covers the Knowledge Bank step)
- Conversational patterns: `skills/raven/canvas-shaping.md`
- State directory: `docs/alexandria/.canvas-state/`
