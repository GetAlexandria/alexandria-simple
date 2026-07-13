import { afterEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { journalDirForWorkspacePath } from "../domain/paths.js";
import { readColleagueJournals, parseJournalEntries } from "./colleague-journals.js";
import { NodeFileSystem } from "./filesystem.js";

const tempDirs = new Set<string>();

function makeWorkspacePath(): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "ax-journal-")));
  tempDirs.add(dir);
  return join(dir, "docs/alexandria");
}

function seedJournal(workspacePath: string, name: string, content: string): void {
  const dir = journalDirForWorkspacePath(workspacePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), content, "utf8");
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("parseJournalEntries", () => {
  test("extracts date-only and date-time headers, newest-first order preserved", () => {
    const entries = parseJournalEntries(
      [
        "# Raven's Journal",
        "",
        "## 2026-07-13 14:30 — third beat",
        "did a thing",
        "",
        "## 2026-07-13 — second beat",
        "",
        "## 2026-07-12 — seed entry",
        "scaffolding",
        "",
      ].join("\n"),
    );
    expect(entries.map((entry) => entry.timestamp)).toEqual([
      "2026-07-13 14:30",
      "2026-07-13",
      "2026-07-12",
    ]);
    expect(entries[0]!.title).toBe("third beat");
    expect(entries[2]!.title).toBe("seed entry");
  });

  test("ignores headers that do not lead with a date and non-header lines", () => {
    const entries = parseJournalEntries(
      ["## Notes", "## 2026-07-01 first", "some ## 2026-07-02 not a header", ""].join("\n"),
    );
    expect(entries.map((entry) => entry.timestamp)).toEqual(["2026-07-01"]);
  });

  test("a blank file yields no entries", () => {
    expect(parseJournalEntries("")).toEqual([]);
  });

  test("accepts a hyphen separator and a header with no title", () => {
    const entries = parseJournalEntries(["## 2026-07-01 - hyphen sep", "## 2026-07-02"].join("\n"));
    expect(entries[0]).toEqual({ timestamp: "2026-07-01", title: "hyphen sep", body: "" });
    expect(entries[1]).toEqual({ timestamp: "2026-07-02", title: "", body: "" });
  });

  test("captures each entry's body (lines up to the next dated header), trimmed", () => {
    const entries = parseJournalEntries(
      [
        "# Preamble",
        "not an entry",
        "",
        "## 2026-07-02 — newer",
        "",
        "the newer body",
        "second line",
        "",
        "## 2026-07-01 — older",
        "the older body",
      ].join("\n"),
    );
    expect(entries).toEqual([
      { timestamp: "2026-07-02", title: "newer", body: "the newer body\nsecond line" },
      { timestamp: "2026-07-01", title: "older", body: "the older body" },
    ]);
  });
});

describe("readColleagueJournals", () => {
  const read = (workspacePath: string) =>
    Effect.runPromise(
      readColleagueJournals({ workspacePath }).pipe(Effect.provide(NodeFileSystem)),
    );

  test("reads every colleague journal, skipping README and archives", async () => {
    const workspacePath = makeWorkspacePath();
    seedJournal(workspacePath, "raven.md", "## 2026-07-12 — seed entry\n");
    seedJournal(workspacePath, "damien.md", "## 2026-07-11 — beat\n## 2026-07-10 — older\n");
    seedJournal(workspacePath, "README.md", "# not a journal\n");
    seedJournal(workspacePath, "raven-archive-2025.md", "## 2025-01-01 — cold\n");

    const journals = await read(workspacePath);
    expect(journals.map((journal) => journal.colleague)).toEqual(["damien", "raven"]);
    expect(journals.find((journal) => journal.colleague === "damien")!.entries).toHaveLength(2);
    expect(journals.find((journal) => journal.colleague === "raven")!.entries[0]!.timestamp).toBe(
      "2026-07-12",
    );
  });

  test("a missing journal directory yields no journals (not an error)", async () => {
    const journals = await read(makeWorkspacePath());
    expect(journals).toEqual([]);
  });
});
