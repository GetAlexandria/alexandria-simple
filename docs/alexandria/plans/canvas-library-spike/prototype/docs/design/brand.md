# Alexandria Brand Tokens

Single source of truth for color, font, and spacing tokens used across every
Alexandria surface. If you are about to write a `#hex` literal, a font name,
or a hardcoded radius/spacing into canvas chrome, stop and consult this doc
first.

The cleanup commit that motivated this file replaced 54 off-brand hex
references, 5 bare `system-ui` font stacks, and 2 chromatic-rainbow button
treatments — all caused by not having a place to look.

## Brand-site values (canonical)

These live in [`alexandria-site/src/layouts/Layout.astro`](https://github.com/sociotechnica-org/alexandria-site/blob/main/src/layouts/Layout.astro)
and are the brand's source of truth. The marketing site uses them directly.

```css
--color-bg:         #0f0f14   /* deep blue-black ground */
--color-surface:    #1a1a24   /* slightly raised surface */
--color-text:       #e8e6e1   /* warm white */
--color-text-muted: #9a9790   /* muted warm gray */
--color-accent:     #c9a84c   /* warm amber/gold */
--color-accent-dim: rgba(201, 168, 76, 0.15)

--font-display:     'Cormorant Garamond', Georgia, serif
--font-body:        'Inter', system-ui, sans-serif
```

## Canvas's warm-walnut interpretation

The product-library canvas (`product-library/product-library-v0.1.html:21-50`)
uses a deliberately warmer, browner set of tokens. Both are on-brand; they're
different rooms in the same house.

```css
--bg:           transparent     /* body uses the smart-wall bed */
--fg:           #e8e0d4         /* warm cream */
--fg-dim:       #7a6e5e         /* warm taupe */
--panel-bg:     rgba(60,50,42,0.88)
--panel-bd:     rgba(255,230,200,0.14)
--accent:       #d4a052         /* canvas amber */
--accent-dim:   #b8863a         /* canvas amber-deep */
--accent-glow:  #e8b86d         /* canvas amber-glow */
--teal:         #4a7c7c         /* muted teal — sparingly */
--danger:       #8b3a3a         /* deep rust */
--success:      #5e7a4a         /* muted moss */
--warning:      #b8863a         /* doubles as status */

--font-px:      'Inter', system-ui, sans-serif
--font-display: 'Cormorant Garamond', Georgia, serif
```

### Why the canvas is warmer than the brand site

The brand site is a **night-sky brand surface** — the user encounters the
product. The canvas is a **workbench** — the user uses the product. The
warm-walnut bed reads as "a natural but technological surface that doesn't
steal the show from the artifacts plugged into it" (per the product owner).
Both interpretations stay in the amber-on-dark family; both use Cormorant
Garamond for display and Inter for body.

Do not "fix" the canvas to match the brand site, or vice versa.

## Rules

These are hard rules, not preferences. The cleanup PR enforced them across
the spike's surfaces.

1. **Never hardcode a hex literal outside `:root`.** Always reach for the
   token: `color: var(--accent)`, not `color: #d4a052`. New tokens go into
   the `:root` block first.

2. **Never write a bare `system-ui` or `ui-monospace`.** Always inside a
   token's fallback chain: `font: 500 12px/1 var(--font-px)` (which is
   `'Inter', system-ui, sans-serif`). If you find yourself reaching for
   `ui-monospace`, you probably want `var(--font-px)` with a numeric weight
   instead — Inter handles tabular display fine.

3. **Never invent a new accent color for a one-off use.** If `var(--accent)`
   isn't right, the answer is almost always one of: `var(--accent-dim)`,
   `var(--accent-glow)`, `var(--danger)`, `var(--success)`, `var(--warning)`.

4. **Surfaces inside the Today's Frame plate use slate, not white.** The
   plate is dark; cards sit on the plate. White-on-dark reads as a foreign
   import. Use `rgba(20,14,8,0.55)` with an amber-tinted border — that's
   the `.tfs-card` pattern (see `canvas-patterns.md`).

5. **Status is carried by the dot glyph color, not the whole pill.** The
   live pip uses a slate-on-slate base and changes only the `::before` dot
   between connecting / live / offline. Don't redesign the pill per state.

6. **Brand accent should appear sparingly.** A page with three amber CTAs
   competing for attention has none. If you've added a third amber pip,
   consider whether two should be ghost-pill or quiet-pill instead.

## What to mirror, not invent

When designing a new canvas surface, look first at the existing language:

- **Primary action** → `.tfs-btn-primary` (mirrors `.phase-step.active .ps-num`)
- **Secondary action** → `.tfs-btn-ghost`
- **Destructive / utility on a card** → `.tfs-btn-quiet`
- **Card surface inside the plate** → `.tfs-card`
- **Short etched note inside prose** → `.welcome-cta`
- **Number/badge** → mirror `.phase-step .ps-num`

Full snippets and when-to-use guidance live in `canvas-patterns.md`.

## Cross-references

- Pattern library with HTML/CSS examples: `docs/design/canvas-patterns.md`
- Voice rules (label the artifact, not the system): `docs/design/voice.md`
- Canvas surface: `product-library/product-library-v0.1.html` (root tokens at lines 21–50)
- Brand site source of truth: `alexandria-site/src/layouts/Layout.astro`
