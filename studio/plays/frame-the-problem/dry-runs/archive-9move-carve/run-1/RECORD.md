# Run 1 — golden path, ABORTED in a ground⇄frame loop (the line-wrap crack)

Tested: golden-path fixture (`meeting-snippet-01.md`, full saddle) on
the local Docker/ACP factory. Run `01KTYJYFFPGZEKVQ530RVP08KX`,
2026-06-12. Stopped by hand at frame@4/relate@4 (Director spotted the
loop watching the run live; `fabro rm -f` after `fabro dump` — this
directory is the full durable export, preserved verbatim).

## What it proved before failing (wiring, all PASS)

- **Templates render in `@`-loaded prompts** (lint watch C-n2, closed):
  `stages/002-locate@1/prompt.md` carries the real fixture path, not
  `{{ inputs.transcript }}`.
- **ACP routing JSON drives edges**: locate→Proceed, then three
  consecutive ground→"Fix entries" bounces — every transition followed
  the response-text JSON (Slice 1 Decision 2 mechanism works).
- **The workspace file relay holds**: every move read its upstream
  emits and wrote its own; the bounce-note ledger was created,
  advanced (strike 1 → 2 → 3), and rewritten-whole per the lint C-n1
  discipline — the strike counting itself worked.
- The sandbox cloned the branch, `runtime/` materialized, stage
  records persisted. End-to-end plumbing: sound.

## The crack (content, not wiring)

`ground` treats the transcript's **hard line-wrapping as quote drift**.
The fixture wraps `...Half my best source` / `material dies in tabs.`
across two lines; the brief quotes it as one line; ground's
"character-exact" rule reads newline-vs-space as a failure
(`stages/006-ground@1/response.md`). frame cannot fix it — the quote is
verbatim in wording and capitalization — so the defect ping-pongs;
ground@3 found two more quotes failing the same way
(`stages/012-ground@3/response.md`). Trajectory: every multi-line quote
three-strikes into a FALSE `failing:` mark — a released brief wearing
failure marks it didn't earn. §7 would fail regardless; aborted rather
than burn the factory proving it.

**Why the monolith never hit this:** one agent lifted the quotes and
checked them in a single context — it never disagreed with itself about
line breaks. Splitting the doers exposed the latent ambiguity in
"character-exact" / "ctrl-F-able" against hard-wrapped source files.
A graph-era finding in the truest sense.

## Fix (applied same day)

Verbatim semantics clarified — wording and capitalization exact,
whitespace compared with runs of spaces/newlines collapsed (a line
wrap is not drift). Mechanics-forced detail call under the 2026-06-12
detail-calls ruling: amended in brief §4 ground + `prompts/ground.md`,
surfaced for Gate 2. Re-derived and re-run as run 2.

Also observed, non-blocking, for the read-out: ground@3 hit a
read-only-sandbox `apply_patch` refusal and recovered via an escalated
write — watch whether sandbox write friction recurs.
