# Issue 225: AX2 Raven Dash-Prefixed Slot Values

## Header

- Issue reference: [GitHub #225](https://github.com/GetAlexandria/alexandria-internal/issues/225)
- Goal: Make `ax2 raven vision slot update` accept dash-prefixed inline
  `--text` and `--notes` values without weakening stable missing-value
  diagnostics.
- Linked product plan: None found. The issue body is the source of truth for
  this slice; issue comments only contain Fabro run submissions.
- Related prior plan: `docs/alexandria/plans/raven-onboarding-experience/plan.md`
  introduced the one-slot Raven Vision update command and the plugin guidance
  that tells Raven to pass notes inline.

## Scope

This slice is limited to AX2 Raven CLI argument parsing and black-box CLI
coverage in `packages/ax-next`.

The intended parser behavior is:

1. `--notes '- Sources: founder brain-dump'` is accepted as the literal notes
   value.
2. `--text '- ok'` is accepted as the literal slot text value.
3. `--notes` or `--text` at the end of argv still exits `2` with
   `Missing value for <option>.`
4. If a free-form option is followed by a known option for
   `ax2 raven vision slot update`, such as `--notes --json` or
   `--text --notes`, keep treating that as a missing value and cover it in
   tests. This preserves the common recovery path for omitted values. Literal
   values that exactly match known option names can still be supplied through
   `--text-file` or `--notes-file`.
5. Unknown dash-prefixed tokens after `--text` or `--notes` are accepted as
   literal free-form values because the command cannot distinguish prose from
   unknown option-looking text once the user has selected a free-form field.

## Non-Goals

1. Do not change Alexandria 1 packages or the current public `ax` CLI.
2. Do not migrate AX2 to a new argument parsing library.
3. Do not change Raven Vision runtime mutation, reducer, ledger, projection, or
   Viewer behavior.
4. Do not edit `packages/alexandria-next-plugin` unless implementation uncovers
   a mismatch in command guidance. The current `ax-next-start` example already
   uses inline `--notes`.
5. Do not write to `docs/alexandria/library/`.
6. Do not add a broad shared parser abstraction unless the Raven-local fix
   would duplicate established local code.

## Current Gap

`packages/ax-next/src/commands/raven.ts` has a Raven-local `readOptionValue`
helper:

```ts
if (value == null || value.startsWith("-")) {
  return invalidInput(`Missing value for ${option}.`, help);
}
```

That helper is appropriate for constrained option values such as slot ids, but
too strict for free-form slot text and notes. Quoted shell strings are already
arriving as one argv token, yet any token starting with `-` is rejected before
runtime validation can run.

The command shape documented for Raven encourages inline notes:

```bash
ax2 raven vision slot update --slot <slot-id> --text "<draft text>" --notes "<markdown notes>" --json
```

Markdown bullets naturally begin with `-`, so the current parser makes a valid
Raven drafting path fail with exit code `2` and the misleading diagnostic
`Missing value for --notes.`

## Architectural Boundaries

The CLI owns deterministic parsing, validation, stdout/stderr separation, and
stable exit codes. The plugin owns the guided play contract. This issue should
make the deterministic CLI honor the command contract already documented by the
plugin without moving play behavior into the CLI.

The parser change belongs inside the Raven command parser or a tiny nearby
helper in `packages/ax-next/src/commands/raven.ts`. Keep the behavior
command-local so other AX2 commands do not silently change their option-value
semantics.

No Effect runtime changes are expected. If implementation touches command
execution instead of pure parsing, keep the existing `Effect` program and
`CliResult` patterns from `packages/ax-next`.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 Raven CLI parser | `packages/ax-next/src/commands/raven.ts` | `--text` and `--notes` accept dash-prefixed free-form values while known option adjacency remains an invalid missing-value case |
| AX2 CLI black-box tests | `packages/ax-next/tests/cli.test.ts` | Adds exit-code and stderr coverage for missing free-form values and ambiguous known-option adjacency |
| AX2 Raven runtime CLI test | `packages/ax-next/tests/runtime-server.test.ts` | Adds black-box success coverage proving dash-prefixed text and notes survive through the real CLI/runtime path and JSON output fields |
| AX2 README/help examples | `packages/ax-next/README.md`, Raven help text only if needed | No required copy change; update only if tests reveal the documented command shape is incomplete |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| AX2 CLI behavior | Raven can pass Markdown bullet notes and dash-prefixed draft text inline without parser rejection | Add black-box tests for success, exit code, stdout/stderr, and output fields |
| `ax-next-start` skill | No wording change planned. Existing guidance already tells Raven to use inline `--text` and `--notes`; this slice makes that guidance work for bullet notes | No plugin validation required unless implementation edits plugin files |
| Alexandria Next eval-backed behavior | No agent, skill, or autonomous drafting behavior changes | No eval harness rerun required for this deterministic CLI parsing fix |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 CLI parser tests | `cd packages/ax-next && bun test tests/cli.test.ts` | Proves missing values still exit `2`, known option adjacency is intentional, and diagnostics stay on stderr |
| AX2 Raven black-box runtime path | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Proves dash-prefixed `--text` and `--notes` are accepted by the real CLI invocation and appear unchanged in JSON output |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches TypeScript drift in the parser helper or test additions |
| AX2 lint, if parser/test code changes trigger lint-sensitive patterns | `cd packages/ax-next && pnpm run lint` | Confirms command/test style remains valid |

Targeted black-box cases to add:

1. Runtime success:
   `raven vision slot update --slot shift --text ok --notes '- Sources: founder brain-dump' --json`
   exits `0`, writes no stderr, and returns `slot.ravenNotes` with the exact
   dash-prefixed notes.
2. Runtime success:
   `raven vision slot update --slot shift --text '- ok' --notes Notes --json`
   exits `0`, writes no stderr, and returns `slot.text` with the exact
   dash-prefixed text.
3. Parser error:
   `raven vision slot update --slot shift --text ok --notes` exits `2`,
   writes no stdout, and stderr contains `Missing value for --notes.`
4. Parser error:
   `raven vision slot update --slot shift --text --notes Notes` exits `2`,
   writes no stdout, and stderr contains `Missing value for --text.`
5. Parser error documenting the tradeoff:
   `raven vision slot update --slot shift --text ok --notes --json` exits `2`,
   writes no stdout, and stderr contains `Missing value for --notes.`

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 Raven CLI parsing | Deterministic Bun tests already cover Raven help and validation | Add black-box CLI and runtime tests in `packages/ax-next` | `cd packages/ax-next && bun test tests/cli.test.ts tests/runtime-server.test.ts` |
| Alexandria Next plugin skills | `ax-next-start` uses the affected command but does not need wording changes for this slice | No plugin validation or eval rerun unless implementation edits plugin files | If plugin files change, run `claude plugin validate ./packages/alexandria-next-plugin` and revise this section |
| Alexandria 1 plugin/evals | Separate product line and untouched | No action | None |

No eval-harness coverage is required for this slice as planned. The behavior is
deterministic CLI parsing and runtime command execution, not a change to a
reusable agent, skill, or model-mediated drafting policy.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Broadening `readOptionValue` accidentally lets constrained options consume flags, for example `--slot --json` | Keep the relaxed behavior opt-in for free-form `--text` and `--notes`; leave constrained fields strict |
| Known-option handling drifts when Raven slot update options change | Define the known option set near the parser and add tests for `--notes --json` and `--text --notes` so future option additions have a visible contract |
| Tests prove parsing only but not the real Raven command path | Add runtime-backed black-box tests using `bun packages/ax-next/src/cli/main.ts` through the existing `runCli` helper |
| A user wants literal inline text exactly equal to `--json` | Document the tradeoff in the test name/assertion and keep `--text-file` or `--notes-file` as the supported path for exact known-option literals |
| Parser helper changes in one command create inconsistent CLI behavior elsewhere | Keep this change Raven-local and defer shared parser cleanup until another command has the same free-form-value requirement |

## Implementation Steps

1. In `packages/ax-next/src/commands/raven.ts`, introduce a Raven-local option
   value reader mode or separate helper for free-form slot update values.
2. Keep the existing strict missing-value behavior for `--slot`,
   `--text-file`, `--notes-file`, and `--idempotency-key`.
3. For `--text` and `--notes`, reject only absent values and values that match
   a known `ax2 raven vision slot update` option token; accept other
   dash-prefixed values literally.
4. Add focused `tests/cli.test.ts` cases for missing `--notes`, missing
   `--text`, and known-option adjacency such as `--notes --json`.
5. Extend the existing runtime-backed Raven slot update CLI coverage in
   `tests/runtime-server.test.ts` or add a nearby test that starts Vision and
   runs the real CLI command with dash-prefixed notes and text.
6. Assert exit codes, stdout/stderr separation, and exact JSON output fields
   (`command`, `slot.text`, and `slot.ravenNotes`) for the new black-box cases.
7. Run the targeted AX2 test commands and typecheck.
8. If implementation edits plugin files despite the planned scope, run
   `claude plugin validate ./packages/alexandria-next-plugin` and update the
   eval impact section before approval moves to implementation.

## Acceptance / Exit Criteria

1. `ax2 raven vision slot update --slot shift --text ok --notes '- Sources: founder brain-dump' --json`
   accepts the notes value and does not report it missing.
2. `ax2 raven vision slot update --slot shift --text '- ok' --notes Notes --json`
   accepts the text value and does not report it missing.
3. Successful runtime-backed tests prove the dash-prefixed values appear
   unchanged in JSON output.
4. `--notes` at the end of argv still exits `2` with a stable
   `Missing value for --notes.` diagnostic on stderr and empty stdout.
5. `--text` followed immediately by known option `--notes` exits `2` with a
   stable `Missing value for --text.` diagnostic.
6. `--notes` followed immediately by known option `--json` exits `2` with a
   stable `Missing value for --notes.` diagnostic, documenting the chosen
   ambiguous-case tradeoff.
7. Existing Raven slot update validation still catches invalid slot ids,
   conflicting text/text-file arguments, conflicting notes/notes-file
   arguments, and unknown options.
8. No Alexandria 1 files, `docs/alexandria/library/` files, runtime reducer
   behavior, or Viewer behavior changes in this slice.

## Deferred Follow-Ups

1. Consider a shared AX2 argument parsing helper only if other commands need
   free-form dash-prefixed option values.
2. Consider supporting an explicit `--` value terminator if future CLI users
   need inline literal values that exactly match known option names such as
   `--json`.
3. Consider adding README examples with bullet notes if support questions show
   agents still avoid inline Markdown bullets after this fix.
