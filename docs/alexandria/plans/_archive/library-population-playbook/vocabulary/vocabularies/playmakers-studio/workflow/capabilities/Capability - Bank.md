---
type: capability
prefLabel: Bank
altLabels: [bank.sh, package bank, studio → plugin copy]
category: workflow
subcategory: capability
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/BIG-EDIT.md L78-86
context: workflow
altitude: capability
---

## WHAT
_Stub —_ the operation that copies [[Aggregate - Workflow Package]] **studio → plugin**: `studio/tools/bank.sh <play-dir>`. Refuses dead placeholders, re-derives (so step 2 can't be skipped), previews diff, mirrors package, validates the banked copy.

## WHERE
`studio/tools/bank.sh`. Source: `studio/plays/<slug>/`. Target: `packages/alexandria-next-plugin/workflows/<slug>/`. Bank conformance gate holds studio ≡ plugin in CI.

## WHY
"Until you bank, the factory runs the stale plugin copy" — the silent footgun. Bank is the studio→runtime sync.

## WHEN
After re-audit, before re-running the campaign. Also `bank.sh --check` reports drift without copying.

## HOW
- Refuses dead `__AX2_` placeholders.
- Re-derives first (forces step 2).
- Previews diff for sanity.
- Validates banked copy with `fabro validate`.
- Hot Spot H2 — three things called "bank": this (file copy), Gate 2 confirm, runtime output to library.
