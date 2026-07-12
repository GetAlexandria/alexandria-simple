# Play Design Brief - Front-of-House Walk

```
status:   built
tier:     senior
division: Product
function: Library Operations
fronted-by: Raven
chain:    EL3 of the library-elicitation chain
proven:   no
```

## 1. Goal

Walk the director through the customer/product-facing side of an EL2 draft
library bundle. The play consumes the bundle, `STAGE-2-BRIEF.md`, and
`HOT-SPOTS.md`; it emits director-answer Ledger events, validated
section/shape-level card corrections, and `RESIDUAL-GAPS.md`.

EL3 stops at structure. It confirms or corrects `prefLabel`, `context`,
`plane`, `status`, and relationships. It does not fill card bodies and does not
harden per-noun identity.

## 2. Trigger

Raven launches the play detached:

```bash
ax run front-of-house-walk --input bundle=/abs/path/to/el2-bundle --json
```

The director is not required at launch. The run suspends at a human-input unit
for each agenda item and wakes Raven. Raven mediates the answer and resumes the
run with:

```bash
ax raven answer --run <fabroRunId> --question <questionId> --bundle /abs/path/to/el2-bundle --text-file /abs/path/to/answer.md --json
```

## 3. Required Knowledge

- `bundle` (required directory path): the EL2 worked-data folder tree.
- `STAGE-2-BRIEF.md`: Stage-2 questions; this is the agenda's first half.
- `HOT-SPOTS.md`: discussion items; this is the agenda's second half.
- Small-floor stub cards under the bundle: frontmatter includes `type`,
  `prefLabel`, `context`, `plane`, and `status`.
- Ledger events: director rulings are durable only as
  `library.front_of_house.answer_recorded` with `actor.kind = user`.

## 4. Golden Path

1. `prepare_agenda` parses the Stage-2 brief and Hot Spots into
   `runtime/front-of-house/agenda.json`.
2. `stage_next` writes the next unresolved item to `current-item.json`,
   `current-item.md`, and `for-raven.md`.
3. `director_review` suspends. Raven records the presented turn, riffs with the
   director, and sends one agreed answer.
4. `plan_bundle_patch` drafts a narrow JSON patch citing the director answer
   event id.
5. `apply_bundle_patch` rejects any patch without a matching user answer event,
   then applies allowed frontmatter and relationship updates.
6. The loop repeats until every item is answered or residualed.
7. `finalize_accounting` writes `RESIDUAL-GAPS.md`.

## 5. Output Contract

- Card frontmatter stays Small-floor.
- Card bodies are preserved.
- No director-attributed value is accepted without a matching
  `actor.kind = user` answer event.
- Unanswered agenda items land in `RESIDUAL-GAPS.md`.
- Raven turns are `actor.kind = agent`; director answers are
  `actor.kind = user`; patch/residual facts are `actor.kind = process`.

## 6. Proof Spec

Minimum proof before Proven:

- Detached launch reaches awaiting input without a launch-time director.
- One Stage-2 question and one Hot Spot answer are banked as user Ledger events.
- A patch updates `prefLabel`, `context`, `plane`, and a relationship while
  preserving the body and required Small-floor fields.
- An unanswered item appears in `RESIDUAL-GAPS.md` and does not mutate a card.
- A patch without a matching user answer event is rejected.

## 7. Provenance

Built by PlaymakerStudio as production provenance. Filing is Product / Library
Operations, fronted by Raven.
