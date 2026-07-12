---
move: check_bundle
doer: judgment
consumes:
  - output_path: "__AX_INPUT_OUTPUT_PATH__" (required — the bundle root, re-read fresh and blind)
emits: runtime/check-verdict.md — the verdict (PASS / REPAIR <fix list> / FREEZE <reason>), routing JSON last
---

# Move: check_bundle — read the bundle cold, as a stranger

You have never seen this bundle before. Open it fresh at
`__AX_INPUT_OUTPUT_PATH__` and walk it the way a stranger would who has to find
their way around it. Judge only what is on disk.

**Before you can PASS, run both deterministic gates.** From `__AX_PROJECT_ROOT__`:

```
bun studio/tools/check-keystone.ts __AX_INPUT_OUTPUT_PATH__
node studio/tools/check-machine-language.mjs __AX_INPUT_OUTPUT_PATH__
```

The keystone gate: a nonzero result means the `_index` keystone story does not
name every card-bearing container and only those. The machine-language gate: a
nonzero result means a card **body** still reads in machine-speak — a file path,
code identifier, route name, or raw event index in `## WHAT`/`## WHERE`/`## HOW`
(it scans bodies only, so `source_evidence` and `rulings:` may carry code). Copy
the named violations from either gate into your verdict, then route `REPAIR` for
an ordinary story/container mismatch or a machine-token body, or `FREEZE` when the
bundle is structurally incoherent.

Then check, in this order — each is verifiable by reading:

1. every typed-link target resolves to a card that exists;
2. every card carries `type`, `prefLabel`, `context`, `plane`, `status` (and
   `confidence`, `proposed_by`);
3. every event in `runtime/EVENTS.md` names a noun that has a card or is honestly
   marked "not yet carded";
4. every Hot Spot points at a real card or section;
5. every Stage-2 question references a real artifact;
6. every `out_of_scope_suspect` thread names a pile that has **no** card file and
   **no** same-named container directory in the bundle, and each substantive
   suspect pile has exactly one such thread;
7. every Hot Spot or gap has a matching `library.thread_opened` Ledger payload
   with notepad provenance — a `question` distinct from `reason`, an
   `emittingMove`, and `sourceEvidence`;
8. altitudes are internally consistent within a context (no "component" labeled
   "pillar");
9. `workflows.json` is present and non-empty, every step names a carved `context`
   with resolvable `cardRefs`, and the thread covers the events — an event that
   advances the unit but maps to no step, or a context no step visits, is a gap;
10. if `library-search-prior.json` exists, every prior lead is marked confirmed,
    corrected, rejected, or threaded, every high-confidence fence prune traces to
    What It's Not, and every unresolved low-confidence inference has an open
    thread;
11. no card body reads in machine-speak — the machine-language gate above passes,
    and a spot read confirms the bodies read as plain product English, not merely
    token-free.

Then judge the whole as a stranger: does it read coherently, could someone
navigate it?

## The decision

- **PASS** — the bundle is internally coherent and a stranger could navigate it.
- **REPAIR** — small, nameable fixes (a broken typed link, a missing cross-ref,
  an unreferenced Stage-2 question, a keystone mismatch). List each fix
  precisely; the run bounces back to rewrite them.
- **FREEZE** — the bundle is structurally unsalvageable (no events were
  recoverable, the carve produced no contexts, there are no cards). Name why.

## Hard limits

- **Judge only what is on disk.** Do not fill a gap yourself, do not resolve a
  Hot Spot, do not rewrite a card. Your job is the verdict, not the fix.
- **A repair list is specific.** "Fix the links" is not a fix; name the card, the
  link, and what it should resolve to.

## Output format and routing

Write `runtime/check-verdict.md`:

```
# Check Verdict

Keystone gate: [pass | fail — with the named violations]

## Findings
- [numbered checks that failed, each with the exact card/section/thread]

## Verdict: PASS | REPAIR | FREEZE
[for REPAIR: the precise fix list. for FREEZE: the reason.]
```

End your response with the routing JSON as the very last thing, nothing after it:

`{ "preferred_next_label": "PASS" }` — or `"REPAIR"`, or `"FREEZE"`.

**Output discipline.** Write `runtime/check-verdict.md` with your file tool; your
reply ends with the routing JSON. A verdict you describe but do not write is a
failed run.
