#!/usr/bin/env bash
# canvas-watcher.sh — asyncRewake hook for the /canvasdemo experience.
#
# Polled by Claude Code as a Stop-event hook (configured in
# hooks/hooks.json at the plugin root). When the director hits Save in the
# browser,
# the canvas server appends a step-save event to step-events.jsonl.
# This script notices, prints a summary, and exits 2 — which is the
# signal Claude Code uses to wake the model with the script's stdout
# as a system reminder. Raven then reads canvas state and reacts.
#
# First run on a fresh session records the current event-line count
# as "already seen" so old events from prior sessions don't trigger
# a spurious wake.

set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-${PWD}}"
STATE_DIR="$PROJECT_DIR/docs/alexandria/.canvas-state"
EVENTS_FILE="$STATE_DIR/step-events.jsonl"
SEEN_FILE="$STATE_DIR/.watcher-seen-line"
SERVER_FILE="$STATE_DIR/.server"
LOCK_FILE="$STATE_DIR/.watcher.lock"
FORMATTER="$(cd "$(dirname "$0")" && pwd)/canvas-format-events.ts"

# Plugin-level hook: this script runs after every Raven Stop event in EVERY
# project that has the alexandria plugin enabled. Bail immediately unless
# there's an active canvas session in this project — otherwise we'd burn a
# 600s background wait per turn in unrelated work.
#
# Two gates:
#   1. State dir exists (canvasdemo was set up here at some point).
#   2. .server file exists AND its PID is alive (canvas server is actually
#      running, so events can fire). Closes the "ran canvasdemo earlier,
#      moved on" case where the state dir lingers but no live server can
#      ever write events.
if [ ! -d "$STATE_DIR" ]; then
  exit 0
fi
if [ ! -f "$SERVER_FILE" ]; then
  exit 0
fi
# Extract pid from the JSON-formatted .server file. Pretty-printed by
# canvas-server.ts as `  "pid": 12345,` on its own line — pull the integer
# without spawning a JSON parser.
SERVER_PID=$(grep -o '"pid"[[:space:]]*:[[:space:]]*[0-9]\+' "$SERVER_FILE" 2>/dev/null | grep -o '[0-9]\+$' | head -1)
if [ -z "${SERVER_PID:-}" ] || ! kill -0 "$SERVER_PID" 2>/dev/null; then
  exit 0
fi

# Single-watcher lock. Every Raven turn-end fires a fresh Stop hook → a
# fresh watcher process. Without serialization, three watchers polling
# concurrently all see the SAME new event and all exit 2 → the director
# gets three identical wake notifications for one Save click. Bash's
# noclobber pattern gives us atomic file create as a portable mutex
# (macOS doesn't ship `flock(1)`). Lockfile carries the owning PID so a
# hard-killed watcher's stale lock can be reclaimed by the next one.
acquire_watcher_lock() {
  if [ -f "$LOCK_FILE" ]; then
    local owner
    owner=$(cat "$LOCK_FILE" 2>/dev/null)
    if [ -n "$owner" ] && kill -0 "$owner" 2>/dev/null; then
      return 1
    fi
    # Stale lock — owner is gone; reclaim.
    rm -f "$LOCK_FILE"
  fi
  ( set -o noclobber; echo "$$" >"$LOCK_FILE" ) 2>/dev/null
}
if ! acquire_watcher_lock; then
  exit 0
fi
# EXIT runs on any termination; INT/TERM/HUP need an explicit exit because
# bash's default trap behavior is "run handler then continue" — without the
# exit, the trap fires but the polling loop resumes and the watcher never
# dies. EXIT cleans up the lockfile no matter how we got here.
trap 'rm -f "$LOCK_FILE"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

# How long to wait for an event before giving up quietly. The demo
# flow involves the director walking the canvas (typing, dragging
# sliders, opening Vision Builder) for stretches while Raven sits
# idle in chat. 10 minutes was too tight — Raven would silently
# stop watching mid-demo. 30 minutes covers a typical onboarding
# walkthrough. New Stop hooks still spawn fresh watchers, so the
# cost of widening is only that one watcher process lingers longer.
TIMEOUT_SECONDS=1800
POLL_INTERVAL=1

# Count newline bytes rather than `wc -l`, which undercounts a file whose
# last line lacks a trailing newline. Today every appender includes "\n",
# but counting bytes makes the watcher robust to a future appender that
# forgets one.
count_lines() {
  if [ -f "$1" ]; then
    tr -cd '\n' < "$1" | wc -c | tr -d ' '
  else
    echo "0"
  fi
}

# On first run we want to skip any events that existed before the
# session started — we only want to react to NEW saves.
if [ -f "$SEEN_FILE" ]; then
  SEEN_LINES=$(cat "$SEEN_FILE")
else
  mkdir -p "$STATE_DIR"
  SEEN_LINES=$(count_lines "$EVENTS_FILE")
  echo "$SEEN_LINES" > "$SEEN_FILE"
fi

START_TS=$(date +%s)
while true; do
  CURRENT_LINES=$(count_lines "$EVENTS_FILE")

  if [ "$CURRENT_LINES" -gt "$SEEN_LINES" ]; then
    NEW_COUNT=$((CURRENT_LINES - SEEN_LINES))
    NEW_EVENTS=$(tail -n "$NEW_COUNT" "$EVENTS_FILE")
    echo "$CURRENT_LINES" > "$SEEN_FILE"

    # Classify the events. Four kinds of "react but don't advance"
    # signals (vision-section-help, review-request, ping) vs the
    # regular step-save flow.
    HAS_SECTION_HELP=$(echo "$NEW_EVENTS" | grep -c '"type":"vision-section-help"' || true)
    HAS_REVIEW=$(echo "$NEW_EVENTS" | grep -c '"type":"review-request"' || true)
    HAS_PING=$(echo "$NEW_EVENTS" | grep -c '"type":"ping"' || true)
    HAS_SAVE=$(echo "$NEW_EVENTS" | grep -c '"type":"step-save"' || true)

    echo "The director just acted on the canvas. New event(s):"
    # canvas-format-events.ts parses each line and coalesces consecutive
    # duplicate step-save events (double-click → two events for the same save).
    echo "$NEW_EVENTS" | bun run "$FORMATTER" || true
    echo
    echo "Read the relevant state files under $STATE_DIR and react in chat."
    if [ "$HAS_SECTION_HELP" -gt 0 ] && [ "$HAS_SAVE" -eq 0 ]; then
      echo "This is a VISION SECTION HELP request — the director moved a"
      echo "Vision Builder slot's slider to Build (1), explicitly asking for"
      echo "elicitation on that slot. Run the vision-elicitation skill at"
      echo "skills/raven/vision-elicitation.md. Read the per-slot section in"
      echo "product-library/vision-docs/deep-guidance.md AND examples.md"
      echo "BEFORE responding substantively. Anchor in the pegs (Job,"
      echo "Diagnostic test, Failure modes, Pattern); do not free-style. One"
      echo "focused message. DO NOT advance the rail. DO NOT change the notch."
    elif [ "$HAS_PING" -gt 0 ] && [ "$HAS_SAVE" -eq 0 ]; then
      echo "This is a PING — the director hit the Ping Raven button to ask for"
      echo "your input where they are. Read the current canvas state for the"
      echo "step they're on (GET /api/canvas/<step>), summarize where things"
      echo "stand + what you've noticed, and ask what's needed. One short"
      echo "message — DO NOT deliver the next Beat. DO NOT call /api/canvas/save."
    elif [ "$HAS_REVIEW" -gt 0 ] && [ "$HAS_SAVE" -eq 0 ]; then
      echo "This is a REVIEW REQUEST — react to what the director changed, share your"
      echo "perspective, suggest revisions if useful. DO NOT deliver the next Beat."
      echo "DO NOT call /api/canvas/save or propose advancement."
    else
      echo "Follow skills/canvasdemo/SKILL.md for which Beat to deliver next."
    fi
    exit 2
  fi

  NOW=$(date +%s)
  ELAPSED=$((NOW - START_TS))
  if [ "$ELAPSED" -ge "$TIMEOUT_SECONDS" ]; then
    exit 0
  fi

  sleep "$POLL_INTERVAL"
done
