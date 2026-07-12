# Review

Review the implementation as if preparing a pull request.

Check:

- The diff stays within the requested Alexandria scope.
- Package boundaries match the local `CLAUDE.md` guidance.
- CLI changes have black-box tests for behavior, exit codes, and important
  output fields.
- Plugin changes are represented in plugin assets and pass validation.
- Viewer changes have the relevant unit, build, and browser validation.
- No files under `docs/alexandria/library` were freehand-edited outside an
  approved library migration or generated card update.
- Validation output is understood and any failures are actionable.

Do not make implementation, prompt, config, or test edits in this stage. If a
change is required, route back to implementation with enough context for the
next implement stage to make the fix.

If the implementation is not ready, be concrete about the remaining blocking
work so the next implementation stage has actionable context.

End with exactly one routing JSON object:

```json
{"preferred_next_label":"Ready","context_updates":{"review_ready":true}}
```

or:

```json
{"preferred_next_label":"Fix","context_updates":{"review_ready":false}}
```
