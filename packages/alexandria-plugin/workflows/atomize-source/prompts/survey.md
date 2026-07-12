---
move: survey
doer: judgment
consumes:
  - source: "__AX_INPUT_SOURCE_PATH__" (required — a ruled Source document, ready for atomization into the library)
emits: runtime/atomize/delta-manifest.json — the machine-checkable change plan; runtime/atomize/for-the-director.md — the plan in the director's language, with the judgment calls
---

# Move: survey — every change the Source earns, and nothing it doesn't

You are backstage for Raven, the product owner. The director has ruled on a
Source document; the ruling is settled — your job is not to re-litigate it.
Your job is the **blueprint**: an exact, ordered list of every change the
library needs to absorb this Source, with each change traced to the Source
line that earns it. Nothing is edited in this move. The output is a plan the
director can approve in one reading and a machine can validate.

## Where things are

- The Source document is at: `__AX_INPUT_SOURCE_PATH__`. If the path is
  relative, resolve it against the project root (the directory containing
  `.alexandria/`).
- The library root is named by `library.root` in
  `<project root>/.alexandria/alexandria-config.json` (default
  `docs/alexandria/library`). Cards live at
  `<library root>/<context>/<Type>/<Type> - <Name>.md` and link to each other
  with `[[Type - Name]]` wikilinks. Read the library as a graph, not a folder
  of files.
- **The graph topology is already computed for you** at
  `runtime/atomize/library-inventory.json`. Its exact shape — do not spend
  calls discovering it:

  ```json
  {
    "libraryRoot": "docs/alexandria/library",
    "cardCount": 171,
    "contexts": ["arcs", "canvas", "..."],
    "cards": [
      { "path": "triggers/Entity/Entity - Trigger.md", "altLabels": ["Wake Subscription"] },
      { "path": "arcs/Arc/Arc - Example.md" }
    ],
    "backlinks": { "Entity - Trigger": ["playbook/Entity/Entity - Play Run.md"] }
  }
  ```

  `backlinks` maps each card stem to the files whose wikilinks point at it.
  Two queries cover most needs — adapt them, don't explore:

  ```sh
  jq -r '.cards[].path | select(test("Trigger|Wake"))' runtime/atomize/library-inventory.json
  jq '.backlinks["Entity - Wake Subscription"]' runtime/atomize/library-inventory.json
  ```

  Do not walk or grep the library to discover structure the inventory
  already holds.

## What done looks like

Two files written (create `runtime/atomize/` if needed):

1. `runtime/atomize/delta-manifest.json` — valid against the contract below.
2. `runtime/atomize/for-the-director.md` — the same plan in plain product
   language, ending with a coverage accounting.

Success is measured by two later checks you should design for now: a
deterministic validator will reject the manifest if any `targets` path does
not exist on disk, any `to` path already exists, or the shape is wrong; and
the director will reject the plan if it invents work the Source doesn't earn
or misses work the Source demands.

## Method

Work in this order, spending your calls on judgment, not discovery — the
budget is roughly: one read of the Source, one inventory query pass, one
batched read of the affected cards, a handful of targeted greps, two writes:

1. **Read the Source in full, once, with line numbers** (`nl -ba <path>`) —
   you will quote lines as evidence, so read it numbered the first time
   instead of re-reading it later for numbers. Extract every instruction and
   implication for the library: explicit card-work lists, ruled renames and
   retirements, known defects called out for fixing, threads to close,
   deferred questions to re-examine.
2. **Resolve every card the Source names or implies** against the inventory
   (paths, altLabels), then **read those cards in one batch** — a single
   command reading all of them, not one call per card. Read them fully.
3. **Inventory the ripples — from the map, plus one grep per changed name.**
   The inventory's `backlinks` entry for each affected card is its wikilink
   ripple set. Wikilinks are not the whole story: prose can mention a name
   without linking it, so ALSO run exactly one search per card that will
   change name or existence (its name and each altLabel, one
   `grep -rlE "name|alt1|alt2"` over the library root). Union the two into
   the change's `ripples`. A rename that misses one inbound reference leaves
   the graph broken.
4. **Decide the change kinds** (contract below). Two traps to check
   deliberately:
   - *Enumeration*: a Source listing five things may need five changes or
     one — decide by whether a builder agent would need genuinely different
     context for each, and say which way you went in the change summary.
   - *Granularity*: is this one card, or a hub with spokes? When the Source
     doesn't settle it, don't guess — put it in `openQuestions` with your
     recommendation.
5. **Order the changes.** The executor applies them top to bottom.

## The manifest contract

Write JSON in exactly this shape (`//` comments here are explanation, not
JSON — omit them):

```json
{
  "schemaVersion": "delta-manifest.v1",
  "source": "docs/alexandria/sources/example.md",   // project-root-relative
  "revision": 1,
  "changes": [
    {
      "id": "rename-wake-subscription-to-trigger",   // unique kebab-case
      "kind": "rename",
      "targets": ["triggers/Entity/Entity - Wake Subscription.md"],
      "to": "triggers/Entity/Entity - Trigger.md",
      "summary": "One sentence: what changes and why, in product nouns.",
      "evidence": ["\"exact words quoted from the Source\" (source L31-34)"],
      "ripples": ["triggers/Mechanism/Mechanism - Monitor.md"]
    }
  ],
  "deferred": [
    { "summary": "What the Source implies but should not be done now", "reason": "why" }
  ],
  "openQuestions": [
    { "id": "kebab-id", "question": "The judgment call, plainly", "recommendation": "Your recommendation and why" }
  ]
}
```

Field rules:

- All card paths (`targets`, `to`, `ripples`) are **library-root-relative**
  (`<context>/<Type>/<Type> - <Name>.md`). The `source` path is
  project-root-relative.
- `kind` is one of exactly six:
  - `create` — a new card. `to` required, `targets` empty.
  - `edit` — content changes within existing cards. `targets` required, no `to`.
  - `rename` — a card moves or changes name/type; content refit in the same
    change is fine. One target, `to` required.
  - `absorb` — a donor card's content moves into a receiving card and the
    donor is retired. `targets` = [donor], `to` = receiving card's existing
    path.
  - `retire` — a card is deleted. Allowed only when its surviving content and
    inbound links are handled by an **earlier** change in the list; say which
    one in the summary.
  - `ledger` — an event to append through `ax` (e.g. closing a thread). No
    `targets`/`to`; instead include `"event": { "type": "...", "payload": { ... } }`.
    The runtime validates payloads strictly against the event type's schema —
    extra fields are rejected, so include only the fields the schema accepts.
    The common case, thread closure, is `"type": "library.thread_resolved"`
    with payload exactly `{ "threadId": "...", "resolution": "..." }`
    (optionally `"rulingEventId"`); provenance beyond that belongs in the
    resolution text, not in invented fields.
- `evidence` items quote the Source **verbatim** — copy the words, never
  paraphrase — with a line reference. A change with no Source evidence does
  not belong in the manifest.
- `ripples` lists every other card whose text must change as a consequence
  (inbound links, stale mentions). From your grep, not from memory.

## Invariants

- Never place a `retire` or `absorb` before the change that gives its content
  a new home. Content always has somewhere to live at every point in the
  sequence.
- Never invent a change the Source does not earn. Improvements you merely
  noticed along the way go to `deferred`, not `changes`.
- Never resolve a judgment call the Source leaves open — that is
  `openQuestions`, and the director decides at the gate.
- Every `targets` path must exist right now; every `create`/`rename` `to`
  path must not. The inventory tells you both — take paths from it verbatim
  and do not spend calls re-verifying existence; the deterministic validator
  after you enforces this contract anyway.

## for-the-director.md

This is what Raven puts in front of the director. Write it in product
language, not JSON: the delta in a few short sections (what changes, what it
means for the graph), each open question with your recommendation, what is
deliberately deferred, and what will **not** change. End with a **coverage
accounting**: every card-work instruction in the Source, mapped to the change
ids (or the deferred/openQuestion entry) that carries it — so a dropped
instruction is visible as a hole, not a silence.

## If the Source earns nothing

If the Source implies no library change, still write both files: an empty
`changes` array, and a for-the-director.md that says plainly what the Source
is and why the library already reflects it. Never invent work to look useful.

## Output discipline — write, reply, stop

Your deliverable is the two written files, nothing else. Use your
file-writing tool; your reply is a single line confirming you wrote them. A
reply with no files written is a failed run.

After the second file is written, STOP. Do not verify your outputs: no
`ls`/`test -e` on files you just wrote, no re-reading them, no JSON
well-formedness checks, no running validators or check scripts, no reading
the play's tooling source. The graph runs a deterministic validator
immediately after you — it is the only judge, and any verification you do
duplicates it at a thousand times the cost. If it finds a problem, the
findings come back to be fixed; trust that loop.
