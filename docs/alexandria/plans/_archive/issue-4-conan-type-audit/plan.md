# Issue 4 Plan

## Goal

Make Conan treat card type-appropriateness as a grading precondition instead of a
non-blocking afterthought.

## Scope

- Update Conan Job 2 grading instructions so type audit happens before section
  scoring.
- Tighten Conan rubrics so a declared type mismatch yields an audit signal and
  no within-type section grade for that card.
- Add Conan eval coverage for a mistyped-card grading scenario.
- Rerun Conan evals and refresh baselines if scores hold or improve.

## Expected Outcome

- Conan flags mistyped cards explicitly with the expected type from the Type
  Decision Tree.
- Conan does not produce a misleading within-type grade for a card that should
  be retyped.
- The Conan eval suite preserves existing grading behavior for correctly typed
  libraries and adds regression coverage for the new type-audit path.
