# Product-plane bars — the next tranche

The Product Walk slice produced a working **module pattern** (1-page-template + deep-guidance + examples + dogfooded draft + interactive mock + Raven sub-skill brief) plus universal rituals (Review & Approve; the two-prompt review guidance; the schema-hierarchy discipline). The next tranche brings each of the remaining **Product-plane bars** in Raven's Knowledge Bank up to that same standard.

This plan is intentionally short and descriptive. It names *what we're building*, *what we already have*, *what's left*, and *how to sequence the work* — not deep technical phasing.

---

## The bars (5)

The Product plane in the Knowledge Bank, ordered by current build state and natural sequencing dependency:

1. **Vocabulary** — folder/subfolder taxonomy of the customer's nouns. *(Substantial work on PR #186; needs sharpening to the production pattern.)*
2. **Skeleton** — information architecture. The IA diagram the director would draw on a whiteboard.
3. **Surface** — catalog of named places in the product, one entry per surface.
4. **Experience** — felt-shape across the day: phases, rhythms, transitions, loops, cadences.
5. **Forward Plan** — what's coming, organized Now / Next / Later, plus deferred and refused.

---

## What "complete" means per bar

Mirror the Product Walk pattern. Each bar ships:

- **`1-page-template.md`** — the user-facing scaffold. Sections with prompt + length-or-hierarchy + pulling-for + quick-test. Includes the universal *Review & Approve* phase as its closing section.
- **`deep-guidance.md`** — per-section job/not-the-job/posture/failure-modes/diagnostic/connection-to-other-bars. Names Raven's draft-mode and review-mode postures explicitly.
- **`examples.md`** — good/bad worked examples per section. At least one **worked redline example** showing the review ritual with a real before-and-after.
- **`draft-<bar>.md`** — Alexandria's own dogfooded draft of the bar, banked by director redline + approval. Becomes the canonical exemplar.
- **Interactive mock** — standalone HTML/CSS at `prototype/product-library/<bar>-builder.html` + matching CSS. Static, mock data, four-phase or equivalent structure with explicit Review & Approve state.
- **Raven sub-skill brief** — short prose describing how Raven behaves during elicitation, draft, and review for this bar. Lives at `prototype/skills/raven/<bar>-drafting.md` (path mirrors Vision's pattern).
- **Modules.js registry entry** — bar slotted into `SUBJECT_ORDER` with the right unlock semantics.

---

## State today (per bar)

### Vocabulary
- ✅ Substantial: taxonomy design, 10 worked vocabularies, standalone Explorer prototype, grading rubric, lexicon-elicitation v1, vocabulary-elicitation v2 (on PR #186)
- ⏳ Missing: production-pattern design package (1-page-template / deep-guidance / examples in the same shape as Product Walk's); dogfooded draft for Alexandria's own vocabulary; interactive mock with Review & Approve state; Raven sub-skill brief
- 🔄 Carry-over: vocabulary v1 elicitation file marked as v1 reference — needs reshape against v2 taxonomy

### Skeleton
- ✅ Lightweight `1-page-template.md` exists (from Product Walk's Phase 1 scaffolding)
- ⏳ Missing: `deep-guidance.md`, `examples.md`, dogfooded `draft-skeleton.md`, interactive mock, Raven sub-skill brief
- 💡 The ASCII architecture sketch from the original Product Walk mock probably belongs here — Skeleton-the-bar is the natural home for "draw me a picture and I'll redline it"

### Surface
- ✅ Lightweight `1-page-template.md` exists
- ⏳ Missing: same as Skeleton

### Experience
- ✅ Lightweight `1-page-template.md` exists
- ⏳ Missing: same as Skeleton

### Forward Plan
- ✅ Lightweight `1-page-template.md` exists
- ⏳ Missing: same as Skeleton

---

## Proposed sequencing

The bars are coupled enough that finishing one improves the next. Suggested order:

1. **Vocabulary first.** Most work in flight; finish what's started before opening new fronts.
2. **Skeleton next.** Naturally hosts the ASCII-sketch affordance. Director sees an IA diagram and reacts — high info-gain per minute.
3. **Surface.** Uses Walk + Skeleton output directly; catalog is a comparatively easy interactive shape.
4. **Experience.** Felt-shape narrative is harder to scaffold; benefits from having the structural bars settled.
5. **Forward Plan.** Most aspirational; needs the other bars to point at.

This is a recommendation. The director can shuffle if a partner-product dogfood pulls a specific bar forward.

---

## Universal patterns to carry across every bar

These came out of the Product Walk slice and should land identically in each bar:

- **Review & Approve as the closing phase.** Director reads, redlines, approves verbally. Status flips from *Draft* to *Approved* on the explicit verbal signal — never auto-flips. Concerns Raven logs do not gate approval (chain of command).
- **Two-prompt review guidance** (see `product-walk/examples.md § 4`):
  - *Director:* catch factual misses + unsettled preferences.
  - *Raven:* don't let clarification-depth become written weight.
- **Schema-hierarchy discipline** (see `product-walk/1-page-template.md § 1`): sections should bucket findings into headline / structural / edge-case rather than leaving prose unconstrained. Prevents conversational depth from inflating into prose weight.
- **Worked redline example** in each bar's `examples.md`. The real session is the teaching material; sanitized examples don't teach.

---

## Shared decisions to settle once, across all bars

These came up during Product Walk and apply to every bar. Worth deciding once at the top of the tranche:

- **"Approved" rename for the bar gate.** "Discussed" is dangerous framing. The replacement term (Approved? Called? Sealed?) should be picked once and used in every bar's gate, modules.js status, and playbook unlock semantics.
- **Bar-draft file location.** Walk artifacts land at `docs/alexandria/library/product/walks/<product-slug>/`. Each bar's drafts probably land at `docs/alexandria/library/product/<bar>/<product-slug>.md` — confirm.
- **Prefill mechanics.** When the Walk is approved, it produces prefill for each downstream bar (per `product-walk/deep-guidance.md § 5`). The exact mechanism (writes a draft markdown file? injects state into the bar's JSON? on-first-render reads the Walk synthesis?) needs to land once and apply to all bars.
- **Universal status flow.** *Locked → Unlocked → In-elicitation → Draft → In-review → Approved → Re-opened?* Pick the canonical state machine.
- **What unlocks what.** The current canvas has unlock gates ("Needs Vocabulary at Discussed"). Confirm or rewrite the unlock graph for the Product plane bars.

---

## What this tranche does NOT cover

- Strategy plane bars beyond Vision (Bets, Guardrails, Standards) — separate tranche.
- Learning plane bars (User Research, Competitive Intel, Decision Trail, Product Evidence) — separate tranche.
- The SimCity-style company organism map — far-future, not in this tranche.
- The federation of multiple libraries — far-future.
- Real canvas-server wiring beyond static mocks — separate engineering slice.

---

## Definition of done for the tranche

- All five bars ship with the full package (template, guidance, examples, dogfooded draft, mock, sub-skill brief).
- The shared decisions above are settled and applied consistently.
- Each bar has been dogfooded against at least one real product (Alexandria itself, plus a partner where possible).
- A short retrospective at the end of the tranche names what should change in the universal pattern for the *next* tranche (Strategy + Learning).
