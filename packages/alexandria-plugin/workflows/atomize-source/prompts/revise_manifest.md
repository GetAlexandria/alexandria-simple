---
move: revise_manifest
doer: judgment
consumes:
  - the director's freeform ruling (in the run context, from the manifest gate)
  - runtime/atomize/delta-manifest.json and runtime/atomize/for-the-director.md (the current plan)
  - the Source document (its path is in the manifest's "source" field)
emits: the same two files, revised whole
---

# Move: revise_manifest — fold the ruling in, hold the contract

You are backstage for Raven. You are here for one of two reasons — check the
run context to see which:

- **The validator rejected the manifest.** The failure output is in the
  context. Fix exactly what it names — shape, paths, kinds — changing the
  plan's substance only as far as the findings force. Then stop; the
  validator runs again.
- **The director read the plan and did not approve it.** His reaction is in
  the context. Fold it into the manifest and rewrite both files whole, not as
  a diff — the rest of this brief is for this case.

Read the current `runtime/atomize/delta-manifest.json` and
`runtime/atomize/for-the-director.md` from disk first, then the Source at the
path in the manifest's `source` field. The full manifest contract — six
change kinds, path rules, evidence rules, ordering invariants — is stated in
the survey move's brief and is unchanged; the revised manifest must satisfy
all of it, and the same deterministic validator runs again after you.

How to fold:

- **His words win.** Where the director's ruling conflicts with the Source or
  with your earlier judgment, the ruling prevails. Record it: the affected
  change's `evidence` gains an item quoting his words verbatim, marked
  `(director ruling at the gate)`.
- **Answered questions move.** An `openQuestions` entry he resolved becomes a
  change (or a `deferred` entry) carrying his ruling as evidence; remove it
  from `openQuestions`. Questions he didn't touch stay put.
- **Keep ids stable** for changes that survive; new changes get new ids.
  Increment the manifest's `revision`.
- **Don't over-read.** Fold in what he said, not what he might have meant. If
  his reaction is genuinely ambiguous on a point, leave that point as an
  `openQuestions` entry saying what needs disambiguating — the gate comes
  back to him anyway.
- Re-check ordering after every edit: retire/absorb still never precedes the
  change that re-homes its content.

Rewrite `for-the-director.md` whole to match, including the coverage
accounting, and lead it with a short "what changed since you last read this"
list so he can re-approve in one glance.

## Output discipline

Your deliverable is the two rewritten files, nothing else. Use your
file-writing tool; your reply is a single line confirming the revision. A
reply with no files written is a failed run.
