# Canvas Pattern Library

Named patterns the product-library canvas already uses. If you're about to
add a new step body, panel, button, or surface, **find the closest pattern
here and mirror it** rather than inventing.

Each pattern lists: what it is, when to use it, the CSS classes that hook
into it, and a minimal HTML snippet. Token references (`var(--accent)` etc.)
are defined in `brand.md`.

## Why this exists

The canvas had a coherent slate-and-amber vocabulary the whole time, but
the patterns weren't named — so a fresh agent inventing a new surface
reached for "make it parchment + green Save button + system-ui labels"
because there was no labeled menu to copy from. This doc is the menu.

---

## Slate plate — `.tfs-plate`

The Today's Frame surface. Everything inside step bodies sits on this. It's
already wired up; don't restyle it.

Hook: the existing `.tfs-plate` and child `.tfs-body` elements. Per-step
content lands inside `#tfs-body` via the step renderer.

Use when: you're rendering content for an active step.

---

## Slate card — `.tfs-card` and slate-card-equivalents

A raised content panel inside the plate. Use for any grouped block of
content that needs a discrete edge (logo panel, modal inner, drafts,
proposals). Mirrors `.phase-step` at rest.

```css
background: rgba(20, 14, 8, 0.55);
border: 1px solid rgba(212, 160, 82, 0.18);
border-radius: 6px;
padding: 0.8em 1em;
color: var(--fg);
```

```html
<div class="tfs-card">
  <div class="tfs-label">Section label</div>
  …content…
</div>
```

Use when: you need a card on the slate plate. **Never use a white or
parchment fill here.** The plate is dark; the card sits on it.

---

## Amber pip — primary CTA — `.tfs-btn-primary`

The canvas's primary-action language. Mirrors `.phase-step.active .ps-num`
(the active step's number badge in the rail). Solid amber fill, slate text,
Inter bold, full pill rounding.

```css
padding: 0.55em 1.1em;
font: 600 12px/1 var(--font-px);
letter-spacing: 0.04em;
background: var(--accent);
color: #1a1a1a;
border: 1px solid var(--accent);
border-radius: 999px;
```

```html
<button class="tfs-btn-primary">Save &amp; continue</button>
```

Use when: this is the single action that advances the flow. **One per
surface at most.** Two amber pips on the same surface cancel each other
out — promote one to ghost.

---

## Ghost pill — secondary action — `.tfs-btn-ghost`

Transparent fill, amber border, amber text. Same shape as the primary,
quieter weight.

```css
padding: 0.55em 1.1em;
font: 500 12px/1 var(--font-px);
background: transparent;
color: var(--accent);
border: 1px solid var(--accent-dim);
border-radius: 999px;
```

```html
<button class="tfs-btn-ghost" title="Doesn't advance">Get Raven's take</button>
```

Use when: secondary action that doesn't advance the flow ("review without
saving," "preview," "open detail"). Pair with one `.tfs-btn-primary`.

---

## Quiet pill — utility action — `.tfs-btn-quiet`

Neutral pill that takes amber accent on hover. For utility actions on a
card (replace, edit, copy). Has a `.danger` variant for destructive verbs.

```css
padding: 0.4em 0.8em;
font: 500 12px/1 var(--font-px);
background: transparent;
color: var(--fg);
border: 1px solid rgba(212, 160, 82, 0.25);
border-radius: 999px;
```

`.tfs-btn-quiet.danger` swaps text/border to `var(--danger)` (rust).

```html
<button class="tfs-btn-quiet">Replace</button>
<button class="tfs-btn-quiet danger">Delete</button>
```

Use when: you have 2–4 chip-style actions on a card and one is destructive.
Don't fill destructive actions with bright red — the rust outline carries
the warning sufficiently and stays in palette.

---

## Etched note — `.welcome-cta`

A short hint inside prose. Amber etched left edge, amber-dim text, faint
amber background. For pointing at the next action when there's no button.

```css
font: 500 12px/1.5 var(--font-px);
color: var(--accent-dim);
padding: 0.45em 0.8em;
background: rgba(184, 139, 58, 0.08);
border-left: 2px solid var(--accent-dim);
border-radius: 0 3px 3px 0;
```

```html
<div class="welcome-cta">Drag your product's logo into the <strong>Product</strong> tile above.</div>
```

Use when: a single-sentence cue belongs next to prose. Avoid stuffing
multiple sentences in — split into two etched notes or revise the copy.

---

## Section label — `.tfs-label`

A small amber-dim label that tops a card or section. Mirrors the rail's
caption style.

```css
font: 500 11px/1 var(--font-px);
letter-spacing: 0.06em;
color: var(--accent-dim);
margin-bottom: 0.5em;
```

```html
<div class="tfs-label">Your product logo</div>
```

Use when: labeling a card's contents. **No ALL CAPS.** Sentence case, no
caps-drama. Inter Medium handles the small-size legibility; the size and
amber-dim color do the heavy lifting.

---

## Dropzone — `.area.drop-target`

A pulsing amber dashed border on a Band-1 tile that signals "drop your
artifact here." For tiles that accept user-dropped content.

```css
.area[data-area="archive"].drop-target::after {
  content: 'drop your logo here';  /* slate pip styled separately */
  position: absolute; inset: 0;
  border: 2px dashed var(--accent-dim);
  animation: drop-pulse 1.4s ease-in-out infinite;
  /* … */
}
```

Use when: there's a tile where the user is expected to drop a file. The
animation is intentional — it's the canvas's main "something goes here"
signal.

---

## Status pip — `#live-pip` style

A small slate pill with a colored dot inside. Use for connection /
liveness / status surfaces.

```css
display: inline-flex; align-items: center; justify-content: center;
font: 500 10px/1 var(--font-px);
min-width: 6.5em;        /* prevents layout shift on text change */
padding: 0.45em 0.7em;
background: rgba(20, 14, 8, 0.55);
border: 1px solid rgba(212, 160, 82, 0.18);
border-radius: 10px;
```

Status carried by the `::before` dot color, **not** the whole pill. Reserve
`min-width` to fit the widest persistent state so the surrounding layout
doesn't twitch on text changes.

---

## Modal — slate plate, no white card

Modals follow the same slate language as the plate they sit on. The
backdrop is dark; the inner is slightly raised slate, not white.

```css
#some-modal {
  position: fixed; inset: 0;
  background: rgba(15, 10, 6, 0.7);          /* dark backdrop */
}
#some-modal .modal-inner {
  background: rgba(40, 28, 12, 0.95);        /* raised slate */
  border: 1px solid rgba(212, 160, 82, 0.35);
  border-radius: 6px;
  color: var(--fg);
}
```

Use when: a transient overlay needs focus. **Never a white card on dark
backdrop** — that's the most common foreign-import pattern and reads
immediately as "imported from a different design system."

---

## Anti-patterns (don't ship)

- Kelly-green Save buttons (`#2e7d32` or any non-amber primary fill).
- White or near-white card panels (`#fff`, `#fdfcf9`, `#f4f0e6`) on the
  dark plate.
- `system-ui` or `ui-monospace` font families outside the canvas root
  `--font-px` fallback chain.
- ALL CAPS section labels (`text-transform: uppercase`) anywhere except
  the existing toolbar `.btn` and rail `.vt-btn` chrome.
- Bright kelly green `#2e7d32` / `#5e7a4a` for any status — use
  `var(--success)` or `var(--accent)` instead.
- Multiple primary `.tfs-btn-primary` pips on the same surface.
- Chromatic-rainbow button groups (teal + amber + maroon for adjacent
  utility buttons). Pick one tone; differentiate by position or label.

## Cross-references

- Token source of truth: `docs/design/brand.md`
- Voice rules: `docs/design/voice.md`
- Canvas source: `product-library/product-library-v0.1.html`
