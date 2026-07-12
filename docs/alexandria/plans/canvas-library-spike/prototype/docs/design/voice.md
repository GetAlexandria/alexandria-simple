# Canvas Voice Rules

Voice is the single thing that broke hardest in the spike's first pass.
Brand color is a CSS variable lookup; voice is a judgment call every time
you write a label. This doc gives you the principle and a table of
before/after examples drawn from the actual cleanup so future judgment
calls go right.

## The principle

> **Canvas labels describe the artifact, not the system.**

The canvas shows the user *what is*: their product logo, their story so
far, their well depths. It does not narrate *what will happen*, *what
another surface is doing*, or *what Raven will do next*. Those are
contracts between surfaces; surfacing them as label text leaks the contract
into the artifact view and reads as nervous over-explaining.

Three corollaries:

1. **Don't narrate the save mechanic.** "Hitting Save advances the canvas
   to step 1.2 and wakes Raven in chat" is a description of the system,
   not the artifact. The Save button labels itself.

2. **Don't reference the chat surface from the canvas.** "Now tell Raven
   about it in Claude Code" leaks the cross-surface contract. The director
   knows there's a chat; they're using it. The canvas's job is the
   artifact, not coaching the user about Raven.

3. **Don't reference Raven by name in chrome labels.** Sometimes
   unavoidable as a transitional measure (see below), but every "Raven"
   in a canvas label is a leak. Reach for the artifact's own name first.

## Before / after — what the cleanup PR did

| Before | After | Why |
| --- | --- | --- |
| `YOUR PRODUCT LOGO — RAVEN HAS SEEN IT` | `Your product logo` | Caps drama + chat narration. Sentence-case labels the artifact. |
| `→ Hitting Save advances the canvas to step 1.2 and wakes Raven in chat. She'll take it from there.` | *(deleted)* | Narrates the save mechanic. The button labels itself. |
| `→ Logo committed to the canvas. Now tell Raven about it in Claude Code — try \`look\` or \`what do you see?\`` | `Logo committed. Ask Raven to look.` | Cuts the meta-coaching and the leak to "Claude Code." Two short sentences. (Still a known transitional leak — see "tolerable leaks" below.) |
| `→ Tell Raven your product's name, and then a 2–3 sentence description of what it is and who it's for. She'll capture both here as The Story So Far.` | `Tell Raven your product's name and a short description. She'll capture both here as The Story So Far.` | Tightened to one sentence; dropped the structural directive ("2–3 sentence description"). |
| `Click the text to edit directly. Your changes flow back to Raven.` | `Click the text to edit directly.` | The second sentence narrates a contract the director doesn't need to know about. |
| `0 means skip — Raven won't ask about that source this session. Past zero is relative depth. Your own knowledge is always available — Raven leans on it when other sources run dry.` | `0 means skip.` | Four-clause explainer became one fact. Everything else was either chat-narration or restating the slider semantics. |

## Tolerable leaks (for now)

The spike has surfaces where the canvas genuinely has no input affordance
yet — the director must do the next thing in chat. These need to point at
chat to be functional. Two such leaks remain:

- 1.1 pre-acknowledgment: "Logo committed. Ask Raven to look."
- 1.2 empty recap: "Tell Raven your product's name and a short
  description…"

These are **transitional**, not aspirational. The fix isn't better wording;
it's adding canvas-side input or moving these prompts into Raven's voice
entirely. See `docs/alexandria/plans/canvas-library-spike/plan.md` for the
interaction-model rework.

## Lexicon

| Use this | Not this | Why |
| --- | --- | --- |
| "Your product logo" | "Your product logo — Raven has seen it" | Label the artifact. Acknowledgment is implied by the controls appearing. |
| "Save & continue" | "✓ Save & continue (advances to step 1.2)" | Glyphs aren't needed; the button labels itself. |
| "0 means skip." | "0 means we'll skip this source for the session." | Direct. The semantics are clear from context. |
| "Showing in the page header." | "This logo now appears in the page header above." | A note, not a paragraph. |
| Sentence case headings | ALL CAPS HEADINGS | Caps create urgency the canvas doesn't need. Reserve for the toolbar/rail chrome that already uses caps consistently. |

## Length budget

- **Section labels**: 1–4 words.
- **Etched notes / CTAs**: 1 sentence. If you need two, you probably have
  two notes.
- **Button labels**: 1–3 words.
- **Wells-style legends**: 1 sentence.
- **Welcome prose**: 1–2 sentences total per step.

If you exceed any of these, ask whether the extra words are labeling the
artifact or narrating the system. Almost always the cut is the second one.

## Cross-references

- Token source of truth: `docs/design/brand.md`
- Pattern library: `docs/design/canvas-patterns.md`
- Canvas source: `product-library/product-library-v0.1.html`
