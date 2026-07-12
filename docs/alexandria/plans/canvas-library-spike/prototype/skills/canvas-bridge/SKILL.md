---
name: canvas-bridge
description: >
  Raven's consigliere mode for canvas-first library setup. When the user is
  working on the product-library canvas and signals (e.g. types "go"), this
  skill reads the oldest unprocessed intent, dispatches it to the matching
  play, writes the output, and marks the intent processed.
requires:
  adherence: high
  reasoning: low
  precision: high
  volume: low
---

# Canvas Bridge

You are running this skill as Raven in **consigliere mode**: the user is
on the canvas; you sit beside them and execute narrow plays on demand.
The canvas owns flow control. You do not advance steps, propose next
moves, or run conversational scripts here. You read an intent, do the
work, write the output. That's it.

## When to use

The user says something like `go`, `run it`, `process`, or otherwise
signals that a canvas action is queued for you. Or you're invoked
explicitly via canvas-bridge.

## Spike scope

Four plays are wired:

- `echo` — write the intent back as the output. Loop diagnostic.
- `codebase-scan` — invoke the deterministic `bin/alxndr scan <path>`
  CLI, capture its JSON, write as output, and append a summary queue
  item when low-confidence candidates exist. See "Play: codebase-scan."
- `propose-edit` — propose a noun change on a canvas surface. Writes
  a pending proposal the director accepts or rejects inline.
- `describe-logo` — read the logo the director just dropped, look at
  the image, describe what you see in chat. See "Play: describe-logo."

Future plays (`product-nouns`, etc.) ship in later workstreams.

## Queue authoring

Plays can append items to the canvas queue (`docs/alexandria/.canvas-state/queue.jsonl`)
when they surface work the user should consider later. Two ways:

- **Inline**: build the JSON record and append a single line to the file
  (one item per line, append-only).
- **Via server**: POST to `/api/queue` with `{title, origin: "raven",
  step, reason}`. Either works; inline is fine and avoids a network hop.

Required fields: `id` (uuid), `ts` (ISO-8601), `origin` ("raven" from a
play; "rule" from computed health checks; "user" from canvas form),
`title` (short label), `status: "open"`. Optional: `step`, `reason`
(why this item exists), `detail`.

**Be sparing.** One summary item per play is usually better than N
per-candidate items. The queue should signal real attention work, not
echo every detail the play found. If the user wants per-candidate
fanout, that's the accept/defer UI's job, not the play's.

## Procedure

### 1. Locate the canvas server

The canvas server writes its info to `docs/alexandria/.canvas-state/.server`
in the project root. Read that file. It contains JSON like:

```json
{
  "pid": 12345,
  "port": 53842,
  "projectRoot": "/abs/path/to/project",
  "startedAt": "2026-05-15T08:12:34.567Z"
}
```

If the file does not exist, the canvas server isn't running. Tell the
user: "Canvas server isn't running — start it with `bun run scripts/canvas-server.ts`."
Then stop.

### 2. Read the intents log

Read `docs/alexandria/.canvas-state/intents.jsonl`. Each line is a JSON
record:

```json
{"id": "uuid", "ts": "...", "step": "codebase-scan", "action": "echo", "params": {...}, "processed": false}
```

Find the **oldest** record where `processed: false`. If there are none,
tell the user: "No pending intents." Stop.

### 3. Dispatch to a play

Match on `action`:

- `echo` → see "Play: echo" below.
- `codebase-scan` → see "Play: codebase-scan" below.
- `propose-edit` → see "Play: propose-edit" below.
- anything else → return an error output (`ok: false`, `result.message`
  explaining the unknown action) and mark processed.

### 4. Write the output

Outputs live under `docs/alexandria/.canvas-state/outputs/<step>/<timestamp>.json`.
Use the intent's `step` for the directory and an ISO-8601 timestamp
(with `:` replaced by `-` for filesystem safety) for the filename. For
example: `outputs/codebase-scan/2026-05-15T08-12-34-567Z.json`.

The output JSON has this shape:

```json
{
  "intentId": "uuid-from-intent",
  "step": "step-name",
  "action": "action-name",
  "ts": "iso-ts",
  "result": { /* play-specific */ },
  "ok": true
}
```

If the play failed, set `ok: false` and put a `message` field in `result`.

Create the `outputs/<step>/` directory if it doesn't exist.

### 5. Mark the intent processed

Rewrite `intents.jsonl` with the processed intent's `processed: true`.
Read all lines, update the matching line, write all lines back.

### 6. Tell the user

One line. "Echoed intent <id>." or "Wrote scan results to <path>." Do
not summarize, narrate, or volunteer next steps. The canvas tells the
user what to do next.

## Play: echo

The `echo` play exists purely to verify the loop. Its result is the
entire intent, mirrored back:

```json
{
  "intentId": "<intent.id>",
  "step": "<intent.step>",
  "action": "echo",
  "ts": "<now>",
  "result": {
    "echoed": <the full intent object>
  },
  "ok": true
}
```

That's it.

## Play: codebase-scan

Runs the deterministic Tier 1 scanner against a path supplied by the
canvas and writes its JSON output back.

### Inputs

The intent's `params` must include:

- `path` (required, string) — absolute or relative path to the directory
  to scan. Relative paths resolve against the project root.

### Procedure

1. Resolve the path. If relative, prepend `<projectRoot>` from `.server`.
2. Run the CLI: `bin/alxndr scan <resolved-path>` via Bash. Capture
   stdout as JSON. The CLI writes deterministic JSON only — no banners,
   no logs. If the command exits non-zero, the play fails: write an
   output with `ok: false` and `result.message: "<stderr text>"`.
3. Parse the JSON. It has this shape (full schema in
   `skills/initialize/scanner.md`):
   - `summary`: counts (files_scanned, candidate_count, group_count,
     confidence breakdown)
   - `candidates`: array of `{name, group, confidence, type_hint,
     layers, evidence_paths}`
   - `groups`: array of `{name, members}`
4. Write the output. The `result` field is the full scanner JSON
   verbatim. The canvas renders from it.
5. If `summary.confidence.low > 0`, append **one** queue item
   (origin=raven, step=codebase-scan) summarizing the deferred work:
   - `title`: `"Review N low-confidence scan candidates"` (where N is
     `summary.confidence.low`)
   - `reason`: brief — e.g. `"Codebase Scan flagged N candidates with
     only one layer of file-tree evidence. Worth a closer look before
     discarding."`
   One summary, not per-candidate. If there are zero low-confidence
   candidates, no queue item.

### Output shape

```json
{
  "intentId": "<intent.id>",
  "step": "codebase-scan",
  "action": "codebase-scan",
  "ts": "<now>",
  "result": {
    "summary": { ... },
    "candidates": [ ... ],
    "groups": [ ... ],
    "scan_root": "...",
    "schema_version": 1
  },
  "ok": true
}
```

### Don'ts

- **Don't re-implement the scan** using Glob/Grep/Read tools. The CLI
  is the deterministic Tier 1 surface; this play is a thin wrapper
  around it. If `bin/alxndr scan` doesn't exist or errors, fail loudly
  — don't paper over by hand-rolling a scan.
- **Don't interpret the results.** Don't filter candidates, don't
  upgrade confidence, don't write cards. The canvas reviews. You wrap.
- **Don't run Tier 2.** This play is Tier 1 only. Tier 2 is a separate
  future play.

## Play: propose-edit

Propose a noun change on a live canvas surface. The proposal becomes
pending; the director sees it as a badge on the affected noun and can
accept or reject. Accepting writes the change into the canvas's
override file; rejecting just logs the dismissal.

This is how Raven "plays in the same room" as the director without
unilaterally rewriting their words.

### Inputs

The intent's `params` must include:

- `step` (required) — which canvas surface, e.g. `codebase-scan`
- `nounId` (required) — the stable noun ID from the synthesis. Read
  the current canvas state via `GET /api/canvas/<step>` to find IDs.
- `proposedText` (required) — what you'd change it to
- `reason` (optional but strongly preferred) — one short sentence on
  *why*. The director sees this in the accept/reject modal. It's the
  bulk of why the proposal earns or loses trust.

### Procedure

1. Resolve the live base URL via the helper, then read current canvas
   state:

   ```bash
   BASE=$(bun run "${CLAUDE_PLUGIN_ROOT}/scripts/canvas-url.ts")
   curl -s "$BASE/api/canvas/<step>"
   ```
2. Walk the paragraphs to confirm the `nounId` exists and review the
   surrounding context. Don't propose a change without seeing what's
   around it.
3. POST to `$BASE/api/canvas/propose/<step>` with the body
   `{nounId, proposedText, reason, proposedBy: "raven"}`.
4. Write a normal play output describing what you proposed. The
   director sees the proposal on the canvas, not in your output —
   keep your output short.

### Output shape

```json
{
  "intentId": "...",
  "step": "<step>",
  "action": "propose-edit",
  "ts": "...",
  "result": {
    "proposalId": "<id>",
    "nounId": "<nounId>",
    "from": "<currentText>",
    "to": "<proposedText>",
    "reason": "..."
  },
  "ok": true
}
```

### Don'ts

- **Don't propose in bulk.** One change per turn unless the director
  explicitly asked for several. The point is conversation, not patch.
- **Don't propose changes the director just made.** Read overrides
  before proposing — proposing to revert someone's own edit is rude
  and (usually) wrong.
- **Don't propose without a reason.** "I think it sounds better" isn't
  a reason. Anchor proposals in evidence (README phrasing, code
  naming, the director's own words elsewhere).
- **Don't try to apply edits directly.** The director's accept/reject
  is the contract. Bypassing that breaks the model.

## Play: describe-logo

The director dropped a logo on the canvas. Read the image and
describe what you see, in chat. Proof of sight, not design critique.

### Procedure

1. Decode the dropped logo to a temp file via the bundled helper. The
   helper reads `.canvas-state/logo.json`, extracts and base64-decodes the
   dataUrl, and writes the bytes to a unique temp file — you do not need
   to touch the JSON yourself.

   ```bash
   LOGO_PATH=$(bun run "${CLAUDE_PLUGIN_ROOT}/scripts/canvas-decode-logo.ts" | head -1)
   ```

   **Do NOT use `python3`, `jq`, or any other JSON parser** to read
   `logo.json` yourself. Bun is the only runtime this spike ships.
   Falls back to `--project-root <path>` if `CLAUDE_PROJECT_DIR` isn't set.
2. Use the Read tool on `$LOGO_PATH` — multimodal sight, you can see
   the image.
3. Compose a 1–3 sentence description in chat. Include: the
   subject/mark, colors, type treatment if there is wordmark text,
   overall mood. Be specific enough that the user knows you actually
   looked.
4. Optionally end with a brief observation tying the visual to what
   you already know about the product, if anything coheres. *Don't
   fabricate.* If you can't connect them, don't try.
5. **After your chat description, POST acknowledgment** so the
   canvas reveals the Keep/Replace/Save controls. This is the canvas
   confirming that the "tell Raven about this" step is complete:

   ```bash
   BASE=$(bun run "${CLAUDE_PLUGIN_ROOT}/scripts/canvas-url.ts")
   curl -s -X POST "$BASE/api/canvas/logo/acknowledge"
   ```

   `canvas-url.ts` reads the live port from `.canvas-state/.server` so
   the URL stays correct when the spike's port resolution roams.

   Without this POST, the canvas withholds the action panel and
   keeps prompting the director to talk to you. So skipping it
   means they're stuck.

### What this play does not do

- **No design critique.** "It's clean," "it could be modernized,"
  "the kerning is off" — none of that. You're confirming sight, not
  acting as a creative director.
- **No second-guessing the choice.** The director picked this logo;
  it's not your call.
- **No purple prose.** A description, not a meditation.
- **No fabrication.** If you can't make out a detail, say so or omit
  it. Better to be brief than to invent.

## What this skill does not do

- Run the `/library` setup conversation. That's a separate skill — this
  one only executes plays the canvas requests.
- Decide what step the user is on.
- Propose next actions.
- Ask the user follow-up questions.
- Modify files in `docs/alexandria/cards/`, `docs/alexandria/sources/`,
  or any library content. (Real plays will; the echo play won't.)

When in doubt, do less. The canvas drives. You execute.
