---
name: product-english-card-bodies
description: >
  The authoring standard for product-library card bodies: write the WHAT / WHERE
  / HOW in the product's own plain language, keep every file path and code
  identifier in source_evidence (never in the prose), and keep event and ruling
  ids in frontmatter. Applied wherever a card body is written or revised — the
  Back-of-House walk's emit_bundle move, Front-of-House corrections, and EL5
  body-fill.
---

# Product-English Card Bodies

Use this skill whenever you write or revise a card body — the `## WHAT`,
`## WHERE`, and `## HOW` of a `<Type> - <Name>.md` card. It applies when the
Back-of-House walk's `emit_bundle` writes a stub body from a source read, when a
Front-of-House correction touches a body, and when EL5 fills a confirmed stub.

A card body is what the **director reads**. It describes what the product *is and
does*, in the product's own words. It is not where you record how the product is
built. The build layer already has a home — `source_evidence` — and the reader
never meets it in the prose.

## The one rule

The body names the **product**; the frontmatter holds the **machine**.

- **Body** (`## WHAT` / `## WHERE` / `## HOW`): plain product English — the
  product's own nouns, the director's own words, ordinary sentences.
- **`source_evidence`**: every file path and code location the card was drawn
  from. This field is already required on every card, so a path in the body is
  never *lost* by removing it — it is *already recorded* one line up in the
  frontmatter.
- **Frontmatter provenance** (`rulings:`; for EL5, the `atomic_card.created`
  Ledger event): director-ruling ids and event ids. Never inline in the prose.

If a sentence only makes sense to someone reading the source tree, it does not
belong in the body.

## What machine-speak looks like

Strip each of these from the body. None of them is lost — the path goes to
`source_evidence`, the id to frontmatter, the meaning stays in plain words.

- **File paths and filenames** — `packages/ax/src/domain/state-store.ts`,
  `events.jsonl`, `legs.json`. → already in `source_evidence`; drop from prose.
- **Code identifiers** — camelCase (`appendEvent`), snake_case
  (`wake_subscriptions`), dotted event names (`raven.vision.*`, `source.added`),
  type or constant names (`LibraryCatalog`, `BUILT_IN_AGENTS`). → say what the
  thing *does* in product words.
- **Route names** — `/ledger`, `/playbook`, `/raven/vision`. → "the Ledger
  view", "the Playbook view".
- **Scanner event indices** — `(event 11)`, `(event 24)`. → delete; they are
  noise.
- **Inline provenance ids** — `(event c7f0ed14…)`. → move the id to a `rulings:`
  frontmatter list; keep the ruling's *meaning* in the prose if it is
  product-relevant.

## Worked example — the Ledger card

**Machine-speak (wrong):**

```markdown
## WHERE
`docs/alexandria/ledger/events.jsonl` in the project workspace, written through
`state-store.ts`; the `/ledger` viewer route is a derived view of it.

## HOW
It contains each appended [[Entity - Ledger Event]]; a [[Mechanism - Trigger]]
is derived from its recorded history on read — recorded facts fire work
(event 11). The append machinery behind it (`state-store.ts`, the idempotent
`appendEvent` path) is engineering plumbing (event c7f0ed14…).
```

**Product English (right):**

```markdown
## WHERE
Kept in the project's workspace and shown in the Viewer's Ledger tab — a live
view of the record, not a second copy of it.

## HOW
Every [[Entity - Ledger Event]] is added to the end and never changed. Reading
that history is how a [[Mechanism - Trigger]] knows work is due — a recorded
fact is what fires the next play. The machinery that writes new events was ruled
engineering plumbing, not a product noun, and is kept only as a note.
```

Everything the wrong version *said* survives: the ledger lives in the workspace,
it is shown in the viewer, events are append-only, triggers read the history.
What is gone is the file paths (now in `source_evidence`), the code path
`appendEvent`, the scanner index `(event 11)`, and the raw ruling id (now in
`rulings:`). The meaning of the ruling — "engineering plumbing, not a product
noun" — stays, in plain words.

## How to translate one line

For each machine token in a body:

1. Ask what the token *means to a user of the product*, and write that.
2. If it is a file, path, or identifier, delete it from the prose — it is
   already in `source_evidence` (add it there if it is not).
3. If it is a provenance id, move it to `rulings:` (leave EL5 provenance to the
   Ledger event) and keep the ruling's meaning in the sentence.
4. Keep every `[[Type - Name]]` wikilink exactly — those are the product's own
   nouns and the diagram's edges.
5. Preserve real product facts, including numbers ("41 event types", "five
   regions"). A number is not machine-speak; a filename is.

Do not invent product facts to replace a token. If a body's meaning is genuinely
unclear once the machine-speak is gone, state the uncertainty — and in
`emit_bundle`, raise a Hot Spot — never paper over it with source mechanics.

## Negative cases

- A `## WHERE` that reads `packages/ax/src/domain/state-store.ts` violates this
  skill — that path belongs in `source_evidence`, not the prose.
- A `## HOW` that fires "on a `source.added` with no assessment (event 11)"
  violates this skill — say "when a new source is added but not yet assessed."
- A body that carries `(event c7f0ed14…)` violates this skill — the id goes to
  `rulings:`; the sentence keeps the ruling's meaning.
- Deleting a machine token *and its meaning* violates this skill — the meaning
  is preserved in product words; only the token is dropped.
- Rewriting a `[[Type - Name]]` reference into descriptive prose violates this
  skill — the wikilink stays verbatim.

## The gate

A body is not done until it carries no machine token. Check it:

```bash
node studio/tools/check-machine-language.mjs <output_path>
```

The gate scans card **bodies only** (frontmatter may carry code) and prints
`FAIL <card>` with the offending tokens for any body that still reads in
computer-speak. In the Back-of-House walk this runs inside `check_bundle`; a
`FAIL` routes REPAIR back to `emit_bundle`. A green gate is the floor, not the
ceiling — it catches tokens, not weak English, so a body must also *read* as a
plain product sentence.

## Never

- Never put a file path, filename, or code identifier in a card body — it goes
  in `source_evidence`.
- Never put a raw event id or ruling id in the prose — it goes in frontmatter.
- Never drop a product fact while removing a machine token — keep the meaning,
  drop only the token.
- Never rewrite or remove a `[[Type - Name]]` wikilink while de-machining a body.
- Never invent product meaning to fill a gap left by a removed token — state the
  uncertainty or raise a Hot Spot instead.
