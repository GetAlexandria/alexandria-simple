/**
 * Parser for a play move-prompt's **contract** — the `consumes:` / `emits:`
 * frontmatter every prompt under `studio/plays/<slug>/prompts/` declares (see the
 * exemplar, frame-the-problem/prompts/locate.md). It is the play's
 * machine-readable **read/write boundary**:
 *
 *   ---
 *   move: locate
 *   doer: judgment
 *   consumes:
 *     - transcript: "__AX_INPUT_TRANSCRIPT__" (required — refuse without it)
 *     - target-spans: runtime/target-spans.md
 *   emits: runtime/target-spans.md — the thread boundary; or runtime/refusal-report.md
 *   ---
 *
 * Two consume kinds matter to the Play Testing surface:
 *   - **external inputs** — the `__AX_INPUT_<KEY>__` build-time placeholders the
 *     play is given (transcript, surface_map, …). These ground Preflight's
 *     "inputs are supplied" check (preflight.ts).
 *   - **runtime reads/writes** — `runtime/*.md` the moves pass between each other.
 *
 * Together the external inputs (reads) and the `emits` (writes) are the play's
 * **agency boundary**: it reads its declared inputs and writes only `runtime/*`.
 * That boundary is what Diagnostics renders (plan §6) — and the reason ADV-4
 * (excessive agency) / CHN-4 (tool-use) are not blanket "n/a": the moves do use
 * file tools, within a stated boundary.
 *
 * This module computes nothing and carries every string verbatim (the no-drift
 * contract). The frontmatter is intentionally loose YAML-ish (list items carry
 * inline parentheticals), so it is read line-by-line, not via a YAML parser.
 */

import { INPUT_PLACEHOLDER } from "./placeholders";

/** One external input a move consumes — an `__AX_INPUT_<KEY>__` placeholder. */
export interface InputRef {
  /** the input key, lower-cased, e.g. "transcript", "surface_map" */
  key: string;
  /** the placeholder token, verbatim, e.g. "__AX_INPUT_TRANSCRIPT__" */
  token: string;
  /** required unless the line marks it `optional` */
  required: boolean;
}

export interface PromptContract {
  /** the `move:` name, e.g. "locate" — `null` if absent */
  move: string | null;
  /** the `doer:` line, verbatim — `null` if absent */
  doer: string | null;
  /** external inputs the move reads (the `__AX_INPUT_*__` placeholders) */
  inputs: InputRef[];
  /** `runtime/*.md` files the move reads */
  reads: string[];
  /** `runtime/*.md` files the move writes (from `emits:`) */
  writes: string[];
}

// The external-input placeholder grammar lives in one shared home
// (`placeholders.ts`, citing the ax runtime substitutor): single-`AX_`,
// `__AX_INPUT_<KEY>__`. The `2?` tolerance for the dead `__AX2_` spelling is
// retired now the studio is migrated; the placeholder conformance gate keeps it
// from returning.
const RUNTIME_FILE = /runtime\/[\w-]+\.md/g;

/** Pull the YAML-ish frontmatter block (between the first two `---` fences). */
function frontmatter(text: string): string | null {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  return match != null ? (match[1] ?? "") : null;
}

const uniq = (xs: string[]): string[] => [...new Set(xs)];

/**
 * Parse a move-prompt's frontmatter into its contract. Returns an empty contract
 * (no move, no inputs) when the file carries no frontmatter — a prompt without a
 * declared contract reads as "nothing declared", never a thrown render.
 */
export function parsePromptContract(text: string): PromptContract {
  const front = frontmatter(text);
  if (front == null) {
    return { doer: null, inputs: [], move: null, reads: [], writes: [] };
  }

  const lines = front.split("\n");
  let move: string | null = null;
  let doer: string | null = null;
  const inputs: InputRef[] = [];
  const reads: string[] = [];
  const writes: string[] = [];

  let section: "consumes" | "emits" | null = null;
  for (const line of lines) {
    const moveMatch = /^move:\s*(.+)$/.exec(line);
    if (moveMatch != null) {
      move = (moveMatch[1] ?? "").trim();
      section = null;
      continue;
    }
    const doerMatch = /^doer:\s*(.+)$/.exec(line);
    if (doerMatch != null) {
      doer = (doerMatch[1] ?? "").trim();
      section = null;
      continue;
    }
    if (/^consumes:\s*$/.test(line)) {
      section = "consumes";
      continue;
    }
    const emitsInline = /^emits:\s*(.+)$/.exec(line);
    if (emitsInline != null) {
      section = "emits";
      writes.push(...((emitsInline[1] ?? "").match(RUNTIME_FILE) ?? []));
      continue;
    }
    if (/^emits:\s*$/.test(line)) {
      section = "emits";
      continue;
    }
    // A new top-level (non-indented, non-list) key ends the current section.
    if (/^[A-Za-z][\w-]*:/.test(line) && !line.startsWith(" ")) {
      section = null;
    }

    if (section === "consumes") {
      const token = INPUT_PLACEHOLDER.exec(line);
      if (token != null) {
        inputs.push({
          key: (token[1] ?? "").toLowerCase(),
          required: !/optional/i.test(line),
          token: token[0],
        });
      } else {
        reads.push(...(line.match(RUNTIME_FILE) ?? []));
      }
    } else if (section === "emits") {
      writes.push(...(line.match(RUNTIME_FILE) ?? []));
    }
  }

  return { doer, inputs, move, reads: uniq(reads), writes: uniq(writes) };
}
