# Verify

Verify that the implemented feature works. This is an execution stage, but it
is not an implementation stage.

Before running checks:

- Read the GitHub issue goal from the workflow context.
- Read the checked-in technical plan under
  `docs/alexandria/plans/<stable-feature-slug>/plan.md`.
- Inspect the implementation diff and changed files.
- Read `CLAUDE.md` plus package-local `CLAUDE.md`, README, and guidance files
  for every package or surface changed by the implementation.

Do not assume the technical plan's verification section is sufficient. First
write an independent verification plan to:

```text
verification-artifacts/verification-plan.md
```

That plan must include:

- A short assessment of the technical plan's verification instructions.
- Any gaps or weak assumptions in those instructions.
- The checks from the technical plan that you will execute.
- Additional checks needed to prove the feature works.
- The artifacts you expect to capture as evidence.

Then execute the verification plan. Prefer black-box, user-level verification
over implementation inspection alone. When applicable:

- Create a throwaway sample project under `/tmp/fabro-verify-*` when the
  feature can be exercised outside this repository. If the sandbox does not
  permit that, use another scratch location and document the fallback.
- Install or invoke `ax` the way a user would when CLI behavior is part of the
  feature.
- Run the implemented feature through its CLI, server, viewer, or plugin
  surfaces.
- Capture CLI output transcripts.
- Capture JSON output snapshots.
- Use browser verification for web or viewer behavior.
- Capture screenshots, and capture video when practical.

Repository write boundary:

- Do not edit implementation source, checked-in tests, prompts, workflow
  configuration, package metadata, plans, or other tracked repository files
  outside `verification-artifacts/`.
- Create verification-only helper scripts, notes, transcripts, screenshots,
  videos, and JSON snapshots under `verification-artifacts/`.
- If verification uncovers a product defect, missing implementation change, or
  checked-in test/harness issue, do not patch it in this stage. Document the
  required change in `verification-artifacts/report.md` and in your final
  response so the Verification Judge can route back to implementation.
- Before finishing, inspect tracked changes outside `verification-artifacts/`
  and report any such changes explicitly as a verification-stage boundary
  violation.

Store evidence under `verification-artifacts/`:

```text
verification-artifacts/
  verification-plan.md
  report.md
  cli/
  json/
  screenshots/
  videos/
```

If browser verification is relevant, use Playwright or another available
browser tool. Save screenshots under `verification-artifacts/screenshots/`.
Save videos under `verification-artifacts/videos/` only when practical.

Write the final verification report to:

```text
verification-artifacts/report.md
```

The report must include:

- What feature behavior was verified.
- What technical-plan verification steps were executed.
- What additional verification steps were executed.
- Commands run and where their full output was saved.
- Artifact paths for screenshots, videos, JSON snapshots, and CLI transcripts.
- Any failures, gaps, skipped checks, or residual risk.

Do not claim the feature is ready unless the evidence supports that claim. Do
not route the workflow with `verification_ready`; the Verification Judge owns
that decision.

Your final response must summarize the executed verification and list the
artifact paths you created.
