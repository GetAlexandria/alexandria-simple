import { Effect } from "effect";
import { journalPathForWorkspacePath } from "../domain/paths.js";
import { FileSystem, isMissingFileError } from "./filesystem.js";

/**
 * Colleague journals — the append-at-top markdown files at
 * `<workspace>/journal/<name>.md` a colleague writes one entry to per duty
 * loop (see docs/alexandria/journal/README.md). This module is the read side
 * the Map tab's colleague overlay serves through `/api/colleague/<name>/journal`:
 * it reads the file and parses it into dated entries, newest first.
 *
 * The file is authored by hand and by agents, so parsing stays forgiving:
 * the H1 title + intro preamble above the first `## ` heading is dropped, and
 * a heading that is not `## <YYYY-MM-DD> — <title>` still yields an entry
 * (whole heading as the title, empty date) rather than being lost.
 */

/** One journal entry: its date heading, title, and body prose. */
export interface JournalEntry {
  /** ISO date parsed from the heading, or "" when the heading carries none. */
  date: string;
  title: string;
  body: string;
}

/** A colleague's parsed journal (entries newest-first, matching file order). */
export interface ColleagueJournal {
  name: string;
  entries: JournalEntry[];
}

const HEADING_LINE = /^##\s+(.*)$/;
// A leading ISO date, then an optional em-dash / en-dash / hyphen separator,
// then the title. `\b` keeps `2026-07-12` from swallowing a following word.
const DATED_HEADING = /^(\d{4}-\d{2}-\d{2})\b[ \t]*[—–-]?[ \t]*(.*)$/;

function parseHeading(headingText: string): { date: string; title: string } {
  const dated = DATED_HEADING.exec(headingText);
  if (dated != null) {
    return { date: dated[1]!, title: dated[2]!.trim() };
  }
  return { date: "", title: headingText };
}

/**
 * Split journal markdown into entries on its `## ` headings, in file order
 * (append-at-top files keep newest first, so the caller's "top N" is a head
 * slice, never a re-sort). Content above the first heading is the file's
 * preamble and is not an entry.
 */
export function parseJournalEntries(markdown: string): JournalEntry[] {
  const entries: JournalEntry[] = [];
  let current: { headingText: string; bodyLines: string[] } | null = null;

  const flush = (): void => {
    if (current == null) {
      return;
    }
    const { date, title } = parseHeading(current.headingText);
    entries.push({ date, title, body: current.bodyLines.join("\n").trim() });
    current = null;
  };

  for (const line of markdown.split(/\r?\n/)) {
    const heading = HEADING_LINE.exec(line);
    if (heading != null) {
      flush();
      current = { headingText: heading[1]!.trim(), bodyLines: [] };
    } else if (current != null) {
      current.bodyLines.push(line);
    }
    // Lines before the first `## ` heading are the preamble — ignored.
  }
  flush();

  return entries;
}

/**
 * Reads and parses a colleague's journal. A missing file is not an error: a
 * colleague with no journal yet (e.g. Damien before his first entry) returns
 * empty entries, mirroring `readMapState`'s missing-file→default posture. An
 * invalid `name` (rejected by `journalPathForWorkspacePath`) fails the effect
 * so the route can answer 400 rather than reading an arbitrary path.
 */
export function readColleagueJournal(options: {
  name: string;
  workspacePath: string;
}): Effect.Effect<ColleagueJournal, Error, FileSystem> {
  return Effect.gen(function* () {
    const journalPath = journalPathForWorkspacePath(options.workspacePath, options.name);
    if (journalPath instanceof Error) {
      return yield* Effect.fail(journalPath);
    }

    const fs = yield* FileSystem;
    const content = yield* fs
      .readText(journalPath)
      .pipe(
        Effect.catchAll((error) =>
          isMissingFileError(error) ? Effect.succeed<string | null>(null) : Effect.fail(error),
        ),
      );

    return {
      name: options.name,
      entries: content == null ? [] : parseJournalEntries(content),
    };
  });
}
