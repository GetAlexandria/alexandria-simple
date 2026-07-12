# Inheritance — what the Studio carried in, and how far to trust it

Copied 2026-06-12 from `conductor-playground-fabro-experiment@62ddfad`
during the Studio migration (see `../STUDIO-MIGRATION.md`). Two classes,
deliberately separated:

## `autopsy/` — trusted as historical record

The evidence the playbook's rules cite (`plays/README.md`, "Rules inherited
from the autopsy"): `PROMPT-REVIEW-FINDINGS.md` and `doer-honesty-audit.md`.
These document the factory-era failures that earned each rule. They are
records of what happened — they don't prescribe anything and they don't
drift.

## `quarantine/` — sorted through before ANY use

**Director ruling, 2026-06-12, at migration:** the Studio is being ported in
order to extend it all the way to Fabro workflows — and the original spec
work that tried that had real problems. Anything carried in along those
lines is quarantined: it may be read as reference, but nothing in it is a
standard until it has been sorted through, independently re-verified
against the actual Fabro docs, and explicitly promoted out of quarantine
with a dated note.

`quarantine/conventions/` is the graph-era conventions set the plays-era
README inherits "at Fabro conversion." The known problems, on record:

- The factory standard these conventions came from cited **no Fabro
  sources at all** — it was a port of a legacy card system, presented as
  best practice (the deepest root of the autopsy's findings).
- The autopsy itself found 13 of 26 factory prompts leaking design
  rationale, and five mislabeled doers that let quality gates pass garbage
  — failures these conventions did not prevent.
- The playbook's standing caveat already says it: factory-inherited docs
  "describe intent, not proven behavior."

**Promotion path:** when the Fabro-conversion work actually begins, each
convention gets the step-0 treatment — grounded against the Fabro docs in
the vendored `repos/fabro`, claims verified quote-or-demote, then ruled on
by the Director. Until then, nothing in `quarantine/` is load-bearing.

**Promotion note, 2026-06-12 (Director ruling, Slice 1 of the
Studio → Fabro plan):** the step-0 treatment ran for
`quarantine/conventions/` against the refreshed vendored Fabro docs.
What survived is promoted into **`../plays/PROJECTION.md`** (the
projection conventions, now load-bearing for the Derive step); the
per-file dispositions — promoted, rejected-superseded, or
stays-quarantined — are recorded in that document's §10. The quarantine
files themselves stay here untouched, as the verbatim historical copies
they are. Notably rejected: the decision-file/`route.sh` ACP routing
scheme (superseded by Fabro's documented routing extraction).
