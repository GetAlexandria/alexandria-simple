/**
 * Formatter for canvas-watcher.sh.
 *
 * Reads newline-delimited canvas step events from stdin (one JSON object per
 * line) and prints a human-readable summary to stdout. Replaces an earlier
 * inline python3 call so the watcher hot path stays on Bun — the same runtime
 * the canvas server already requires.
 *
 * Also coalesces consecutive identical step-save events. The canvas occasionally
 * fires two saves when the director double-clicks; without coalescing Raven
 * sees two wake notifications for the same intent.
 */

interface Event {
  type?: string;
  step?: string;
  nextStep?: string;
  slot?: string;
}

function summarize(ev: Event): string {
  const t = ev.type ?? "?";
  const s = ev.step ?? "?";
  if (t === "step-save") {
    const nxt = ev.nextStep || "(none)";
    return `  - Save on step ${s} -> advanced to ${nxt}`;
  }
  if (t === "step-complete") return `  - Step ${s} marked complete`;
  if (t === "review-request") {
    return `  - REVIEW REQUEST on step ${s} (do NOT advance — react only)`;
  }
  if (t === "ping") {
    return `  - PING on step ${s} (director hit Ping Raven — check in, do NOT advance)`;
  }
  if (t === "vision-section-help") {
    return `  - VISION SECTION HELP on slot ${ev.slot ?? "?"} (director moved slider to Build — run vision-elicitation skill on this slot, anchor in deep-guidance.md + examples.md, do NOT advance)`;
  }
  if (t === "vision-sources-handed") {
    return `  - VISION SOURCES HANDED (director pasted sources for Vision drafting — run vision-drafting skill)`;
  }
  if (t === "vision-banked") {
    return `  - VISION BANKED (director banked the Vision Statement — acknowledge + name what's next)`;
  }
  return `  - ${t} on step ${s}`;
}

// Coalesce consecutive identical events. Slot is part of the key so
// successive vision-section-help events on DIFFERENT slots stay
// distinct (only same-slot consecutive ones collapse).
function dedupeKey(ev: Event): string {
  return `${ev.type ?? ""}|${ev.step ?? ""}|${ev.nextStep ?? ""}|${ev.slot ?? ""}`;
}

const raw = await Bun.stdin.text();
let prevKey = "";
for (const line of raw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  let ev: Event;
  try {
    ev = JSON.parse(trimmed) as Event;
  } catch {
    continue;
  }
  const key = dedupeKey(ev);
  if (key === prevKey) continue;
  prevKey = key;
  console.log(summarize(ev));
}
