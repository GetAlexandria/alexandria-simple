# Micro-push: stop rejecting apostrophes in workflow input substitution

## Symptom

Running Frame the Problem with a transcript that contains an apostrophe
(`it's`, `customer's`, `don't`) fails the run with:

```
Workflow value for __AX_INPUT_TRANSCRIPT__ must not contain single quotes: …
```

Free-text inputs routinely contain apostrophes, so this blocks normal use of
the play — and will hit every play that takes prose input, not just this one.

## Root cause

`substituteWorkflowPlaceholders` in `packages/ax/src/domain/orchestration.ts`
(rejection at lines ~1059–1066) treats **every** `raw` substitution value as if
it lands inside a single-quoted shell string, and hard-rejects any value
containing `'`:

```ts
// Raw values land inside single-quoted shell strings in command
// scripts, where a quote silently breaks the script.
if (raw && value.includes("'")) {
  return new WorkflowInputError(...);
}
```

That assumption is false for prompt files. The function is called from two
places:

- `orchestration.ts:1113` — renders `workflow.fabro` (genuinely shell-bearing).
- `orchestration.ts:1145` — renders aux/prompt files (`prompts/*.md`), which are
  **prose passed to the agent**, not shell.

In Frame the Problem, `__AX_INPUT_TRANSCRIPT__` appears **only** in
`prompts/pre_fill.md` and `prompts/revise.md`, inside ordinary prose
double-quotes — it never touches a shell. The guard rejects a value over a shell
hazard that does not exist in that context. The substitution layer is
context-blind, which is why the bug is systemic: any play threading free text
into a prompt inherits it.

## Fix

Make substitution context-aware. Thread a `context: "workflow" | "prompt"` (or
similar) parameter into `substituteWorkflowPlaceholders`:

- **prompt context** (the aux-file call site, ~1145): inject input values
  **verbatim** — no shell guard, no escaping. Prompt files are text.
- **workflow context** (the `workflow.fabro` call site, ~1113): replace the hard
  rejection with proper single-quoted-shell escaping (`'` → `'\''`), reusing the
  transform already in `shellQuote` (`orchestration.ts:577`). Values still land
  inside the author's `'…'` quotes, so escape the inner quote rather than
  wrapping. Paths (`__AX_PROJECT_ROOT__`, `__AX_WORKSPACE__`) realistically never
  carry quotes, so this is a no-op for them but removes the latent footgun.

Net: prose inputs flow through untouched; shell-context values are made safe
instead of refused. No play authoring changes required.

## Scope

- One function in `packages/ax/src/domain/orchestration.ts` + its two call sites.
- No change to play payloads, the `--input` CLI parser (`commands/play.ts:148`
  is already apostrophe-agnostic — it splits on the first `=`), or placeholder
  grammar.

## Tests

- Unit: `substituteWorkflowPlaceholders` with a prompt-context value containing
  `'` → returned verbatim (no error, no `'\''`).
- Unit: workflow-context value containing `'` → escaped to `'\''`, not rejected.
- Regression: render Frame the Problem's `prompts/pre_fill.md` with a transcript
  containing apostrophes and assert the rendered prompt contains the literal
  text unchanged.

## Known limitation

`templateKind` is file-granular, not occurrence-granular. A `workflow.fabro` can
also embed inline `prompt="…"` prose (Fabro's DOT format), which this fix treats
as shell — so apostrophes in a free-text input threaded into inline prose would
be escaped to `'\''` and reach the agent as garbage. No current play triggers
this: the only inputs embedded inline in `prompt=` attributes are file paths
(e.g. `__AX_INPUT_CONTRACT_PATH__`), and free-text plays (Frame the Problem)
route their prose through `@prompts/*.md` aux files, which correctly get the
`"prompt"` kind. Authors should keep free-text inputs in aux prompt files, not
inline `prompt=` prose.

## Out of scope

- The user-side shell-quoting of `--input transcript="it's"` is the caller's own
  shell, not our code; correct quoting already passes through.
- The other Frame-the-Problem agent-driven gaps (interactive deadlock, no
  resume, empty tracker active-runs) — tracked separately under the coin
  re-architecture (#304).
