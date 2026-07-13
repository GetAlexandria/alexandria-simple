import { Effect } from "effect";
import { journalDirForWorkspacePath, journalPathForWorkspacePath } from "../domain/paths.js";
import { type DirectoryEntry, FileSystem, isMissingFileError } from "./filesystem.js";

/**
 * Colleague journals — the read-only data path the Map tab's system-health
 * and overdue signals (Map tab plan §1.4, L1) derive from. A colleague's
 * duty-loop journal lives at `docs/alexandria/journal/<name>.md`
 * (`docs/alexandria/journal/README.md` describes the format): append-at-top,
 * one entry per beat under a `## <timestamp> — <title>` header. Nothing here
 * writes: the map is a pure lens over these files, and L1 adds no state.
 *
 * The server extracts each entry's leading timestamp from its header; the
 * viewer's `map/signals.ts` turns those timestamps + an entity's cadence into
 * health dots and the overdue flicker. Keeping the header parse here (rather
 * than shipping raw markdown to the browser) bounds the payload and lets the
 * ax suite pin the parse against hand-crafted journal fixtures, while the
 * health derivation stays a pure, separately-tested viewer function.
 */

/** One parsed journal entry: its timestamp, title, and body prose. */
export interface JournalEntry {
  /**
   * The entry timestamp exactly as written in the header (e.g. `2026-07-12`
   * or `2026-07-12 14:30`). Left as the source string — the viewer parses it
   * to a Date so date-only and date-time headers both flow through one path.
   */
  timestamp: string;
  /** The header text after the timestamp (and any `—`/`-` separator). */
  title: string;
  /**
   * The entry's body (the lines under its header up to the next entry),
   * trimmed. Empty for a header-only beat. L1's signals ignore it; L2's
   * colleague overlay renders it.
   */
  body: string;
}

export interface ColleagueJournal {
  colleague: string;
  /** Entries newest-first, as the append-at-top file already orders them. */
  entries: JournalEntry[];
}

// A journal entry is a level-2 heading whose text starts with an ISO-ish
// date (`YYYY-MM-DD`), optionally followed by a time. Anything after the
// timestamp (past an optional em-dash/hyphen separator) is the title. Headers
// without a leading date (a stray `## Notes`) are not duty-loop beats and are
// skipped, so a hand-written aside never counts as a journal entry.
const ENTRY_HEADER =
  /^##\s+(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?)?)\s*(?:[—-]\s*)?(.*)$/;

/**
 * Parses a journal markdown file into its entries (newest-first, as written).
 * Pure and total: a missing/blank file yields no entries; only `##` headers
 * that lead with a date open an entry, so a stray heading or the file preamble
 * never becomes its own beat. Each entry's body is the lines under its header
 * up to the next dated header (trimmed) — carried for L2's colleague overlay.
 */
export function parseJournalEntries(markdown: string): JournalEntry[] {
  const entries: JournalEntry[] = [];
  let current: { timestamp: string; title: string; bodyLines: string[] } | null = null;

  const flush = (): void => {
    if (current == null) {
      return;
    }
    entries.push({
      timestamp: current.timestamp,
      title: current.title,
      body: current.bodyLines.join("\n").trim(),
    });
    current = null;
  };

  for (const rawLine of markdown.split("\n")) {
    const match = ENTRY_HEADER.exec(rawLine.trim());
    if (match != null) {
      flush();
      current = { timestamp: match[1]!, title: match[2]!.trim(), bodyLines: [] };
    } else if (current != null) {
      current.bodyLines.push(rawLine);
    }
    // Lines before the first dated header are the file preamble — not an entry.
  }
  flush();

  return entries;
}

/** Files in the journal dir that are not colleague journals. */
function isColleagueJournalFile(name: string): boolean {
  if (!name.endsWith(".md")) {
    return false;
  }
  const base = name.slice(0, -".md".length);
  // README is documentation; `<name>-archive-<year>.md` holds cold history the
  // hot file already supersedes for a recency signal (journal README).
  return base.toLowerCase() !== "readme" && !/-archive-\d{4}$/.test(base);
}

/**
 * Reads every colleague journal under `docs/alexandria/journal/`. A missing
 * directory is not an error — it returns no journals (a project that has not
 * seeded any colleague journal yet). Each file is parsed into its entry
 * headers; the colleague id is the filename without `.md`. Read-only.
 */
export function readColleagueJournals(options: {
  workspacePath: string;
}): Effect.Effect<ColleagueJournal[], Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const journalDir = journalDirForWorkspacePath(options.workspacePath);
    const dirEntries = yield* fs
      .readDirectory(journalDir)
      .pipe(
        Effect.catchAll((error) =>
          isMissingFileError(error) ? Effect.succeed<DirectoryEntry[]>([]) : Effect.fail(error),
        ),
      );

    const colleagues = dirEntries
      .filter((entry) => entry.type === "file" && isColleagueJournalFile(entry.name))
      .map((entry) => entry.name.slice(0, -".md".length))
      .sort();

    const journals: ColleagueJournal[] = [];
    for (const colleague of colleagues) {
      const content = yield* fs
        .readText(journalPathForWorkspacePath(options.workspacePath, colleague))
        .pipe(
          Effect.catchAll((error) =>
            isMissingFileError(error) ? Effect.succeed<string | null>(null) : Effect.fail(error),
          ),
        );
      if (content == null) {
        continue;
      }
      journals.push({ colleague, entries: parseJournalEntries(content) });
    }
    return journals;
  });
}
