# Vocabulary grading rubric

Rubric for evaluating Vocabulary worked-output quality, both during the design-package build (this rubric grades the 8 example Vocabularies before they synthesize into downstream guidance) and as the runtime quality bar Raven applies to Vocabularies she helps directors produce.

A Vocabulary is **bankable at B+ or above**. Below B+ → fix before banking. F → rebuild.

**Schema version: v2-tree-mode** (post-pivot). Cards live in real nested subfolders; `subcategory:` tags determine the path. Older "flat with tags" mode is retired.

---

## Section 1 — Structural conformance (binary; any failure = needs fix)

Each stub card must:

| Check | Pass criterion |
|---|---|
| Frontmatter present | YAML block at top |
| Required fields | `type`, `prefLabel`, `altLabels`, `category`, `subcategory`, `user_visible`, `status`, `proposed_by`, `source_evidence` |
| `category:` is a YAML list with **one** value | `[Roles]` not `[Roles, Patterns]` — primary category only |
| `subcategory:` is a YAML list of tags | `[human]` or `[agentic, front-of-house]` — empty list `[]` if no sub-tags |
| `facets:` field (optional) | YAML list of OTHER universal categories the concept genuinely faces into; absent or `[]` when not a multi-category facet card |
| No `audience:` field | Dropped in v1→v2; if present, remove |
| `altLabels:` form | `[]` if empty; YAML list otherwise |
| `source_evidence:` is real URL(s) | No `<URL>` placeholders |
| Filename matches type | `Role - X.md` for type Role, etc. |
| **File path matches category + subcategory chain** | Card at `<category-folder>/<sub1>/<sub2>/<file>.md` where sub1/sub2 come from the card's `subcategory:` tags in order. Empty subcategory → file lives at top of category folder. |
| Body has 5 dimensions | WHAT / WHERE / WHY / WHEN / HOW sections present |
| Body uses stub convention | `_Stub —_` pattern for unfinished sections |

Valid type values: Role, Entity, Surface, Capability, System, Pattern, Economy-instance, Standard, Domain, Deprecation.

**Common failures:**
- Card still uses v1 multi-valued `category: [Entities, Patterns]` rather than `category: [Entities]` + `facets: [Patterns]`.
- Card's file path doesn't reflect its `subcategory:` chain. A card with `subcategory: [agentic, front-of-house]` filed at `roles/Role - X.md` (flat) instead of `roles/agentic/front-of-house/Role - X.md` (nested). The tree-mode pivot requires real directory structure.

---

## Section 2 — Voice quality (A / B / C / D)

For each Vocabulary's stubs:

- **A**: Single-paragraph WHAT for routine concepts; two-paragraph WHAT for concepts with naming history (MDA inversion, facets, deprecation, polysemy, signature-rule-violation case). Voice matches Linear/Duolingo register. No gold-plating in body sections 2–5.
- **B**: Mostly A; one or two stubs gold-plated or missing the second paragraph where it was warranted.
- **C**: Voice inconsistent across the Vocabulary; some stubs read finished rather than stub.
- **D**: Body sections 2–5 fleshed out beyond stub discipline; reads like a built card.

**Common failure:** Sonnet adds finished WHERE/WHY/WHEN/HOW content instead of staying in stub form.

**Recursion-case exception.** For Vocabularies that back-map an existing library (e.g., Alexandria-on-Alexandria), the central concepts can carry fleshed WHAT sections because real card content exists for them. This is honest voice, not over-elaboration. Stubs remain the rule for fresh-customer Vocabularies (where bodies are filled by later modules); back-mapping Vocabularies may have fleshed bodies for concepts the existing library already documents. Treat fleshed bodies in a back-mapping Vocabulary as A-grade, not C-grade.

---

## Section 3 — Diagnostic application (A / B / C / D)

For each Vocabulary:

- **MDA inversion guard applied correctly**: `user_visible: true` only when the noun appears on a user-facing surface; `user_visible: false` for engine-internals even when their effects are felt
- **Process-vocab leak check**: no process-language borrowed without flagging (Sprint, Velocity, etc. flagged or process-neutralized like Cycle)
- **Audience-fit drift check**: where applicable, two-audience products distinguish operator-role from end-customer-role via subcategory tags (e.g., `subcategory: [operator]` vs `subcategory: [end-user]`)
- **Facets identified correctly**: cards that genuinely span multiple categories declare `facets: [<other-categories>]`; cards that don't, don't. Facets are rare and optional, not the default.
- **Polysemy flagged**: when one word covers multiple concepts in the Vocabulary, the conflict surfaced

**Common failure:** `user_visible: true` set indiscriminately, including for engine internals like System cards.

---

## Section 4 — Cross-link discipline (A / B / C / D)

For each Vocabulary:

- WHERE section has 2–4 wikilinks pointing at real cards in the directory tree
- Wikilinks use `[[Type - Name]]` format (not bare strings)
- Facet cards reference the categories they face into via in-body cross-links to representative neighbors in those other folders
- Deprecation tombstones cross-link to active replacement and vice versa
- Cross-links resolve to files that exist (not phantom links to cards not written)

**Common failure:** Sonnet writes `[[Family X]]` or `[[families.md]]` as a wikilink — these don't resolve in the directory tree. Cross-document references need a separate convention.

---

## Section 5 — Signature card quality (A / B / C / D)

For each Vocabulary's `_signature/Standard - <Product> Nomenclature Signature.md`:

- **A**: 5–8 inferred rules; each concrete enough to lint against; includes positive example from the product; flags any rule that the product violates (a known exception)
- **B**: 4–7 rules; mostly concrete; one or two rules too abstract to lint
- **C**: 3–5 rules; mixed concrete/abstract; no exceptions flagged
- **D**: <3 rules OR rules so abstract they're not lintable

**Common failure:** Rules like "names should be clear" — true but unenforceable.

---

## Section 6 — README quality (A / B / C / D)

For each Vocabulary's `README.md`:

- **A**: Opens with Vocabulary framing (umbrella concept defined); folder structure tree shows top-level categories AND declared subcategories AS REAL NESTED PATHS (`roles/human/Role - Director.md`, not `roles/Role - Director.md` with a "subcategory: human" annotation); frontmatter shape documented with `category`/`subcategory`/`facets` distinction; Rationale/Research-owner-supplied note included
- **B**: Most of A; one or two elements thin (e.g., subcategory taxonomy listed but not explained, or the tree block uses old flat-with-tags rendering)
- **C**: Has the structure but missing the framing or the closing note; or the tree block doesn't reflect the actual filesystem tree
- **D**: Missing structure tree OR documents an outdated schema (e.g., still references multi-valued category as the facet mechanism, or describes tag-driven views as the convention)

---

## Section 7 — Subfolder taxonomy quality (A / B / C / D)

**Tree-mode (post-pivot).** For each Vocabulary, does the actual filesystem tree match the product's natural organization?

- **A**: Each populated category folder is partitioned into meaningful subfolders that match how the team intuitively groups concepts. Subfolders exist as real directories on disk; every card lives at a path matching its `subcategory` chain. README documents the tree shape explicitly with paths shown. Subfolders are *useful to a human browsing the wiki by clicking through folders*.
- **B**: Most categories have real subfolder partitioning; one or two flat where they should be partitioned, or partitioned where flat would be cleaner. Tree exists on disk but README documents it incompletely.
- **C**: Several categories left flat that need partitioning (e.g., Roles flat when Human/Agentic split is obvious for the product); OR subcategory tags exist in frontmatter but files weren't moved into matching subfolders (frontmatter-vs-disk mismatch).
- **D**: No subfolder taxonomy declared; all cards carry empty `subcategory: []` even when the product clearly has sub-cuts; everything sits at the category folder root.

**Common failures:**
- Roles category left as a single flat list when the product has obviously distinct sub-types (Humans vs Agents in Alexandria; Heroes/Villains/NPCs in gaming).
- Subcategory tags present in frontmatter but files weren't moved to the matching subfolder paths (the v2 pivot requires both — tags AND real paths in sync).
- Subfolder depth limit: real-world taxonomies rarely exceed 3 levels under a category. If a Vocabulary declares 4+ deep, suspect over-partitioning.

---

## Section 8 — Framework stress documentation (Alexandria only)

Alexandria's README and overall Vocabulary should include a "where the framework stresses" section honestly listing seams. The earlier Sonnet run surfaced seven; the README should preserve them. **Pass = all 7 seams documented; fail = framework treated as exhaustive.**

---

## Per-Vocabulary overall grade

| Grade | Meaning | Action |
|---|---|---|
| A | All sections A; structural pass | Bank as canonical exemplar |
| B+ | Worst section is B; structural pass | Bank; note minor improvements |
| B | One section is C; structural pass | Bank with caveats; flag for re-bank |
| C | Two sections C OR one D; structural pass | Fix C/D sections; rebank |
| D | Multiple D's OR structural failure on rare fields | Re-write the affected portions |
| F | Structural failure on required fields OR cross-link tree broken | Rebuild from scratch |

---

## Output of a grading pass

Per Vocabulary:
- Structural conformance: pass / fail (with file list of failures)
- Voice grade: A / B / C / D
- Diagnostic grade: A / B / C / D
- Cross-link grade: A / B / C / D
- Signature grade: A / B / C / D
- README grade: A / B / C / D
- Subfolder taxonomy grade: A / B / C / D
- Framework stress (Alexandria only): pass / fail
- **Overall grade**
- **Fix list** (specific files + specific changes needed)

Plus a cross-corpus synthesis:
- Systemic issues that show up across multiple Vocabularies (worth fixing via batch operation)
- Patterns where the corpus is unusually strong (worth promoting to canonical examples in downstream guidance)
