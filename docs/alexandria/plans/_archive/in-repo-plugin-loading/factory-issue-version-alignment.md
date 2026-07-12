# Plugin detects `ax` version skew and recommends `ax upgrade`

Status: **implemented directly 2026-07-02** (owner's call — implemented instead
of dispatching to the factory). The check lives in the shipped monitor
preamble, `packages/alexandria-plugin/scripts/claude-monitor.sh`. Decisions
frozen at implementation:

1. **Recommend, not auto-run** — a background monitor should not replace
   binaries; it names both versions and says `ax upgrade`.
2. **Exact equality**, gated on the payload `VERSION` file — installed payloads
   carry one, source checkouts (`claude --plugin-dir`) do not, so dev mode
   skips the check instead of nagging.
3. **Surfaced via the monitor preamble exiting 1 with the guidance message** —
   the same channel the original cryptic failure used, now self-diagnosing;
   exit 0 would surface nothing.

Verified against the matrix below (skew → guidance + exit 1; matched → monitor
runs; no VERSION → check skipped; ax missing / no config → silent exit 0).
The original issue draft follows for the record.

## Story

The Alexandria Claude plugin and the `ax` CLI ship as a version-matched pair,
but they can move independently after install: the Claude plugin marketplace
can auto-update the plugin payload, while nothing moves the machine's `ax`
binary with it. When they drift, the plugin's own tooling breaks — observed
2026-07-02: plugin 0.17.0 against `ax` 0.9.3 made the shipped event monitor
fail on session start (`Unknown subcommand: internal`, exit 1), with no hint to
the user about the cause or the fix.

A user whose plugin has moved ahead of `ax` should be told — or have it fixed —
the moment Alexandria notices, not discover it via a cryptic background
failure.

## What will be true when this is done

- When the loaded plugin's version differs from `ax version`, the user is
  surfaced a clear message naming both versions and the remedy (`ax upgrade`),
  at (or before) the first point the mismatch would break something.
- The shipped monitor (`scripts/claude-monitor.sh`) never fails with a raw
  unknown-subcommand error due to version skew: it detects the mismatch first
  and exits cleanly with the guidance message (or triggers the remedy).
- A matched pair produces no new noise (silent pass).
- `ax` missing entirely keeps today's behavior (monitor exits 0 silently).

## Decisions to freeze

1. **Recommend vs. auto-run:** does the plugin only surface "run `ax upgrade`",
   or run it automatically? (Lean: recommend; auto-run mutates binaries outside
   the session's intent.)
2. **Comparison strictness:** exact version equality, or minimum-`ax`-version
   compatibility (plugin declares the `ax` version it shipped with)?
3. **Surfacing point(s):** monitor preamble, session-start hook, and/or the
   existing update-check path.

## Verification sketch

| Scenario | Expected |
| --- | --- |
| plugin == ax version | no message, monitor runs |
| plugin > ax (the observed skew) | guidance message w/ both versions; no raw subcommand error |
| plugin < ax | per decision 2 (likely pass or soft note) |
| ax not on PATH | silent exit 0 (unchanged) |

## Context

- Root-cause session: `docs/alexandria/plans/in-repo-plugin-loading/plan.md`
  ("Keeping it in sync over time").
- The monitor already probes `command -v ax` in its preamble — the natural seam
  for the check.
