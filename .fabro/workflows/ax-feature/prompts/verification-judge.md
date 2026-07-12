# Verification Judge

Judge whether the verification stage proved that the requested feature works.
This is a rubric stage. Do not perform implementation work unless you need a
tiny inspection command to understand evidence that already exists.

Read:

- The GitHub issue goal from the workflow context.
- The checked-in technical plan under
  `docs/alexandria/plans/<stable-feature-slug>/plan.md`.
- The implementation diff and changed files.
- The verify node's final response and touched files from workflow context when
  available.
- `verification-artifacts/verification-plan.md`.
- `verification-artifacts/report.md`.
- Any CLI transcripts, JSON snapshots, screenshots, videos, Playwright reports,
  or other artifacts under `verification-artifacts/`.

Assess both verification plans:

- Was the technical plan's verification section sufficient for the feature?
- Did the verifier identify gaps or weak assumptions in that section?
- Was the verifier's independent verification plan sufficient?
- Did the verifier execute the technical plan's relevant verification steps?
- Did the verifier execute its additional verification steps?

Assess the evidence:

- Do CLI transcripts support the claimed behavior?
- Do JSON snapshots show the expected machine-readable contract?
- Do screenshots or videos support user-facing or browser behavior?
- Did the verifier use a realistic sample project when the feature can be
  tested outside the repository?
- Did the verifier install or invoke `ax` the way a user would when applicable?
- Are skipped checks justified and low risk?
- Are failures product defects, harness limitations, or acceptable residual
  risks?

Assess stage boundaries:

- Verification may create artifacts under `verification-artifacts/` and
  generated test evidence paths, but it must not change checked-in source,
  tests, prompts, workflow configuration, package metadata, plans, or other
  tracked repository files outside `verification-artifacts/`.
- Treat any verification-stage tracked file change outside
  `verification-artifacts/` as implementation work that happened after
  validation and review.
- Route to `Fix implementation` for that boundary violation even when the
  change is tiny, test-only, or described as harness hardening. The fix must
  happen in implementation so validation and review rerun on the final diff.

Reject weak verification. Do not approve only because tests passed.

Route based on the smallest next step:

- Route to `Re-verify` when the implementation appears plausible but the
  verifier skipped important checks, failed to create an independent
  verification plan, omitted required artifacts, or made claims that the
  evidence does not support.
- Route to `Fix implementation` only when the evidence points to a product
  defect, an implementation gap, or a verification-stage tracked-file boundary
  violation.
- Route to `Verified` only when the evidence is sufficient.

When verification is satisfactory, explain why the evidence is enough. When it
is not satisfactory, explain the smallest implementation or verification work
needed next.

End with exactly one routing JSON object:

```json
{"preferred_next_label":"Verified","context_updates":{"verification_ready":true,"verification_route":"handoff"}}
```

or:

```json
{"preferred_next_label":"Re-verify","context_updates":{"verification_ready":false,"verification_route":"verify"}}
```

or:

```json
{"preferred_next_label":"Fix implementation","context_updates":{"verification_ready":false,"verification_route":"implement"}}
```
