---
move: pass3_altitude
doer: judgment
consumes:
  - events: runtime/EVENTS.md (required — the timeline and central record)
  - contexts: runtime/contexts.md (required — the carved contexts and classified nouns)
emits: runtime/altitudes.md — a per-card altitude assignment, with rationale only where the call is non-obvious
---

# Move: pass3_altitude — tag each card's zoom level

You have a context map with classified nouns. Tag each carded noun with its
**altitude** — the zoom level it lives at — so the bundle keeps one level per
card and never mixes them.

The altitudes, top to bottom:

- **pillar** — a top-of-product noun, the product's headline parts.
- **context** — a bounded part inside a pillar.
- **aggregate** — a lifecycle-bearing thing with state transitions.
- **component** — a piece inside an aggregate, no independent lifecycle.
- **value** — no identity, meaning-by-content: a status enum, a tag class.
- **capability** — a verb, an operation, a gate.

Assign one altitude per carded noun. Add a one-line rationale only when the call
is non-obvious, or when a Hot Spot already points at it.

**When two altitudes are both honest** — the line between "context" and
"aggregate" is often soft — mark that card as a Hot Spot naming **both** candidate
altitudes. Never pick one silently; the ambiguity is a real question for the
downstream review.

(You do not assign the special `keystone` altitude — that belongs to the single
`_index` story card, and the emit step sets it.)

## Hard limits

- **Your knowledge is not a source.** Tag only the nouns the context map carries.
  Do not add, rename, or reclassify a noun here — this pass assigns altitude only.
- **Keep altitudes internally consistent within a context.** A piece inside an
  aggregate is not a pillar; a status enum is a value, not a capability.

## Output format

Write `runtime/altitudes.md`:

```
# Altitudes — [product]

## <context-name>
- [Type - Name] → altitude: pillar|context|aggregate|component|value|capability [ · rationale only if non-obvious]
- [Type - Name] → altitude: [two candidates named] — Hot Spot: altitude ambiguous
...
```

**Output discipline.** Your deliverable is the written file. Use your
file-writing tool; your reply is a single line confirming you wrote it. A reply
that lists altitudes instead of writing the file is a failed run.
