---
type: component
prefLabel: Known FPs Ledger
altLabels: [known-fps.md]
category: grading
subcategory: component
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L274-280; studio/plays/frame-the-problem/known-fps.md L1-30
context: grading
altitude: component
---

## WHAT
_Stub —_ a per-play ledger of patterns a fresh-eyes [[Agent - Checker]] or [[Agent - Grader]] reliably flags that are *dispositioned by design*. Read before reporting.

## WHERE
`studio/plays/<slug>/known-fps.md`. Consumed before any lint or grading report (TESTING.md, AUTHORING-EVALS.md).

## WHY
Without it, every new grader re-discovers the same already-known-okay patterns and the Director re-rules the same things. Gstack adoption — "Each play keeps a known-false-positives ledger."

## WHEN
Created when a pattern proves to be a repeat flag. Re-disposition on big edits (BIG-EDIT step 3: "a pattern dispositioned against the old play may no longer hold").

## HOW
- Entries name *exact* patterns with provenance.
- "The ledger never excuses a novel instance" — when in doubt, flag and cite.
- Standing carve-outs (always-defects, never-excused) are listed explicitly.
