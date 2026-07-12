# Front-of-House Walk — Concrete Walk Spec (turn by turn)

Companion to `plan.md`. This is the **buildable** spec: the turns, the
presentation templates, and the events — grounded in the real PMS sweep
(`studio/sweeps/playmaker-studio/`, 96 cards). `plan.md` carries the rationale and
the coordination with #480/#481; this carries the shape to build.

> **Depends on #480 ("the table"):** a `context`-grouped, `plane → context`-ordered
> agenda whose items carry `context`/`plane`, the `kind`/`origin` axes, and the
> concerned card link. This spec consumes that and adds the stance/structure on top.

## The shape

```
Turn 0      Headline / keystone        — confirm the container set + the lens
Turn 1..N   Section comprehension      — one per context, plane → context order
              ↳ closes with a section_confirmed (§11 of plan.md)
Turn N+1..  Held-back problems         — hot_spots, grouped by section, after the pass
Finalize    Residual accounting        — RESIDUAL-GAPS.md (unchanged)
```

Stance throughout: **"here's what I think I know; here's what I know I don't."**
Raven presents a read for confirmation; she does not interrogate from blind.

---

## Turn 0 — Headline / keystone

**Reads:** the keystone card (`context: _index`, `altitude: keystone` — it exists
in real bundles and stays in `catalog.cards`; `library-catalog.ts:374`), the
container set (the distinct `context` values per `plane`), and #481's walk-level
"confirm the search frame" thread (`fence`/`domain`).

**Why this turn earns its place — the real drift (verified on PMS).** The keystone
thesis and the context grid disagree, and nothing reconciles them today:

| keystone thesis names (8 containers) | actual card `context` values (6) |
| --- | --- |
| `brief`, `workflow` | `authoring` (collapsed) |
| `proving` | `proving` ✓ |
| `production-line` | `production-ladder` (renamed) |
| `board`, `catalog` | `board`, `catalog` ✓ |
| `make-a-play`, `operations` | *(no cards)* |
| — | `runs` *(not in the thesis)* |

Plus a `plane: product` (keystone) vs `plane: Product` (cards) case split. The
thesis was written by a different producer (`proposed_by: scanner`) than the leaves
(`proposed_by: back-of-house-walk`) — so the thesis reads human but its container
story doesn't line up with what the walk actually carved.

**Raven presents (template):**

```
This is my read of the whole product, one level up.

  <keystone WHAT, in human terms — already decent in the data>

I think your major pieces are:
  • <container A — human name>   <one-line gloss>
  • <container B — human name>   <one-line gloss>
  ...

A few I'm unsure of:
  • Your thesis names "production-line" but the detail sits under
    "production-ladder" — same thing, or two?
  • "brief" and "workflow" in the thesis are one bucket ("authoring") in the
    detail — keep them split or merged?
  • "make-a-play" / "operations" are named but have no detail yet — real pieces,
    or drop them?
  • "runs" has detail but isn't in your thesis — add it?

And the frame I searched under: I assumed <domain actors/vocab>, and fenced out
<out-of-scope>. Right?
```

**Director confirms / corrects:** the **canonical container set and their human
names**, the plane grouping, and the search frame. FoH owns these edits
(`context` + `prefLabel` are in the allowed-set), so renames land here. The
confirmed container set + frame seed every section turn below.

**Banks:** `turn_recorded` (agent) → `answer_recorded` (user) per ruling →
structural patch (`apply_bundle_patch`) for any `context`/`prefLabel` rename. The
keystone **body is not rewritten** (EL5 owns prose); only its container *structure*
is reconciled.

---

## Turn 1..N — Section comprehension (one per `context`)

Walked in `plane → context` order (canonical plane order, `library-catalog.ts:348`)
so it tracks the Index top-down. One turn per confirmed container.

**Raven presents (template — the `for-raven` flip from "a question" to "a read"):**

```
Section: <human container name>   (internal: <raw context>)

What I think this is:
  <2-3 human sentences synthesized from the section's card WHATs, de-jargoned —
   NOT the WHERE/HOW code refs>

The pieces in here:
  • <card prefLabel>   — confirm the name
  • <card prefLabel>   — confirm the name
  ...

What I think I know (confirm these — I inferred them):
  • <origin=inference item — translate_search_prior / low-confidence>
  • ...

What I know I don't know (found a gap in the source):
  • <origin=source gap item — the director-register `question`>
  • ...
```

The two lists are the heart of the stance, and they come straight from #480's
axes: **`origin = inference`** (the `translate_search_prior`, low-confidence
threads) = "what I think I know, confirm it"; **`origin = source`** = "what I know
I don't know." `kind = hot_spot` items are **withheld** to Turn N+1.

> **Shipped (#482):** these axes are live on the agenda item (`origin` ∈
> {`source`, `inference`, `frame`}, plus `confidence`/`basis`), and `for-raven.md`
> already renders them. What's left here is the *stance framing* above + the section
> close. `frame`-origin items feed **Turn 0**, not the section turns. #482's default
> sort interleaves `hot_spot` after `stage2_question` **within each context** —
> holding them to Turn N+1 is this slice's traversal choice (plan.md §13 / D5).

**Director rules** each item via the existing answer flow
(`ax raven answer …`); structural corrections (`prefLabel`/`context`/`plane`/
`status`/relationships) patch as today.

**Section close — the `section_confirmed` (plan.md §11):** Raven synthesizes the
agreed human summary of the section; the director confirms; a `section_confirmed`
process-fact banks it (human label + summary + scope + card set + unknowns),
citing the user answer. This is the human-language prior EL5 inherits — so EL5
rewrites the computer-ese `WHERE`/`HOW` bodies from the director's framing instead
of from `StudioApp.tsx`.

*Real example.* Section `proving` → confirm human name "Proving a Play"; summarize
from its cards (Pass Rate, Stage Status, …) without the file-path `WHERE`s; confirm
the inferred scope; rule its source-gaps; bank the summary.

---

## Turn N+1.. — Held-back problems (hot_spots, grouped by section)

Only after the comprehension pass. Raven offers the `hot_spot` items as a
collected list, **grouped by the section they concern**, framed as a gift:

```
Now that we've walked the sections — I also flagged some likely problems.
Want to rule on any? (We can also leave them for later.)

  Board / Production Ladder:
    • A Play advances two ways — manual stage-confirm vs the auto-advance
      contract. Which is canonical for a given Play?
  Catalog (vocabulary):
    • "Tier" means two things (criticality band vs role tier) — one word or rename?
    • "Bank" means two things (output bank vs package bank) — keep or split?
  Runtime:
    • "Play Run" — first-class Entity, or demote into the runtime context?
  ...
```

(The PMS sweep's hot-spots are exactly these judgment calls — two-advancement-
mechanisms, the Tier/Bank polysemies, the Play-Run demotion, register-location,
the two human-gate models, the failure-exit collapse.) The director rules or
defers; deferred ones residual like any other item.

---

## Finalize — Residual accounting (unchanged)

`finalize_accounting` writes `RESIDUAL-GAPS.md`; provenance and body-preservation
gates hold exactly as today. **Outputs EL5 reads:** the corrected bundle, the
`section_confirmed` events (human framing per container), and the residual list.

---

## Ownership recap

- **#480 sets the table:** context grouping, `plane → context` order, `kind`/
  `origin`/`context`/`plane`/card-link on each agenda item, "Unfiled" catch-all.
- **This spec adds, on top:** Turn 0 headline/keystone reconciliation (slice C),
  the held-back hot_spot pass (slice B), the presentation flip + `section_confirmed`
  (slice D).
- **Boundary holds:** structure only; no card body is written in FoH. The keystone
  and leaf bodies are reconciled for *structure* and re-authored for *prose* in EL5.
