# Vocabulary — module plan

Plain-English plan for the Vocabulary module. The Vocabulary module's job is to help a product owner name **the folders and subfolders** that organize their product's atomic wiki, so that every concept the team writes down has an obvious home and every reader can find what they're looking for by browsing.

This is a wiki-first product. Atomic cards are the unit; the folder tree is the navigation. Vocabulary is the module that decides what the tree looks like.

---

## What the director produces

When a director finishes a Vocabulary session, they have:

1. **A folder taxonomy.** A small number of top-level folders (typically 5–10), each holding subfolders that further divide what goes inside. The taxonomy is the wiki's map.
2. **A handful of stub cards in each leaf folder.** Enough to anchor the structure — not exhaustive. Stubs say "this folder holds things of this shape; here are a few we already have names for." The rest fill in as other modules run.
3. **A tag taxonomy** that the wiki view uses to render sub-groupings. Tags live in card frontmatter, not in file paths. Re-tagging is cheap; re-foldering is not.
4. **(Optional) A nomenclature signature.** A short style guide capturing the team's naming conventions (Anglo-Saxon over Latinate; gerunds for actions; first-name humanish for agents). Used as a lint check on future card names.

That output is the customer's wiki shell. Downstream modules fill the leaf folders with content.

---

## The director's experience

A Vocabulary session is short, browsing-led, and reassuring. The director:

- **Opens each candidate folder.** They see what's in it (drawn from their own Product Walk output upstream; or empty if there's nothing yet). They decide: yes, this folder belongs in my library; here's what I'd call it; here are the subfolders I'd want under it.
- **Names subfolders by feeling, not by rule.** If they want Roles → Human and Agentic, that's the call. If they want Roles → Heroes / Villains / Mobs / NPCs, that's also the call. The director's product determines the cut.
- **Confirms stub cards inside each leaf.** Raven proposes a few — pulled from the Product Walk and other handed sources. The director ratifies, edits, removes, adds.
- **Banks the structure.** The wiki shell is created in the library; tags are written into frontmatter; tombstones are written for any concept the director declares retired.

The session shouldn't take more than 30–60 minutes for a first-pass. Re-banking later is cheap.

---

## The two modes

Vocabulary runs in one of two modes — declared at session start, switchable on the fly.

### Compare mode

The director wants to see how others organize their products. Raven loads worked vocabularies for several products in the customer's adjacent space and uses a starting framework — ten broad categories that show up across software products: **Rationale, Research, Roles, Domains, Surfaces, Entities, Capabilities, Mechanisms, Patterns, Economy.**

For each category, Raven shows: which products in the worked corpus use it heavily, which leave it empty, what subfolders are common within it. The director adopts, mixes, rejects, or invents.

This mode is **comparative — grounding by example.** Useful for first-time directors, for products in a well-established category, for teams that want to see what good looks like elsewhere.

### No-compare mode

The director doesn't want a starting framework. They have their own model, their own vocabulary, their own intuition about how their product should be organized. They want to declare folders directly.

Raven supports this by *not* proposing the ten categories. She asks instead: "What are the load-bearing folders in your library?" The director names them. Raven asks the discovery and sharpening questions per folder, the same way she would in Compare mode, but without the framework scaffold.

This mode is **independent — for teams with strong existing intuition.** Equally valid. The output is the same shape (folders + subfolders + stubs + tags). The path there is different.

The form switches between modes via a single toggle. Compare mode is the default for new directors; no-compare is reachable in one click.

---

## Tags drive subfolders; subfolders aren't the file system

Cards live in their primary-category folder. The file system is shallow — usually two levels deep (top-level folder + leaf folder). Sub-classification within a leaf is *tag-driven*, not path-driven.

Per card:

```yaml
type: Role
prefLabel: Director
category: [Roles]              # primary — drives the file path
subcategory: [human]           # tags — drive view-time grouping
```

The wiki view reads tags and renders virtual subfolders. A `subcategory: [agentic, front-of-house]` card shows up in both the "Agentic Roles" group and (when filtered) the "Front of House" sub-group.

This buys re-categorizability without file moves. When a back-of-house agent role retires into a callable Play in the Playbook, the migration is: change a tag, write a deprecation tombstone, point the tombstone at the new home. The file system doesn't need surgery.

It also buys subfolder views without forcing the director to assign multi-dimensional paths. They name dimensions (Roles has subcategories Human and Agentic; Agentic has subcategories Front-of-house and Back-of-house); the view does the rest.

---

## Facets are optional and rarely needed

Some concepts genuinely sit in multiple categories. Playbook (Surface + Entity + Domain). A pricing Tier (Economy + Patterns). Streak (Entity + Economy + Pattern).

The form allows these as `facets:` in frontmatter — a list of secondary categories. Raven proposes facets when she sees a concept lighting up in multiple lanes. The director can accept or skip.

**Facets are not the default.** Asking a director to multi-categorize every concept during a first-pass session is operationally hostile. Most concepts have one obvious home. File them there. Note facet potential in the body if it matters. Move on.

The graph stays consistent regardless: a wikilink from a Surface card to Playbook resolves to Playbook's one canonical card, whether Playbook is tagged as one category or three.

---

## Product Walk is the upstream input

Vocabulary doesn't ask the director to invent their noun set from scratch. By the time the director engages Vocabulary, they've already completed a Product Walk module (the second module in the flow after Vision). The Walk surfaces seeds for every Product-plane category — named places, the verbs available there, the things visible there, the path between places, the feel.

Vocabulary's job is to refine and organize those seeds. The opener is:

> "Here's what your Product Walk surfaced. Let's place each piece in its folder. I'll suggest the structure and call out what looks missing; you confirm what fits and rename what doesn't."

Most of the discovery work has happened upstream. Vocabulary is structuring and sharpening, not extracting.

For products without a completed Product Walk (rare — Walk is upstream), Vocabulary falls back to source-mining (handed README, code, docs) the way the older module did. Slower path; still works.

---

## Robustness — the wiki must survive living architecture

Products evolve. Capabilities rename. Agents retire. Concepts move between folders. Vocabulary's output has to absorb this gracefully.

Three discipline lines support that:

- **Re-tagging is cheap.** Changing a card's `subcategory` is a single-line edit. The view reorganizes automatically. No file system surgery.
- **Deprecation tombstones are first-class.** When a concept retires (an Agent becomes a Play; a Tier renames), a Deprecation card is written at the old name pointing to the new. Existing wikilinks resolve to the tombstone; the tombstone redirects.
- **Re-banking is normal.** Vocabulary sessions can run repeatedly. The taxonomy is a living document. The first session establishes; subsequent sessions refine. The graph stays consistent across re-banks because cards have stable identity (the prefLabel + the source-evidence chain).

---

## Banking — what writes to the library

At bank time, the Vocabulary module emits:

1. **The folder structure** — created under `docs/alexandria/library/` (or the customer's equivalent root). Two levels deep by default; three only when the director explicitly declares a third level.
2. **Stub card files** — one per concept the director declared. Frontmatter populated (type, prefLabel, altLabels, category, subcategory, source_evidence). Body sections present-but-stubbed for downstream modules to fill.
3. **A Nomenclature Signature card** — if the director declared style rules. Filed in `rationale/standards/`. Used as a lint reference by Raven and any future card-naming work.
4. **Deprecation tombstone cards** — for any concept the director marked as retired. Each tombstone has a `replaced_by:` pointer.

That's the bundle. Vocabulary banked.

---

## What this module does NOT do

- Does not produce finished cards. Stubs only. Bodies fill in from downstream modules (Vision banks a thesis; Skeleton banks structure; Experience banks felt-shape; etc.).
- Does not enforce a fixed taxonomy. The ten-category framework is offered in Compare mode, optional in No-compare mode, and adjustable in both. Directors who want their own structure get it.
- Does not require multi-category facet decisions for every concept. Facets are optional and rare.
- Does not block on missing input. A director without a Product Walk can still run Vocabulary; she just does more source-mining inside the session.

---

## The canvas surface — sketch

The Vocabulary tool unrolls on the canvas when the director clicks the Vocabulary bar in the Knowledge Bank. Top of the form:

- Mode toggle (Compare / No-compare)
- Source panel (handed sources or Product Walk output banked upstream)
- Status line (drafted / pending / banked counts)

Body: an editable folder tree. Top level shows either the ten universal categories (Compare mode) or whatever the director declares (No-compare mode). Each folder expands to show subfolders and stub cards inside. Subfolders are editable (rename, add, delete). Each stub has the standard slot/notch/scratch row from the Vision Builder pattern.

Right-side panel: Raven's voice. Suggestions, sharpening questions, polysemy flags, MDA cautions when she sees mechanism-named concepts headed toward user-facing surfaces. Quiet by default; loud when the director engages a leaf.

Bank gesture: a single button at the bottom. Banking writes the folder structure and stub cards into the customer's library and marks the Vocabulary bar as completed in the Knowledge Bank kanban.

---

## Next steps

1. **Design the Product Walk interactive sequence.** Vocabulary depends on it. The Walk surfaces the seeds for five downstream modules including this one.
2. **Reshape elicitation prompts to assume Walk happened.** The opener and the per-folder discovery scripts change shape when most discovery is upstream.
3. **Build the canvas form.** Two-mode toggle, editable folder tree, Raven voice panel, bank gesture.
4. **Wire canvas-server endpoints and atomization.** Bank writes the folder structure and stubs.
5. **Dogfood end-to-end** against Alexandria first (the recursion case; tests the architectural-evolution scenario with the Agent→Play migration). Then against a partner product.
